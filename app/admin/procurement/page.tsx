"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

interface Process {
  id: string
  title: string
  category: string
  description: string
  steps: string[]
  tags: string[]
  version: string
}

export default function ProcurementPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: "", category: "", description: "", version: "" })

  useEffect(() => {
    fetchProcesses()
  }, [])

  const fetchProcesses = async () => {
    try {
      const response = await fetch("/api/processes")
      const data = await response.json()
      setProcesses(data)
    } catch (error) {
      console.error("Failed to fetch processes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProcess = () => {
    if (formData.title && formData.category) {
      const newProcess = {
        id: Date.now().toString(),
        ...formData,
        steps: [],
        tags: [],
        created_at: new Date().toISOString(),
      }
      setProcesses([...processes, newProcess])
      setFormData({ title: "", category: "", description: "", version: "" })
      setShowForm(false)
    }
  }

  const handleDeleteProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const filteredProcesses = processes.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý Quy trình Mua sắm</h1>
            <p className="text-slate-600">Tạo, chỉnh sửa và quản lý các quy trình mua sắm</p>
          </div>

          {/* Search and Add */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-64 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Tìm quy trình..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Quy trình
            </Button>
          </div>

          {/* Add Form */}
          {showForm && (
            <Card className="p-6 mb-6 border-0 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Thêm Quy trình Mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Tên quy trình"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-slate-300"
                />
                <Input
                  placeholder="Danh mục"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="border-slate-300"
                />
                <Input
                  placeholder="Phiên bản"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="border-slate-300"
                />
              </div>
              <textarea
                placeholder="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-4 p-2 border border-slate-300 rounded-lg"
                rows={3}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddProcess} className="bg-blue-600 hover:bg-blue-700">
                  Lưu
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline">
                  Hủy
                </Button>
              </div>
            </Card>
          )}

          {/* Processes List */}
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProcesses.map((process) => (
                <Card key={process.id} className="p-6 hover:shadow-md transition border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{process.title}</h3>
                      <p className="text-sm text-slate-600 mb-3">{process.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {process.category}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">
                          {process.version}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteProcess(process.id)}
                      >
                        <Trash2 className="w-4 h-4" />
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
