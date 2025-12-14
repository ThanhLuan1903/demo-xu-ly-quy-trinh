"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Image as ImgIcon, Video } from "lucide-react";

type Attachment = {
  id: string;
  type: "image" | "video" | "file";
  url: string;
  filename?: string;
};

type Comment = {
  id: string;
  message: string;
  created_at: string;
  author?: { id: string; name: string; role: string } | null;
};

interface Incident {
  id: string;
  title: string;
  description: string;
  proposed_fix?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "assigned" | "resolved" | "rejected";
  created_at: string;
  updated_at: string;
  reporter_id: string;
  facility_id: string;
  assigned_to?: string;
  attachments?: Attachment[];
  comments?: Comment[];
  assignee?: { id: string; name: string } | null;
}

export default function ReportsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncidents = async () => {
    try {
      if (!me) return;
      const response = await fetch(
        `/api/incidents?viewer_id=${me.id}&role=reporter&q=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await response.json();
      setIncidents(data || []);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchIncidents();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const getPriorityPill = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
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
  };

  const summarizeAttachments = (atts?: Attachment[]) => {
    const a = atts || [];
    const img = a.filter((x) => x.type === "image").length;
    const vid = a.filter((x) => x.type === "video").length;
    if (!a.length) return null;
    return (
      <div className="flex items-center gap-3 text-xs text-slate-600">
        {img > 0 && (
          <span className="inline-flex items-center gap-1">
            <ImgIcon className="w-4 h-4" /> {img} ảnh
          </span>
        )}
        {vid > 0 && (
          <span className="inline-flex items-center gap-1">
            <Video className="w-4 h-4" /> {vid} video
          </span>
        )}
        <span>{a.length} tệp</span>
      </div>
    );
  };

  const renderThumbs = (atts?: Attachment[]) => {
    const items = (atts || [])
      .filter((x) => x.type === "image" || x.type === "video")
      .slice(0, 3);
    if (!items.length) return null;
    return (
      <div className="flex gap-2 mt-3">
        {items.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => window.open(a.url, "_blank")}
            className="h-16 w-24 rounded-md overflow-hidden border bg-white"
            title="Nhấn để xem"
          >
            {a.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.url}
                alt={a.filename || "attachment"}
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={a.url} className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Báo cáo sự cố của tôi
              </h1>
              <p className="text-slate-600">
                Chỉ hiển thị các báo cáo do bạn tạo
              </p>
            </div>
            <Button
              onClick={() => router.push("/reporter/reports/new")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Báo cáo mới
            </Button>
          </div>

          {/* <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm theo tiêu đề / mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div> */}

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              {incidents.map((it) => {
                const latestComment = (it.comments || []).slice(-1)[0];
                return (
                  <Card
                    key={it.id}
                    className="p-6 hover:shadow-md transition border-0"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <h3 className="font-bold text-slate-900 text-lg flex-1">
                            {it.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityPill(
                              it.priority
                            )}`}
                          >
                            {it.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusPill(
                              it.status
                            )}`}
                          >
                            {it.status}
                          </span>
                        </div>

                        <p className="text-slate-600 text-sm line-clamp-2">
                          Tình trạng hiện tại: {it.description}
                        </p>

                        {it.proposed_fix ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              Phương án đề xuất:{" "}
                            </span>
                            <span className=" whitespace-pre-wrap">
                              {it.proposed_fix}
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="text-xs text-slate-500">
                            Tạo lúc:{" "}
                            {new Date(it.created_at).toLocaleString("vi-VN")}
                            {it.assignee?.name ? (
                              <span className="ml-3">
                                • Người xử lý: {it.assignee.name}
                              </span>
                            ) : null}
                          </div>
                          {summarizeAttachments(it.attachments)}
                        </div>

                        {renderThumbs(it.attachments)}

                        {latestComment ? (
                          <div className="border-t pt-3">
                            <p className="text-xs text-slate-500">
                              Bình luận mới nhất (
                              {latestComment.author?.name || "—"}):{" "}
                              <span className="text-slate-700">
                                {latestComment.message}
                              </span>
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() =>
                            router.push(`/reporter/reports/${it.id}`)
                          }
                          variant="outline"
                          size="sm"
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {incidents.length === 0 && (
                <Card className="p-8 border-0 text-center">
                  <p className="text-slate-500">Không có báo cáo nào.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
