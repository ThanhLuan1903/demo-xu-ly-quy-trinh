"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Image as ImgIcon,
  Video,
  RefreshCw,
  Send,
  MessageSquare,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getStatusLabel } from "@/constant/constant";
import { supabaseBrowser } from "@/lib/supabase-browser";
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
  reporter_id: string;
  facility_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { id: string; name: string } | null;
  attachments?: Attachment[];
  comments?: Comment[];
}

type AdminUser = { id: string; name: string };

type PreviewItem = {
  id: string;
  file: File;
  url: string;
  kind: "image" | "video" | "file";
};

export default function ReportsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [createLoading, setCreateLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    proposed_fix: "",
    priority: "medium" as Incident["priority"],
    assigned_to: "",
  });

  const resetCreate = () => {
    // revoke preview urls
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    setCreateForm({
      title: "",
      description: "",
      proposed_fix: "",
      priority: "medium",
      assigned_to: admins[0]?.id || "",
    });
  };

  const openCreate = () => {
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    // optional: reset form khi đóng
    // resetCreate()
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;

    const list = Array.from(files).map((file) => {
      const mime = file.type || "";
      const kind: PreviewItem["kind"] = mime.startsWith("image/")
        ? "image"
        : mime.startsWith("video/")
        ? "video"
        : "file";

      return {
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        kind,
      };
    });

    setPreviews((prev) => [...prev, ...list]);
  };

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const t = prev.find((p) => p.id === id);
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter((p) => p.id !== id);
    });
  };

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

      // ✅ reporter: chỉ xem sự cố do mình tạo
      const res = await fetch(
        `/api/incidents?viewer_id=${me.id}&role=reporter`,
        { cache: "no-store" }
      );
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

  useEffect(() => {
    if (!createOpen) return;

    (async () => {
      try {
        const res = await fetch("/api/users?role=admin", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.error || "Failed to fetch admins");

        const list: AdminUser[] = (data || []).map((u: any) => ({
          id: String(u.id),
          name: String(u.name || "—"),
        }));
        setAdmins(list);

        // auto pick first admin nếu chưa chọn
        setCreateForm((p) => ({
          ...p,
          assigned_to: p.assigned_to || list[0]?.id || "",
        }));
      } catch (e) {
        console.error(e);
        alert("Không tải được danh sách admin");
      }
    })();
  }, [createOpen]);
  const submitCreate = async () => {
    if (!me?.id) return alert("Chưa đăng nhập");
    if (!me?.facility_id) return alert("Thiếu facility_id của user");
    if (!createForm.title.trim()) return alert("Thiếu tiêu đề");
    if (!createForm.description.trim()) return alert("Thiếu mô tả");
    if (!createForm.assigned_to) return alert("Chưa chọn admin xử lý");

    try {
      setCreateLoading(true);

      const fd = new FormData();
      fd.append("title", createForm.title.trim());
      fd.append("description", createForm.description.trim());
      fd.append("proposed_fix", String(createForm.proposed_fix || "").trim());
      fd.append("priority", createForm.priority);
      fd.append("assigned_to", createForm.assigned_to);

      fd.append("reporter_id", String(me.id));
      fd.append("facility_id", String(me.facility_id));

      previews.forEach((p) => fd.append("attachments", p.file));

      const res = await fetch("/api/incidents", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("create incident failed:", data);
        alert(data?.error || "Gửi báo cáo thất bại");
        return;
      }

      // ✅ đóng + reset + refresh list
      setCreateOpen(false);
      resetCreate();
      await fetchIncidents(true);
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi gửi báo cáo");
    } finally {
      setCreateLoading(false);
    }
  };

  // ✅ giống admin: click lại card đang mở => đóng modal
  const selectIncident = (incidentId: string) => {
    if (!incidentId) return;
    if (
      selectedIncident?.id &&
      String(selectedIncident.id) === String(incidentId)
    ) {
      setSelectedIncident(null);
      return;
    }
    const found =
      incidents.find((x) => String(x.id) === String(incidentId)) || null;
    setSelectedIncident(found);
  };

  const closeDetail = () => setSelectedIncident(null);

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

  useEffect(() => {
    const incidentId = selectedIncident?.id;
    if (!incidentId) return;

    const channel = supabaseBrowser
      .channel(`comments:${incidentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "incident_comments",
          filter: `incident_id=eq.${incidentId}`,
        },
        async (payload) => {
          console.log("🔥 INSERT event received", payload); // ✅ bắt bệnh

          const row = payload.new as any;

          let author = null;
          try {
            const { data } = await supabaseBrowser
              .from("users")
              .select("id,name,role")
              .eq("id", row.author_id)
              .maybeSingle();
            author = data || null;
          } catch {}

          setSelectedIncident((prev) => {
            if (!prev) return prev;
            if (String(prev.id) !== String(incidentId)) return prev; // ✅ chống race

            const prevComments = prev.comments || [];
            const exists = prevComments.some(
              (c) => String(c.id) === String(row.id)
            );
            if (exists) return prev;

            return { ...prev, comments: [...prevComments, { ...row, author }] };
          });
        }
      )
      .subscribe((status) => {
        console.log(
          "[realtime comments] status =",
          status,
          "incidentId =",
          incidentId
        );
      });

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [selectedIncident?.id]);

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

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          {/* header */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Báo cáo sự cố của tôi
              </h1>
              <p className="text-slate-600">
                Chỉ hiển thị các báo cáo do bạn tạo.
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

              <Button
                onClick={() => openCreate()}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading || busy}
              >
                <Plus className="w-4 h-4 mr-2" />
                Báo cáo mới
              </Button>
            </div>
          </div>

          {/* LIST GRID */}
          {loading ? (
            <LoadingSpinner size={32} />
          ) : incidents.length === 0 ? (
            <Card className="p-6 border-0">
              <p className="text-slate-600">
                Hiện tại bạn không có báo cáo nào.
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
                        <Badge className={getStatusColor(incident.status)}>
                          {getStatusLabel(incident.status)}
                        </Badge>

                        <span className="text-xs text-slate-500">
                          {new Date(incident.created_at).toLocaleString(
                            "vi-VN"
                          )}
                        </span>

                        {incident.assignee?.name ? (
                          <span className="text-xs text-slate-500">
                            • Người xử lý: {incident.assignee.name}
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

          {/* DETAIL MODAL (y chang style admin) */}
          <Dialog
            open={!!selectedIncident}
            onOpenChange={(open) => !open && closeDetail()}
          >
            <DialogContent className="max-w-4xl p-0 overflow-hidden">
              {selectedIncident ? (
                <div className="flex flex-col max-h-[85vh]">
                  {/* header */}
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
                        </div>
                      </DialogTitle>
                    </DialogHeader>
                  </div>

                  {/* body */}
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

                    {/* comments (reporter gửi được, UI bubble giống admin) */}
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
                          placeholder="Nhập phản hồi cho admin..."
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

                  {/* footer */}
                  <div className="px-6 py-4 border-t bg-white flex justify-end">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={closeDetail}
                      disabled={busy}
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>




          <Dialog open={createOpen} onOpenChange={(v) => !createLoading && setCreateOpen(v)}>
  <DialogContent className="max-w-3xl p-0 overflow-hidden">
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl font-bold text-slate-900">Báo cáo sự cố mới</div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Điền thông tin và gửi báo cáo ngay tại đây.
              </DialogDescription>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="bg-transparent"
              onClick={() => setCreateOpen(false)}
              disabled={createLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4 overflow-y-auto bg-slate-50">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            value={createForm.title}
            onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
            disabled={createLoading}
            placeholder="Mô tả ngắn gọn sự cố"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả chi tiết</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
            disabled={createLoading}
            placeholder="Cung cấp thông tin chi tiết..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Đề xuất khắc phục</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            rows={2}
            value={createForm.proposed_fix}
            onChange={(e) => setCreateForm((p) => ({ ...p, proposed_fix: e.target.value }))}
            disabled={createLoading}
            placeholder="Hướng xử lý tạm thời / đề xuất..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Độ ưu tiên</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              value={createForm.priority}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, priority: e.target.value as any }))
              }
              disabled={createLoading}
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
              <option value="critical">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Người xử lý (Admin)</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              value={createForm.assigned_to}
              onChange={(e) => setCreateForm((p) => ({ ...p, assigned_to: e.target.value }))}
              disabled={createLoading}
              required
            >
              {admins.length === 0 ? (
                <option value="">(Chưa có admin)</option>
              ) : (
                admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tệp đính kèm</label>

          <label
            className="block border-2 border-dashed border-slate-300 rounded-lg p-5 text-center cursor-pointer hover:border-blue-500 transition bg-white"
            htmlFor="create_attachments"
          >
            <div className="text-sm text-slate-600">
              Nhấn để chọn tệp (ảnh/video)
            </div>
            <div className="text-xs text-slate-500 mt-1">Có thể chọn nhiều tệp</div>
          </label>

          <input
            id="create_attachments"
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => onPickFiles(e.target.files)}
            disabled={createLoading}
          />

          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {previews.map((p) => (
                <div key={p.id} className="relative border rounded-md overflow-hidden bg-white">
                  <button
                    type="button"
                    className="absolute top-2 right-2 z-10 bg-white/90 border rounded-full p-1"
                    onClick={() => removePreview(p.id)}
                    disabled={createLoading}
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => window.open(p.url, "_blank")}
                    title="Nhấn để xem"
                  >
                    {p.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt={p.file.name} className="w-full h-24 object-cover" />
                    ) : p.kind === "video" ? (
                      <video src={p.url} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="p-3 text-xs text-slate-700">{p.file.name}</div>
                    )}
                  </button>

                  <div className="p-2 text-xs text-slate-600 truncate">{p.file.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-white flex justify-end gap-2">
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => setCreateOpen(false)}
          disabled={createLoading}
        >
          Hủy
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={submitCreate}
          disabled={createLoading}
        >
          {createLoading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size={16} />
              Đang gửi...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Send className="w-4 h-4" />
              Gửi báo cáo
            </span>
          )}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

        </div>
      </div>
    </ProtectedLayout>
  );
}
