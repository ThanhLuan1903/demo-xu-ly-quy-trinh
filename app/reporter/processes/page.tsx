"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card } from "@/components/ui/card"
import { BookOpen, ArrowRight } from "lucide-react"

interface Process {
  id: string
  title: string
  description: string
  version: string
  steps: string[]
  tags: string[]
}

export default function ProcessesPage() {
  const router = useRouter()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProcesses()
  }, [])

  const fetchProcesses = async () => {
    try {
      const response = await fetch("http://localhost:3001/procurement_processes")
      const data = await response.json()
      // console.log("data process", data);
      setProcesses(data)
    } catch (error) {
      console.error("Failed to fetch processes:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              Quy trình mua sắm
            </h1>
            <p className="text-slate-600">Xem chi tiết tất cả quy trình mua sắm hiện có</p>
          </div>

          {/* Processes Grid */}
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {processes.map((process) => (
                <Card
                  key={process.id}
                  onClick={() => router.push(`/reporter/processes/${process.id}`)}
                  className="p-6 hover:shadow-lg transition cursor-pointer border-0 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{process.title}</h3>
                      <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-fit">{process.version}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition" />
                  </div>

                  <p className="text-slate-600 text-sm mb-4">{process.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Bước</p>
                        <p className="font-semibold text-slate-900">{process.steps.length}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tags</p>
                        <p className="font-semibold text-slate-900">{process.tags.length}</p>
                      </div>
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
