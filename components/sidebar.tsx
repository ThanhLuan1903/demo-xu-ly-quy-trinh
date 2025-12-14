"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Bot,
  ClipboardList,
  AlertTriangle,
  Users,
  ShoppingCart,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: "admin" | "reporter";
  userName?: string;
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
};

export function Sidebar({
  role,
  collapsed,
  onCollapsedChange,
  userName = "User",
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Tổng quan",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        iconColor: "text-blue-600",
      },
      {
        label: "Quy trình mua sắm",
        href: "/admin/procurement",
        icon: ShoppingCart,
        iconColor: "text-emerald-600",
      },
      {
        label: "Phản ánh sự cố",
        href: "/admin/incidents",
        icon: AlertTriangle,
        iconColor: "text-orange-600",
      },
      {
        label: "Quản lý người dùng",
        href: "/admin/users",
        icon: Users,
        iconColor: "text-indigo-600",
      },
      {
        label: "AI Trợ lý",
        href: "/admin/ai-assistant",
        icon: Bot,
        iconColor: "text-violet-600",
      },
    ],
    []
  );

  const reporterMenuItems: MenuItem[] = useMemo(
    () => [
      {
        label: "Tổng quan",
        href: "/reporter/dashboard",
        icon: LayoutDashboard,
        iconColor: "text-blue-600",
      },
      {
        label: "AI Chatbot",
        href: "/reporter/chatbot",
        icon: Bot,
        iconColor: "text-violet-600",
      },
      {
        label: "Quy trình",
        href: "/reporter/processes",
        icon: ClipboardList,
        iconColor: "text-emerald-600",
      },
      {
        label: "Báo cáo sự cố",
        href: "/reporter/reports",
        icon: AlertTriangle,
        iconColor: "text-orange-600",
      },
    ],
    []
  );

  const menuItems = role === "admin" ? adminMenuItems : reporterMenuItems;

  const handleLogout = () => {
    document.cookie = "user=; path=/; max-age=0";
    localStorage.removeItem("user");
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href;

  const widthClass = collapsed ? "w-[84px]" : "w-72";

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 h-screen",
        widthClass,
        "bg-white border-r border-slate-200",
        "transition-all duration-300",
      ].join(" ")}
    >
      {/* dùng flex-col để đẩy user xuống đáy */}
      <div className="flex h-full flex-col">
        {/* Header / Brand + Toggle bên phải */}
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-semibold shadow-sm">
              AI
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-slate-900">
                  AI Procurement
                </h1>
                <p className="truncate text-xs text-slate-500">
                  Management System
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="rounded-xl p-2 hover:bg-slate-100 text-slate-700"
            aria-label="Toggle sidebar"
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? (
              <PanelRightOpen className="h-5 w-5" />
            ) : (
              <PanelRightClose className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-3 py-3 transition",
                  "focus:outline-none focus:ring-4 focus:ring-blue-500/15",
                  active
                    ? "bg-blue-50 text-slate-900 ring-1 ring-blue-200"
                    : "text-slate-700 hover:bg-slate-100",
                  collapsed ? "justify-center" : "",
                ].join(" ")}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={["h-5 w-5", item.iconColor].join(" ")} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Spacer đẩy xuống đáy */}
        <div className="mt-auto" />

        {/* User Profile - luôn ở cuối */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            {!collapsed ? (
              <>
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                  {userName}
                </p>
                <p className="mt-1 text-xs text-slate-500 capitalize">{role}</p>
              </>
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-9 w-9 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-700 font-semibold">
                  U
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
