"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Shield } from "lucide-react"

const users = [
  {
    id: "1",
    name: "Nguyễn Văn Admin",
    email: "admin@example.com",
    role: "Admin",
    facility: "Trụ số chính",
    created: "2024-01-01",
  },
  {
    id: "2",
    name: "Trần Thị Reporter",
    email: "reporter@example.com",
    role: "Reporter",
    facility: "Trụ số chính",
    created: "2024-01-02",
  },
  {
    id: "3",
    name: "Phạm Văn Kiên",
    email: "kiên.pv@example.com",
    role: "Reporter",
    facility: "Nhà máy Bình Dương",
    created: "2024-02-10",
  },
]

export default function UsersPage() {
  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý người dùng</h1>
              <p className="text-slate-600">Quản lý và phân quyền cho các thành viên hệ thống</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>

          {/* Users Table */}
          <Card className="p-6 border-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Tên</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Vai trò</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Cơ sở</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Ngày tạo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-900 text-sm">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "Admin" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{user.facility}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm">{user.created}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  )
}
