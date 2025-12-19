"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, FileText, Eye, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/loading";
import { getPriorityLabel, getStatusLabel } from "@/constant/constant";

type Role = "admin" | "reporter";

interface Incident {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical" | string;
  status: "new" | "assigned" | "resolved" | "rejected" | string;
  created_at: string;
}

type CurrentUser = {
  id: string;
  role: Role;
  facility_id: string | null;
  name?: string;
};

const getCurrentUser = (): CurrentUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
};

function statusClass(s: string) {
  switch (s) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "assigned":
      return "bg-purple-100 text-purple-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function priorityClass(p: string) {
  switch (p) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

export default function ReporterDashboard() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [warn, setWarn] = useState<string | null>(null);

  const user = useMemo(() => getCurrentUser(), []);
  const me = useMemo(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        id: string;
        role: string;
        facility_id: string;
        name: string;
      };
    } catch {
      return null;
    }
  }, []);
  const fetchIncidents = async () => {
    if (!me?.id) return;
    try {
      setWarn(null);
      setLoading(true);

      const response = await fetch(
        `/api/incidents?viewer_id=${me.id}&role=reporter`,
        { cache: "no-store" }
      );

      const data = await response.json().catch(() => []);
      if (!response.ok) {
        console.error("fetch incidents failed:", data);
        setWarn(data?.error || "Không tải được danh sách sự cố");
        setIncidents([]);
        return;
      }

      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      setWarn("Không tải được danh sách sự cố");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.facility_id) {
      setWarn("Thiếu facility_id của user (localStorage). Hãy đăng nhập lại.");
      setLoading(false);
      return;
    }
    fetchIncidents();
  }, [user?.facility_id]);

  const recent = (incidents ?? []).slice(0, 3);

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Báo cáo sự cố
              </h1>
              <p className="text-slate-600">
                Quản lý và theo dõi các báo cáo sự cố của bạn
              </p>
            </div>
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
              onClick={() => router.push("/reporter/procurement")}
              className="p-6 border-0 bg-gradient-to-br from-green-50 to-green-100 cursor-pointer hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-600 font-semibold text-sm mb-1">
                    Xem Quy trình
                  </p>
                  <p className="text-slate-700 text-sm">
                    Tìm hiểu các quy trình
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
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                Báo cáo gần đây của tôi
              </h2>

              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => router.push("/reporter/reports")}
              >
                Xem tất cả
              </Button>
            </div>

            {warn ? (
              <Card className="p-4 border-0 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">{warn}</div>
                </div>
              </Card>
            ) : loading ? (
              <div className="py-6">
                <LoadingSpinner size={32} />
              </div>
            ) : recent.length === 0 ? (
              <Card className="p-6 border-0">
                <p className="text-slate-600">Bạn chưa có báo cáo nào.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {recent.map((r) => (
                  <Card
                    key={r.id}
                    onClick={() => router.push(`/reporter/reports/${r.id}`)}
                    className="p-6 hover:shadow-md transition cursor-pointer border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {r.title}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(
                              r.status
                            )}`}
                          >
                            {getStatusLabel(r.status)}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${priorityClass(
                              r.priority
                            )}`}
                          >
                            {getPriorityLabel(r.priority || "—")}
                          </span>

                          <span className="text-xs text-slate-500 ml-auto">
                            {new Date(r.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
