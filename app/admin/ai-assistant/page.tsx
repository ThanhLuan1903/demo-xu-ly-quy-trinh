"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { Card } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function AIAssistantPage() {
  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              AI Trợ lý quản lý
            </h1>
            <p className="text-slate-600">Công cụ AI để hỗ trợ quản lý quy trình và sự cố</p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Phân tích xu hướng</h3>
              <p className="text-slate-600 text-sm mb-4">AI phân tích các xu hướng sự cố và đưa ra khuyến nghị.</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600">
                  Sự cố quy trình này xuất hiện 15 lần trong tháng, tăng 40% so với tháng trước.
                </p>
              </div>
            </Card>

            <Card className="p-6 border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gợi ý tự động</h3>
              <p className="text-slate-600 text-sm mb-4">AI tự động gợi ý quy trình phù hợp dựa trên sự cố.</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600">
                  Sự cố này liên quan đến quy trình 'Mua trực tiếp'. Xem chi tiết?
                </p>
              </div>
            </Card>

            <Card className="p-6 border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Phân loại tự động</h3>
              <p className="text-slate-600 text-sm mb-4">AI tự động phân loại sự cố theo độ ưu tiên.</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600">30 sự cố phân loại tự động hôm nay, độ chính xác 94%</p>
              </div>
            </Card>

            <Card className="p-6 border-0">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Báo cáo thông minh</h3>
              <p className="text-slate-600 text-sm mb-4">AI tạo báo cáo tóm tắt các vấn đề chính.</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600">
                  Báo cáo tuần: 45 sự cố, 38 đã giải quyết, thời gian trung bình: 4 giờ
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
