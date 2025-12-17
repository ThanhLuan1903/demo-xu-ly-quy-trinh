"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import type { ProcessRow } from "@/app/types/process"
import { LoadingSpinner } from "@/components/loading"

export default function ProcurementPage() {
  const router = useRouter()
  const [processes, setProcesses] = useState<ProcessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchProcesses = async (q = "") => {
    try {
      setLoading(true)
      const res = await fetch(`/api/processes?q=${encodeURIComponent(q)}`, { cache: "no-store" })
      const data = await res.json()
      setProcesses(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setProcesses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProcesses("")
  }, [])

  useEffect(() => {
    const t = setTimeout(() => fetchProcesses(searchTerm), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  const filtered = useMemo(() => processes, [processes])

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Quy trình</h1>
            <p className="text-slate-600">Danh mục quy trình và xem chi tiết dạng bảng</p>
          </div>

          {loading ? (
            <LoadingSpinner size={32} />
          ) : filtered.length === 0 ? (
            <Card className="p-6 border-0">
              <p className="text-slate-600">Chưa có quy trình.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((p) => (
                <Card key={p.id} className="p-6 border-0 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                          {p.code}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          v{p.version}
                        </span>
                      </div>
                      {p.description ? (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.description}</p>
                      ) : (
                        <p className="text-sm text-slate-500 mt-2">Không có mô tả</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/reporter/procurement/${p.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}
