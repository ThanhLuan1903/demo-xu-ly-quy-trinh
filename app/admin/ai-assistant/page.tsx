"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là AI Trợ lý của bạn. Tôi có thể giúp bạn với những câu hỏi về quy trình mua sắm, cách báo cáo sự cố, hoặc bất kỳ vấn đề nào khác. Hãy hỏi tôi điều gì đó!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;

    const textToSend = input.trim();

    const userMsg = {
      id: Date.now(),
      text: textToSend,
      sender: "user" as const,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    setInput("");

    try {
      // lấy history trước khi có phản hồi AI (lọc 10 msg gần nhất)
      const history = messages.slice(-10).map((m) => ({
        text: m.text,
        sender: m.sender,
      }));

      const res = await fetch("/api/googleAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history,
        }),
      });

      const data = await res.json();
      const aiMsg = {
        id: Date.now() + 1,
        text: data.reply || "(Không có phản hồi)",
        sender: "ai" as const,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Không kết nối được với AI. Thử lại nhé!",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="">
        <div className="">
          {/* App Frame */}
          <div className="overflow-hidden border-slate-200/70">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      AI Chatbot
                    </h1>
                    <p className="text-sm text-slate-500">
                      Hỏi nhanh về hệ thống, quy trình, biểu mẫu
                    </p>
                  </div>
                </div>

                {/* optional: badge trạng thái */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_50%)]">
              <div className="h-[calc(100vh-16rem)] md:h-[calc(100vh-18rem)] overflow-y-auto px-5 py-6">
                {/* Empty state */}
                {messages.length === 0 && !sending && (
                  <div className="mx-auto max-w-xl text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5">
                      <MessageCircle className="h-6 w-6 text-slate-700" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Bắt đầu một cuộc hội thoại
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Ví dụ: “Quy trình thanh lý tài sản gồm những bước nào?”
                      hoặc “Cho tôi mẫu tờ trình mua sắm”.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {[
                        "Quy trình thanh lý tài sản?",
                        "Mẫu biên bản bàn giao?",
                        "Hướng dẫn lập đề xuất mua sắm?",
                        "Quy trình xử lý sự cố điện nước?",
                      ].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setInput(q)}
                          className="rounded-full border bg-white/70 px-3 py-1 text-xs text-slate-700 hover:bg-white"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-5">
                  {messages.map((m) => {
                    const isUser = m.sender === "user";
                    return (
                      <div
                        key={m.id}
                        className={`flex items-end gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* Avatar left for AI */}
                        {!isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                            <span className="text-xs font-semibold">AI</span>
                          </div>
                        )}

                        <div
                          className={`group max-w-[85%] md:max-w-[70%] ${
                            isUser ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`relative rounded-2xl px-4 py-3 shadow-sm ring-1 ${
                              isUser
                                ? "bg-blue-600 text-white ring-blue-600/20"
                                : "bg-white text-slate-900 ring-slate-200"
                            }`}
                          >
                            {/* bubble tail */}
                            <span
                              className={`absolute bottom-2 h-3 w-3 rotate-45 ${
                                isUser
                                  ? "-right-1 bg-blue-600"
                                  : "-left-1 bg-white ring-1 ring-slate-200"
                              }`}
                            />

                            <div
                              className={`prose max-w-none text-sm leading-relaxed ${
                                isUser
                                  ? "prose-invert prose-p:my-2 prose-li:my-1"
                                  : "prose-slate prose-p:my-2 prose-li:my-1"
                              }`}
                            >
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {m.text}
                              </ReactMarkdown>
                            </div>

                            <div
                              className={`mt-2 flex items-center justify-between text-[11px] ${
                                isUser ? "text-blue-100" : "text-slate-500"
                              }`}
                            >
                              <span>
                                {m.timestamp.toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {/* optional: hover actions */}
                              <span className="opacity-0 transition group-hover:opacity-100">
                                {/* ví dụ: copy */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigator.clipboard.writeText(m.text)
                                  }
                                  className={`rounded px-2 py-0.5 ${
                                    isUser
                                      ? "hover:bg-white/10"
                                      : "hover:bg-slate-100"
                                  }`}
                                >
                                  Copy
                                </button>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Avatar right for User */}
                        {isUser && (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                            <span className="text-xs font-semibold">You</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing */}
                  {sending && (
                    <div className="flex items-end gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <span className="text-xs font-semibold">AI</span>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                        <div className="flex gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                          <div
                            className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="border-t bg-white/80 backdrop-blur">
                <div className="px-5 py-4">
                  <div className="flex items-end gap-2">
                    {/* nếu đang dùng Input của shadcn thì đổi sang Textarea cho “chat feel” */}
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Nhập câu hỏi... (Enter để gửi, Shift+Enter để xuống dòng)"
                      disabled={sending}
                      rows={1}
                      className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                    />

                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !input.trim()}
                      className="h-11 rounded-xl px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Tip: nhập “/” để gợi ý câu hỏi nhanh</span>
                    <span>{input.trim().length}/2000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
