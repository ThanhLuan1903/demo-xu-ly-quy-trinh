"use client"

import { useEffect, useState } from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Incident {
  id: string
  title: string
  priority: string
  status: string
  created_at: string
  facility_id: string
}

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      const data = await response.json()
      setIncidents(data)
    } catch (error) {
      console.error("Failed to fetch incidents:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: "Quy trình mua sắm", value: "3", change: "+12% so với tháng trước", icon: "📋", bgColor: "bg-blue-50" },
    {
      label: "Sự cố mới",
      value: incidents.filter((i) => i.status === "new").length.toString(),
      change: "",
      icon: "⚠️",
      bgColor: "bg-orange-50",
    },
    {
      label: "Đã xử lý",
      value: incidents.filter((i) => i.status === "resolved").length.toString(),
      change: "",
      icon: "✅",
      bgColor: "bg-green-50",
    },
    {
      label: "Khẩn cấp",
      value: incidents.filter((i) => i.priority === "critical").length.toString(),
      change: "",
      icon: "🔴",
      bgColor: "bg-red-50",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-purple-100 text-purple-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tổng quan hệ thống</h1>
            <p className="text-slate-600">Quản lý quy trình mua sắm và phân ánh sự cố</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <Card key={idx} className={`p-6 ${stat.bgColor} border-0`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    {stat.change && <p className="text-xs text-green-600">{stat.change}</p>}
                  </div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="gap-8">
            {/* Recent Incidents */}
            <div className="">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Sự cố gần đây</h2>
                <Button
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent"
                >
                  Xem tất cả
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <div className="space-y-4">
                  {incidents.slice(0, 5).map((incident) => (
                    <Card key={incident.id} className="p-6 hover:shadow-md transition cursor-pointer border-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{incident.title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}
                            >
                              {incident.status}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(incident.priority)}`}
                            >
                              {incident.priority}
                            </span>
                            <span className="text-xs text-slate-500 ml-auto">
                              {new Date(incident.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Procurement Processes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Quy trình mua sắm</h2>
                <Button
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm bg-transparent"
                >
                  Xem tất cả
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Mua trực tiếp • v2.0", icon: "📋", count: "2 biểu mẫu" },
                  { title: "Đấu thầu rộng rãi", icon: "📋", count: "2 biểu mẫu" },
                  { title: "Thuê thiết bị", icon: "📋", count: "1 biểu mẫu" },
                ].map((proc, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition cursor-pointer border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm mb-1">{proc.title}</p>
                        <p className="text-xs text-slate-500">{proc.count}</p>
                      </div>
                      <span className="text-lg">{proc.icon}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
