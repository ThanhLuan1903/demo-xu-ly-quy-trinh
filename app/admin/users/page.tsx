"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shield, RefreshCw, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/loading";

type Role = "admin" | "reporter";

type Facility = {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  created_at?: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  facility_id: string | null;
  created_at: string;
  is_active: boolean;
};

type UserForm = {
  id?: string;
  name: string;
  email: string;
  password?: string; // chỉ cần khi create hoặc muốn đổi
  role: Role;
  facility_id: string | null;
};

function roleLabel(role: Role) {
  return role === "admin" ? "Admin" : "Reporter";
}

function roleBadgeClass(role: Role) {
  return role === "admin"
    ? "bg-blue-100 text-blue-800"
    : "bg-slate-100 text-slate-800";
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // filters
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");

  // dialog state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "reporter",
    facility_id: null,
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const facilityNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of facilities) map.set(String(f.id), f.name);
    return map;
  }, [facilities]);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "reporter",
      facility_id: null,
    });
  };

  const openCreate = () => {
    setMode("create");
    resetForm();
    setOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setMode("edit");
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      // password để trống, chỉ update nếu nhập
      password: "",
      role: u.role,
      facility_id: u.facility_id ?? null,
    });
    setOpen(true);
  };

  const fetchFacilities = async () => {
    const res = await fetch("/api/facilities", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.error || "Failed to fetch facilities");
    setFacilities(data || []);
  };

  const fetchUsers = async () => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (roleFilter !== "all") sp.set("role", roleFilter);
    if (facilityFilter !== "all") sp.set("facility_id", facilityFilter);

    const url = `/api/users${sp.toString() ? `?${sp.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.error || "Failed to fetch users");
    setUsers(data || []);
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchFacilities(), fetchUsers()]);
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu users/facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch khi filter thay đổi (debounce nhẹ cho q)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers().catch((e) => {
        console.error(e);
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, roleFilter, facilityFilter]);

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) return "Thiếu tên";
    if (!email) return "Thiếu email";
    if (!form.role) return "Thiếu vai trò";

    if (mode === "create") {
      if (!String(form.password || "").trim()) return "Thiếu mật khẩu";
    }
    return null;
  };

  const saveUser = async () => {
    const msg = validateForm();
    if (msg) return alert(msg);

    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      facility_id: form.facility_id,
    };

    // chỉ gửi password nếu có (create luôn cần)
    if (mode === "create" || String(form.password || "").trim()) {
      payload.password = String(form.password || "");
    }

    try {
      setBusy(true);

      const res =
        mode === "create"
          ? await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/users/${encodeURIComponent(String(form.id))}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("save user failed:", data);
        alert(data?.error || "Không lưu được user");
        return;
      }

      setOpen(false);
      resetForm();
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Không lưu được user");
    } finally {
      setBusy(false);
    }
  };

  const askDeleteUser = (u: UserRow) => {
    setDeleteTarget(u);
    setDeleteOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setBusy(true);
      const res = await fetch(
        `/api/users/${encodeURIComponent(deleteTarget.id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("delete user failed:", data);
        alert(data?.error || "Không xóa được user");
        return;
      }

      setDeleteOpen(false);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Không xóa được user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Quản lý người dùng
              </h1>
              <p className="text-slate-600">Thêm sửa xóa người dùng</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={refreshAll}
                disabled={loading || busy}
                className="bg-transparent"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>

              <Button
                onClick={openCreate}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={busy}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 border-0 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên/email..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10"
                  disabled={loading || busy}
                />
              </div>

              <div className="w-[200px]">
                <Select
                  value={roleFilter}
                  onValueChange={(v) => setRoleFilter(v as any)}
                  disabled={loading || busy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="reporter">Reporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[260px]">
                <Select
                  value={facilityFilter}
                  onValueChange={(v) => setFacilityFilter(v)}
                  disabled={loading || busy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cơ sở</SelectItem>
                    {facilities.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="p-6 border-0 overflow-x-auto">
            {loading ? (
              <LoadingSpinner size={32} />
            ) : users.length === 0 ? (
              <div>Không có user</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Tên
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Vai trò
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Cơ sở
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Ngày tạo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 text-sm">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-slate-900 text-sm">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadgeClass(
                              u.role
                            )}`}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {u.facility_id
                          ? facilityNameById.get(String(u.facility_id)) || "—"
                          : "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleString("vi-VN")
                          : "—"}
                      </td>

                      <td className="py-3 px-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(u)}
                            disabled={busy}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => askDeleteUser(u)}
                            disabled={busy}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Dialog Add/Edit */}
          <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  {mode === "create"
                    ? "Thêm người dùng"
                    : "Chỉnh sửa người dùng"}
                </DialogTitle>
                <DialogDescription>
                  {mode === "create"
                    ? "Tạo user mới (demo)."
                    : "Cập nhật thông tin. Nếu không nhập mật khẩu thì giữ nguyên."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tên
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={busy}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    disabled={busy}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mật khẩu{" "}
                    {mode === "edit" ? (
                      <span className="text-xs text-slate-500">
                        (để trống nếu không đổi)
                      </span>
                    ) : null}
                  </label>
                  <Input
                    type="password"
                    value={form.password || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    disabled={busy}
                    placeholder={mode === "edit" ? "••••••••" : "Nhập mật khẩu"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vai trò
                    </label>
                    <Select
                      value={form.role}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, role: v as Role }))
                      }
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="reporter">Reporter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cơ sở
                    </label>
                    <Select
                      value={form.facility_id ?? "none"}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          facility_id: v === "none" ? null : v,
                        }))
                      }
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cơ sở" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Không chọn —</SelectItem>
                        {facilities.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {mode === "edit" ? (
                    <Badge className="bg-slate-100 text-slate-700">
                      ID: <span className="ml-1 font-mono">{form.id}</span>
                    </Badge>
                  ) : (
                    <span />
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => setOpen(false)}
                      disabled={busy}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={saveUser}
                      disabled={busy}
                    >
                      {busy ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* {delete dialog} */}
          <Dialog
            open={deleteOpen}
            onOpenChange={(v) => !busy && setDeleteOpen(v)}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  Xác nhận xoá người dùng
                </DialogTitle>
                <DialogDescription>
                  {deleteTarget ? (
                    <>
                      Bạn có chắc muốn <b>xoá (ẩn)</b> user{" "}
                      <b>{deleteTarget.name}</b>?
                      <br />
                      Hành động này sẽ set <code>is_active=false</code>.
                    </>
                  ) : (
                    "—"
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  disabled={busy}
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeleteTarget(null);
                  }}
                >
                  Huỷ
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={busy || !deleteTarget}
                  onClick={confirmDeleteUser}
                >
                  {busy ? "Đang xoá..." : "Xoá"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ProtectedLayout>
  );
}
