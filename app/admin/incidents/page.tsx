"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Check,
  X,
  Image as ImgIcon,
  Video,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getStatusLabel } from "@/constant/constant";

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
  reporter_id: string;
  facility_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  reporter?: { id: string; name: string } | null;
  attachments?: Attachment[];
  comments?: Comment[];
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
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

  useEffect(() => {
    fetchIncidents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
    return () => clearTimeout(t);
  }, [selectedIncident?.id, selectedIncident?.comments?.length]);

  const fetchIncidents = async (keepSelection = true) => {
    try {
      if (!me?.id) return;
      setLoading(true);
      const res = await fetch(`/api/incidents?viewer_id=${me.id}&role=admin`, {
        cache: "no-store",
      });
      const data = await res.json();
      const list = (data || []) as Incident[];
      setIncidents(list);

      if (keepSelection && selectedIncident?.id) {
        const refreshed =
          list.find((x) => String(x.id) === String(selectedIncident.id)) ||
          null;
        setSelectedIncident(refreshed);
      }
    } catch (e) {
      console.error("Failed to fetch incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ chọn item: nếu click lại item đang chọn -> toggle close
  const selectIncident = (incidentId: string) => {
    if (!incidentId) return;

    // toggle close nếu click lại item đang chọn
    if (
      selectedIncident?.id &&
      String(selectedIncident.id) === String(incidentId)
    ) {
      setSelectedIncident(null);
      return;
    }

    // chọn từ list hiện tại để có đủ fields
    const found =
      incidents.find((x) => String(x.id) === String(incidentId)) || null;
    setSelectedIncident(found);
  };

  const closeDetail = () => setSelectedIncident(null);

  const updateIncidentStatus = async (
    id: string,
    newStatus: Incident["status"]
  ) => {
    try {
      setBusy(true);
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("PATCH failed:", payload);
        throw new Error(payload?.error || "PATCH failed");
      }
      await fetchIncidents(true);
    } catch (e) {
      console.error(e);
      alert("Không cập nhật được trạng thái");
    } finally {
      setBusy(false);
    }
  };

  const addComment = async () => {
    if (!selectedIncident) return;
    const incidentId = String(selectedIncident.id || "").trim();
    const msg = comment.trim();
    if (!msg) return;
    if (!me?.id) return alert("Thiếu thông tin đăng nhập");
    if (!incidentId) return alert("Thiếu incident id");

    try {
      setBusy(true);
      const res = await fetch(
        `/api/incidents/${encodeURIComponent(incidentId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author_id: String(me.id), message: msg }),
          cache: "no-store",
        }
      );

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("POST comment failed:", payload);
        alert(payload?.error || "Không gửi được bình luận");
        return;
      }

      setComment("");
      await fetchIncidents(true);
    } catch (e) {
      console.error(e);
      alert("Không gửi được bình luận");
    } finally {
      setBusy(false);
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  const statusDisable = (s: Incident["status"]) => {
    // ✅ nếu anh muốn "khóa luôn" khi đã resolved/rejected thì:
    // return selectedIncident?.status === "resolved" || selectedIncident?.status === "rejected"
    return false;
  };

  const selectedStatus = selectedIncident?.status;
  const disableApprove =
    busy ||
    !selectedIncident ||
    selectedStatus === "resolved" ||
    statusDisable(selectedStatus as any);
  const disableReject =
    busy ||
    !selectedIncident ||
    selectedStatus === "rejected" ||
    statusDisable(selectedStatus as any);

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* header */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Sự cố được giao cho tôi
              </h1>
              <p className="text-slate-600">
                Chỉ hiển thị các báo cáo có{" "}
                <span className="font-semibold">assigned_to</span> = admin đang
                đăng nhập.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fetchIncidents(true)}
                disabled={loading || busy}
                className="bg-transparent"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>
          </div>

          {/* LIST GRID */}
          {loading ? (
            <div className="text-center py-10 text-slate-600">Đang tải...</div>
          ) : incidents.length === 0 ? (
            <Card className="p-6 border-0">
              <p className="text-slate-600">
                Hiện chưa có sự cố nào được giao cho bạn.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidents.map((incident) => {
                const active = selectedIncident?.id === incident.id;
                return (
                  <Card
                    key={incident.id}
                    className={`p-4 cursor-pointer hover:shadow-md transition border-0 ${
                      active ? "ring-2 ring-blue-200" : ""
                    }`}
                    onClick={() => selectIncident(incident.id)}
                  >
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <h3 className="font-semibold text-slate-900 flex-1">
                        {incident.title}
                      </h3>
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {incident.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex gap-2 items-center flex-wrap">
                        {/* <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge> */}
                        <Badge className={getStatusColor(incident.status)}>
                          {getStatusLabel(incident.status)}
                        </Badge>

                        <span className="text-xs text-slate-500">
                          {new Date(incident.created_at).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                        {incident.reporter?.name ? (
                          <span className="text-xs text-slate-500">
                            • Reporter: {incident.reporter.name}
                          </span>
                        ) : null}
                      </div>

                      {summarizeAttachments(incident.attachments)}
                    </div>

                    <div className="mt-2 text-xs text-slate-400">
                      Nhấn để xem chi tiết
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* DETAIL MODAL */}
          <Dialog
            open={!!selectedIncident}
            onOpenChange={(open) => !open && closeDetail()}
          >
            <DialogContent className="max-w-3xl p-0 overflow-hidden">
              {selectedIncident ? (
                <div className="flex flex-col max-h-[85vh]">
                  {/* Modal header */}
                  <div className="px-6 py-4 border-b bg-white">
                    <DialogHeader>
                      <DialogTitle className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xl font-bold text-slate-900">
                            Chi tiết sự cố
                          </div>
                          <DialogDescription className="text-xs text-slate-500 mt-1">
                            Mã:{" "}
                            <span className="font-mono">
                              {selectedIncident.id}
                            </span>
                          </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(selectedIncident.status)}
                          >
                            {getStatusLabel(selectedIncident.status)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-transparent"
                            onClick={closeDetail}
                            disabled={busy}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>{" "}
                      </DialogTitle>
                    </DialogHeader>
                  </div>

                  {/* Modal body (scroll) */}
                  <div className="px-6 py-5 space-y-4 overflow-y-auto bg-slate-50">
                    <p className="font-semibold text-slate-900">
                      {selectedIncident.title}
                    </p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      Tình trạng hiện tại: {selectedIncident.description}
                    </p>

                    {selectedIncident.proposed_fix ? (
                      <div>
                        <span className="text-sm font-semibold text-slate-900">
                          Phương án khắc phục:{" "}
                        </span>
                        <span className="text-sm text-slate-700 whitespace-pre-wrap">
                          {selectedIncident.proposed_fix}
                        </span>
                      </div>
                    ) : null}

                    <div className="text-xs text-slate-500">
                      Tạo:{" "}
                      {new Date(selectedIncident.created_at).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      <br />
                      Cập nhật:{" "}
                      {new Date(selectedIncident.updated_at).toLocaleString(
                        "vi-VN"
                      )}
                    </div>

                    {/* status select */}
                    <div className="w-[300px]">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Trạng thái
                      </label>
                      <Select
                        value={selectedIncident.status}
                        onValueChange={(value) =>
                          updateIncidentStatus(
                            selectedIncident.id,
                            value as any
                          )
                        }
                        disabled={busy}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Mới</SelectItem>
                          <SelectItem value="assigned">Đã được giao</SelectItem>
                          <SelectItem value="resolved">
                            Đã giải quyết
                          </SelectItem>
                          <SelectItem value="rejected">Đã từ chối</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* attachments */}
                    {(selectedIncident.attachments || []).length > 0 && (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-slate-900 mb-2">
                          Tệp đính kèm
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(selectedIncident.attachments || [])
                            .filter(
                              (a) => a.type === "image" || a.type === "video"
                            )
                            .slice(0, 9)
                            .map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => window.open(a.url, "_blank")}
                                className="h-24 w-full rounded-md overflow-hidden border bg-white hover:shadow-sm transition"
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

                    {/* comments */}
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Trao đổi
                      </h3>

                      <div className="space-y-2 mb-3 max-h-56 overflow-y-auto pr-1">
                        {(selectedIncident.comments || []).length === 0 ? (
                          <p className="text-xs text-slate-500">
                            Chưa có bình luận.
                          </p>
                        ) : (
                          (selectedIncident.comments || []).map((c) => {
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
                                    {isMe ? "Bạn" : c.author?.name || "—"} •{" "}
                                    {new Date(c.created_at).toLocaleString(
                                      "vi-VN"
                                    )}
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

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập phản hồi cho reporter..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                          disabled={busy}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addComment();
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={addComment}
                          disabled={busy}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Gửi
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Modal footer actions */}
                  <div className="px-6 py-4 border-t bg-white flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60"
                      disabled={disableApprove}
                      onClick={() =>
                        updateIncidentStatus(selectedIncident.id, "resolved")
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      {selectedIncident.status === "resolved"
                        ? "Đã chấp nhận"
                        : "Chấp nhận"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent disabled:opacity-60"
                      disabled={disableReject}
                      onClick={() =>
                        updateIncidentStatus(selectedIncident.id, "rejected")
                      }
                    >
                      <X className="w-4 h-4 mr-1" />
                      {selectedIncident.status === "rejected"
                        ? "Đã từ chối"
                        : "Từ chối"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedLayout>
  );
}
