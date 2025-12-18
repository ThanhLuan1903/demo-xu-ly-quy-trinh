"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  Image as ImgIcon,
  Video,
  Send,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading";

type Attachment = {
  id: string;
  type: "image" | "video" | "file";
  url: string;
  filename?: string;
};

type Comment = {
  id: string;
  incident_id: string;
  author_id: string;
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
  facility_id: string;
  reporter_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  comments?: Comment[];
  assignee?: { id: string; name: string } | null;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement | null>(null);

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

  const fetchIncident = async () => {
    try {
      if (!me) return;
      setLoading(true);
      const response = await fetch(
        `/api/incidents?viewer_id=${me.id}&role=reporter`
      );
      const data = await response.json();
      const found = (data || []).find(
        (i: Incident) => String(i.id) === String(params.id)
      );
      setIncident(found || null);
    } catch (error) {
      console.error("Failed to fetch incident:", error);
    } finally {
      setLoading(false);
      setTimeout(
        () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [params.id]);

  useEffect(() => {
    if (!incident) return;
    const t = setTimeout(
      () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
    console.log("incidents", incident);
    console.log("comments", incident?.comments?.length);
    return () => clearTimeout(t);
  }, [incident?.comments?.length]);

  const addComment = async () => {
    if (!incident) return;
    if (!comment.trim()) return;
    if (!me?.id) return alert("Thiếu thông tin đăng nhập");

    try {
      setBusy(true);
      const res = await fetch(`/api/incidents/${incident.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_id: me.id, message: comment.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "Không gửi được bình luận");
        return;
      }
      setComment("");
      await fetchIncident();
    } catch (e) {
      console.error(e);
      alert("Không gửi được bình luận");
    } finally {
      setBusy(false);
    }
  };

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

  if (loading)
    return (
      <ProtectedLayout requiredRole="reporter">
        <LoadingSpinner size={32} />
      </ProtectedLayout>
    );

  if (!incident)
    return (
      <ProtectedLayout requiredRole="reporter">
        <div className="p-8 text-center">Không tìm thấy báo cáo</div>
      </ProtectedLayout>
    );

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Chi tiết báo cáo
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Người xử lý:{" "}
                <span className="font-semibold">
                  {incident.assignee?.name || "—"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityPill(
                  incident.priority
                )}`}
              >
                {incident.priority}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusPill(
                  incident.status
                )}`}
              >
                {incident.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Main */}

            <Card className="p-6 md:p-8 border-0 shadow-lg gap-6">
              <h2 className="text-xl font-bold text-slate-900">
                {incident.title}
              </h2>
              <p className="text-slate-600 whitespace-pre-wrap">
                Tình trạng hiện tại: {incident.description}
              </p>

              {incident.proposed_fix ? (
                <div>
                  <span className="font-semibold text-slate-900">
                    Phương án đề xuất:{" "}
                  </span>
                  <span className=" whitespace-pre-wrap">
                    {incident.proposed_fix}
                  </span>
                </div>
              ) : null}

              {(incident.attachments || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Tệp đính kèm
                    </p>
                    {summarizeAttachments(incident.attachments)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(incident.attachments || [])
                      .filter((a) => a.type === "image" || a.type === "video")
                      .slice(0, 9)
                      .map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => window.open(a.url, "_blank")}
                          className="h-24 w-full rounded-lg overflow-hidden border bg-white"
                          title="Nhấn để xem"
                        >
                          {a.type === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.url}
                              alt={a.filename || "att"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={a.url}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Tạo: {new Date(incident.created_at).toLocaleString("vi-VN")}{" "}
                <br />
                Cập nhật lần cuối:{" "}
                {new Date(incident.updated_at).toLocaleString("vi-VN")}
              </div>
            </Card>

            {/* Comments */}
            <Card className="p-6 md:p-8 border-0 shadow-lg">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Trao đổi với người tiếp nhận
              </h3>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {(incident.comments || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Chưa có bình luận.</p>
                ) : (
                  (incident.comments || []).map((c) => {
                    const isMe =
                      !!me?.id && String(c.author_id) === String(me.id);
                    return (
                      <div
                        key={c.id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm border ${
                            isMe
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-800 border-slate-200"
                          }`}
                        >
                          <p
                            className={`text-[11px] mb-1 ${
                              isMe ? "text-blue-50" : "text-slate-500"
                            }`}
                          >
                            {isMe ? "Bạn" : c.author?.name || "Admin"} •{" "}
                            {new Date(c.created_at).toLocaleString("vi-VN")}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {c.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập phản hồi của bạn..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  disabled={busy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addComment();
                  }}
                />
                <Button
                  onClick={addComment}
                  disabled={busy}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Gửi
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
