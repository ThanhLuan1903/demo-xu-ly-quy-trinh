"use client";
import { useEffect, useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ClipboardList,
  Shield,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getStatusLabel } from "@/constant/constant";
import { LoadingSpinner } from "@/components/loading";
import { useRouter } from "next/navigation"
import { getPriorityColor, getStatusColor } from "@/app/types/process";

interface Incident {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "assigned" | "resolved" | "rejected";
  created_at: string;
  facility_id: string;
}

type ProcessLite = {
  id: string;
  code: string;
  name: string;
  version: number;
  is_active: boolean;
  created_at: string;
  steps_count?: number;
};


function SparkBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => {
        const h = Math.round((v / max) * 40);
        return (
          <div
            key={i}
            className="w-2 rounded bg-slate-200"
            style={{ height: Math.max(6, h) }}
            title={`${v}`}
          />
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [processes, setProcesses] = useState<ProcessLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
const router = useRouter()
  const fetchAll = async () => {
    try {
      setBusy(true);
      setLoading(true);

      const [incRes, procRes] = await Promise.all([
        fetch("/api/incidents", { cache: "no-store" }),
        fetch("/api/processes?is_active=true", { cache: "no-store" }).catch(() => null),
      ]);

      const incData = await incRes.json().catch(() => []);
      setIncidents(Array.isArray(incData) ? incData : []);

      if (procRes && procRes.ok) {
        const procData = await procRes.json().catch(() => []);
        setProcesses(Array.isArray(procData) ? procData : []);
      } else {
        setProcesses([]);
      }
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu dashboard");
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const counts = useMemo(() => {
    const total = incidents.length;
    const byStatus = {
      open: incidents.filter((i) => i.status === "open").length,
      assigned: incidents.filter((i) => i.status === "assigned").length,
      resolved: incidents.filter((i) => i.status === "resolved").length,
      rejected: incidents.filter((i) => i.status === "rejected").length,
    };
    const critical = incidents.filter((i) => i.priority === "critical").length;
    const high = incidents.filter((i) => i.priority === "high").length;

    return { total, byStatus, critical, high };
  }, [incidents]);

  const trend = useMemo(() => {
    const vals = Array.from({ length: 14 }, (_, idx) => {
      const base = Math.max(0, counts.byStatus.open - 2);
      return Math.max(1, base + ((idx * 7) % 5));
    });
    return vals;
  }, [counts.byStatus.open]);

  const stats = [
    {
      label: "Tổng sự cố",
      value: String(counts.total),
      hint: "Tất cả trạng thái",
      icon: <ClipboardList className="w-5 h-5 text-slate-700" />,
      bg: "bg-white",
    },
    {
      label: "Sự cố mới",
      value: String(counts.byStatus.open),
      hint: "Cần xử lý",
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50",
    },
    {
      label: "Đã giải quyết",
      value: String(counts.byStatus.resolved),
      hint: "Resolved",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Khẩn cấp",
      value: String(counts.critical),
      hint: "Critical",
      icon: <Flame className="w-5 h-5 text-red-600" />,
      bg: "bg-red-50",
    },
  ];

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-2">
                Tổng quan hệ thống
              </h1>
              <p className="text-slate-600">
                Quản lý quy trình và phản ánh sự cố
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchAll}
                disabled={busy}
                className="bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${busy ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s, idx) => (
              <Card key={idx} className={`p-5 border-0 ${s.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.hint}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Incidents */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trend card */}
              <Card className="p-6 border-0">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Xu hướng sự cố mới (demo)
                    </p>
                    <p className="text-xs text-slate-500">
                      14 ngày gần nhất (tạm demo bằng dữ liệu local)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-100 text-slate-700">
                      High: {counts.high}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      Critical: {counts.critical}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-6">
                  <div className="flex-1">
                    <SparkBars values={trend} />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                      <span>14d</span>
                      <span>7d</span>
                      <span>Hôm nay</span>
                    </div>
                  </div>

                  <div className="min-w-[220px] rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      Tỷ lệ xử lý
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Mới</span>
                        <span className="font-semibold">{counts.byStatus.open}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đã được giao</span>
                        <span className="font-semibold">{counts.byStatus.assigned}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đã giải quyết</span>
                        <span className="font-semibold">{counts.byStatus.resolved}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Đã từ chối</span>
                        <span className="font-semibold">{counts.byStatus.rejected}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Incidents */}
              <Card className="p-6 border-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Sự cố gần đây
                  </h2>
                  <Button
                    variant="outline"
                    className="bg-transparent text-blue-600 hover:text-blue-700"
                    onClick={() => router.push("/admin/incidents")}
                  >
                    Xem tất cả
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {loading ? (
                  <LoadingSpinner size={32} />
                ) : incidents.length === 0 ? (
                  <div className="text-slate-600">Chưa có sự cố.</div>
                ) : (
                  <div className="space-y-3">
                    {incidents.slice(0, 6).map((incident) => (
                      <div
                        key={incident.id}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {incident.title}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    incident.status
                                  )}`}
                                >
                                  {getStatusLabel
                                    ? getStatusLabel(incident.status)
                                    : incident.status}
                                </span>

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                    incident.priority
                                  )}`}
                                >
                                  {incident.priority}
                                </span>

                                <span className="text-xs text-slate-500">
                                  {new Date(incident.created_at).toLocaleString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-400 font-mono">
                            {String(incident.id).slice(0, 8)}…
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Processes + Quick actions */}
            <div className="space-y-6">
              {/* Quick actions */}
              <Card className="p-6 border-0">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Thao tác nhanh
                  </h2>
                  <Shield className="w-5 h-5 text-slate-400" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={() => router.push("/admin/chatbot")} className="bg-blue-600 hover:bg-blue-700 justify-between">
                    Hỏi nhanh quy trình
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>

                  <Button onClick={() => router.push("/admin/users")} variant="outline" className="bg-transparent justify-between">
                    Quản lý người dùng
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>

                  <Button onClick={() => router.push("/admin/incidents")} variant="outline" className="bg-transparent justify-between">
                    Xem danh sách sự cố
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* Processes */}
              <Card className="p-6 border-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-slate-700" />
                    <h2 className="text-xl font-bold text-slate-900">Quy trình</h2>
                  </div>

                  <Button
                    variant="outline"
                    className="bg-transparent text-blue-600 hover:text-blue-700"
                    // onClick={() => router.push("/admin/procurement")}
                  >
                    Xem tất cả
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {loading ? (
                  <LoadingSpinner size={32} />
                ) : processes.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-600 text-sm">
                    Chưa có quy trình hoặc chưa có API <code>/api/processes</code>.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {processes.slice(0, 6).map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              Code: <span className="font-mono">{p.code}</span> • Version:{" "}
                              <b>{p.version}</b>
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {p.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
