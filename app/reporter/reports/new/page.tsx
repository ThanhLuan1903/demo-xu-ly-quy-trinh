"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, X } from "lucide-react"

type User = {
  id: string
  name: string
  role: string
  facility_id: string
}

type PreviewItem = {
  id: string
  file: File
  url: string
  kind: "image" | "video" | "file"
}

export default function NewReportPage() {
  const router = useRouter()

  const [me, setMe] = useState<User | null>(null)
  const [admins, setAdmins] = useState<User[]>([])
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    proposed_fix: "",
    priority: "medium",
    assigned_to: "", // ✅ admin
  })

  // ✅ load current user from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        setMe(JSON.parse(raw))
      } catch {
        setMe(null)
      }
    }
  }, [])

  // ✅ load admins for assignment
  useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/users?role=admin")
      const data = await res.json()
      setAdmins(data || [])
      // auto pick first admin if not set
      if (data?.length && !formData.assigned_to) {
        setFormData((p) => ({ ...p, assigned_to: data[0].id }))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // clean object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPickFiles = (files: FileList | null) => {
    if (!files) return

    const list = Array.from(files).map((file) => {
      const mime = file.type || ""
      const kind: PreviewItem["kind"] =
        mime.startsWith("image/") ? "image" : mime.startsWith("video/") ? "video" : "file"

      return {
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        kind,
      }
    })

    setPreviews((prev) => [...prev, ...list])
  }

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!me) return alert("Chưa đăng nhập (không có user trong localStorage)")

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("title", formData.title)
      fd.append("description", formData.description)
      fd.append("proposed_fix", formData.proposed_fix)
      fd.append("priority", formData.priority)
      fd.append("assigned_to", formData.assigned_to)

      // ✅ server yêu cầu lấy theo user đăng nhập
      fd.append("reporter_id", me.id)
      fd.append("facility_id", me.facility_id)

      // ✅ attach files
      previews.forEach((p) => fd.append("attachments", p.file))

      const res = await fetch("/api/incidents", {
        method: "POST",
        body: fd, // ✅ multipart
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err?.error || "Gửi báo cáo thất bại")
        return
      }

      router.push("/reporter/reports")
    } catch (error) {
      console.error(error)
      alert("Có lỗi khi gửi báo cáo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Báo cáo sự cố mới</h1>
              <p className="text-slate-600 text-sm mt-1">Cung cấp thông tin chi tiết về sự cố</p>
            </div>
          </div>

          <Card className="p-8 border-0 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Tiêu đề sự cố</label>
                <Input
                  required
                  placeholder="Mô tả ngắn gọn sự cố"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Mô tả chi tiết</label>
                <textarea
                  required
                  placeholder="Cung cấp thông tin chi tiết về sự cố..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Đề xuất cách khắc phục</label>
                <textarea
                  placeholder="Nêu đề xuất hướng khắc phục / xử lý tạm thời..."
                  value={formData.proposed_fix}
                  onChange={(e) => setFormData({ ...formData, proposed_fix: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Độ ưu tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="critical">Khẩn cấp</option>
                  </select>
                </div>

                {/* ✅ REPLACE facility select by admin assignment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Người xử lý (Admin)</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  >
                    {admins.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Tệp đính kèm</label>

                <label
                  htmlFor="attachments"
                  className="block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Kéo thả tệp hoặc nhấp để chọn (nhiều tệp)</p>
                </label>

                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => onPickFiles(e.target.files)}
                  className="hidden"
                />

                {/* ✅ Preview list */}
                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {previews.map((p) => (
                      <div key={p.id} className="relative border rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => removePreview(p.id)}
                          className="absolute top-2 right-2 z-10 bg-white/90 border rounded-full p-1"
                          title="Xóa"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          className="block w-full"
                          onClick={() => window.open(p.url, "_blank")}
                          title="Nhấn để xem"
                        >
                          {p.kind === "image" && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.url} alt={p.file.name} className="w-full h-32 object-cover" />
                          )}
                          {p.kind === "video" && (
                            <video src={p.url} className="w-full h-32 object-cover" />
                          )}
                          {p.kind === "file" && (
                            <div className="p-3 text-xs text-slate-700">{p.file.name}</div>
                          )}
                        </button>

                        <div className="p-2 text-xs text-slate-600 truncate">{p.file.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {loading ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
                <Button type="button" onClick={() => router.back()} variant="outline" className="flex-1">
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
