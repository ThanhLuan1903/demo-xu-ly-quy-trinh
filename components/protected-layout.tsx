"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredRole?: "admin" | "reporter"
}

type User = {
  role: "admin" | "reporter"
  name?: string
  email?: string
}

export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ✅ lift state lên layout để main biết sidebar đang collapsed hay không
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const userCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="))
      ?.split("=")[1]

    if (!userCookie) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userCookie)) as User

      if (requiredRole && userData.role !== requiredRole) {
        router.push(userData.role === "admin" ? "/admin/dashboard" : "/reporter/dashboard")
        return
      }

      setUser(userData)
    } catch {
      router.push("/login")
      return
    } finally {
      setLoading(false)
    }
  }, [router, requiredRole])

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // ✅ khớp đúng width sidebar trong Sidebar.tsx
  const sidebarWidth = sidebarCollapsed ? 84 : 288 // px

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        role={user.role}
        userName={user.name || user.email || "User"}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* ✅ main đổi margin-left theo collapsed */}
      <main
        className="transition-[margin] duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </div>
  )
}
