"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Image from "next/image";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // ✅ lưu localStorage
      console.log("data.user", data.user);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      router.replace(
        data.user.role === "admin" ? "/admin/dashboard" : "/reporter/dashboard"
      );
      router.refresh();
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-lg mb-4 bg-white">
            <Image
              src="/logo-dnc.png"
              alt="DNC Logo"
              width={140}
              height={140}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI OFFICE</h1>
          <p className="text-slate-600">
            Hệ thống trợ lý ảo quản trị Tổ chức hành chính
          </p>
        </div>

        <Card className="p-8 shadow-lg border-0">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Đăng nhập tài khoản
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              {loading ? "Đang đăng nhập ..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-800 tracking-wide mb-4">
              Tài khoản demo:
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-900">Admin:</span>
                </p>
                <p className="text-slate-500">admin@example.com / admin123</p>
              </div>
              <div>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Reporter:
                  </span>
                </p>
                <p className="text-slate-500">
                  reporter@example.com / reporter123
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
