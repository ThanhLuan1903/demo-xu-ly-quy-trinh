// app/processes/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Download, ExternalLink, FileSpreadsheet, File } from "lucide-react"

interface Process {
  id: string
  title: string
  description: string
  version: string
  steps: string[]
  category: string
  tags: string[]
  effective_date: string
}

interface ProcessForm {
  id: string
  process_id: string
  title: string
  description: string
  filename?: string
  external_link?: string
  file_type: "pdf" | "docx" | "xlsx" | "link"
  uploaded_by: string
  uploaded_at: string
  size?: number
}

export default function ProcessDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [process, setProcess] = useState<Process | null>(null)
  const [forms, setForms] = useState<ProcessForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quy trình
        const procRes = await fetch("http://localhost:3001/procurement_processes")
        const processes = await procRes.json()
        const foundProcess = processes.find((p: Process) => p.id === params.id)
        setProcess(foundProcess)

        // Fetch biểu mẫu liên quan đến quy trình này
        const formsRes = await fetch("http://localhost:3001/process_forms")
        const allForms = await formsRes.json()
        const relatedForms = allForms.filter((f: ProcessForm) => f.process_id === params.id)
        console.log("relatedForms", relatedForms);

        // Gắn thêm thông tin file giả lập để đẹp UI (có thể thay bằng thật sau)
        const enrichedForms = relatedForms.map((form: ProcessForm) => ({
          ...form,
          filename: form.filename ? form.filename : form.external_link,
          size: form.external_link ? null : Math.floor(Math.random() * 900 + 100)
        }))

        setForms(enrichedForms)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchData()
  }, [params.id])


  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <File className="w-5 h-5 text-red-600" />
      case "docx": return <FileText className="w-5 h-5 text-blue-600" />
      case "xlsx": return <FileSpreadsheet className="w-5 h-5 text-green-600" />
      case "link": return <ExternalLink className="w-5 h-5 text-purple-600" />
      default: return <File className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <ProtectedLayout requiredRole="reporter">
        <div className="p-8 text-center">Đang tải quy trình...</div>
      </ProtectedLayout>
    )
  }

  if (!process) {
    return (
      <ProtectedLayout requiredRole="reporter">
        <div className="p-8 text-center text-red-600">Không tìm thấy quy trình</div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <Button onClick={() => router.back()} variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>

          <Card className="p-8 border-0 shadow-xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-3">{process.title}</h1>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary">{process.category}</Badge>
                    <Badge variant="outline">Phiên bản {process.version}</Badge>
                    <Badge variant="outline">Có hiệu lực từ {new Date(process.effective_date).toLocaleDateString("vi-VN")}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">{process.description}</p>
            </div>

            {/* Steps */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Các bước thực hiện</h2>
              <ol className="space-y-4">
                {process.steps.map((step, index) => (
                  <li key={index} className="flex gap-5 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 text-lg pt-1.5 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Forms */}
            <div className="pt-8 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Biểu mẫu liên quan ({forms.length})
              </h2>

              {forms.length === 0 ? (
                <p className="text-slate-500 italic py-8 text-center">Chưa có biểu mẫu đính kèm cho quy trình này.</p>
              ) : (
                <div className="grid gap-4">
                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-4">
                        {getFileIcon(form.file_type)}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{form.title}</p>
                          <p className="text-sm text-slate-500">
                            {form.file_type === "link" ? "Liên kết ngoài" : `${form.filename} • ${form.size} KB`}
                          </p>
                          {form.description && <p className="text-xs text-slate-400 mt-1">{form.description}</p>}
                        </div>
                      </div>

                      <Button
  size="sm"
  variant={form.file_type === "link" ? "default" : "outline"}
  asChild // QUAN TRỌNG: biến Button thành <a> nhưng vẫn giữ style đẹp
  className="ml-4"
>
  {form.file_type === "link" ? (
    <a href={form.external_link!} target="_blank" rel="noopener noreferrer">
      <ExternalLink className="w-4 h-4 mr-2" />
      Truy cập
    </a>
  ) : (
    <a
      href={`/uploads/${form.filename}`}           // file thật nằm trong public/uploads
      download={form.filename}                     // BẮT BUỘC tải về thay vì mở trên trình duyệt
      className="flex items-center"
    >
      <Download className="w-4 h-4 mr-2" />
      Tải xuống
    </a>
  )}
</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}