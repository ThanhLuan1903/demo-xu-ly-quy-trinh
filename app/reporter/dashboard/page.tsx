"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, FileText, Eye } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
}
const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as {
      id: string;
      role: "admin" | "reporter";
      facility_id: string;
      name?: string;
    };
  } catch {
    return null;
  }
};

export default function ReporterDashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);
  const user = getCurrentUser();
  if (!user?.facility_id) {
    console.warn("Missing facility_id");
    return;
  }
  const fetchIncidents = async () => {
    try {
      const response = await fetch(
        `/api/incidents?facility_id=${encodeURIComponent(user.facility_id)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Báo cáo sự cố
              </h1>
              <p className="text-slate-600">
                Quản lý và theo dõi các báo cáo sự cố của bạn
              </p>
            </div>
            <Button
              onClick={() => router.push("/reporter/reports/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Báo cáo sự cố mới
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              onClick={() => router.push("/reporter/chatbot")}
              className="p-6 border-0 bg-gradient-to-br from-blue-50 to-blue-100 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-600 font-semibold text-sm mb-1">
                    AI Chatbot
                  </p>
                  <p className="text-slate-700 text-sm">
                    Trò chuyện với AI để được hỗ trợ
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card
              onClick={() => router.push("/reporter/processes")}
              className="p-6 border-0 bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-600 font-semibold text-sm mb-1">
                    Xem Quy trình
                  </p>
                  <p className="text-slate-700 text-sm">
                    Tìm hiểu các quy trình mua sắm
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card
              onClick={() => router.push("/reporter/reports")}
              className="p-6 border-0 bg-gradient-to-br from-orange-50 to-orange-100 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-600 font-semibold text-sm mb-1">
                    Báo cáo của tôi
                  </p>
                  <p className="text-slate-700 text-sm">
                    Xem tất cả báo cáo của bạn
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Recent Reports */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Báo cáo gần đây của tôi
            </h2>
            {loading ? (
              <div className="text-center py-8">Đang tải...</div>
            ) : (
              <div className="space-y-4">
                {(incidents ?? []).slice(0, 3).map((report) => (
                  <Card
                    key={report.id}
                    onClick={() =>
                      router.push(`/reporter/reports/${report.id}`)
                    }
                    className="p-6 hover:shadow-md transition cursor-pointer border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {report.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          Ngày báo cáo:{" "}
                          {new Date(report.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {report.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))}
                {incidents.length === 0 && (
                  <p className="text-slate-500">Bạn chưa có báo cáo nào</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
