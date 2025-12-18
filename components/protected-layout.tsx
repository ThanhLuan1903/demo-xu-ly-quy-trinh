"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { LoadingSpinner } from "./loading";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "reporter";
}

type User = {
  id?: string;
  role: "admin" | "reporter";
  name?: string;
  email?: string;
  facility_id?: string | null;
};

export function ProtectedLayout({
  children,
  requiredRole,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTabletDown, setIsTabletDown] = useState(false);

  useEffect(() => {
    // ✅ chỉ đọc localStorage
    const raw = localStorage.getItem("user");

    if (!raw) {
      setLoading(false);
      if (pathname !== "/login") router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as User;

      if (!parsed?.role) {
        localStorage.removeItem("user");
        setLoading(false);
        router.replace("/login");
        return;
      }

      // ✅ check role
      if (requiredRole && parsed.role !== requiredRole) {
        setUser(parsed);
        setLoading(false);
        router.replace(
          parsed.role === "admin" ? "/admin/dashboard" : "/reporter/dashboard"
        );
        return;
      }

      setUser(parsed);
    } catch (e) {
      console.error("Bad localStorage user:", e);
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    } finally {
      setLoading(false);
    }
  }, [router, requiredRole, pathname]);
  useEffect(() => {
    // md trở xuống: <= 767px
    const mq = window.matchMedia("(max-width: 767px)");

    const apply = () => {
      const small = mq.matches;
      setIsTabletDown(small);
      if (small) setSidebarCollapsed(true); // ép collapse
    };

    apply();

    // Safari/old Chrome fallback
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner size={64} />;
  }

  if (!user) return null;
  const sidebarWidth = sidebarCollapsed ? 84 : 288;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        role={user.role}
        userName={user.name || user.email || "User"}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className="transition-[margin] duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
