// app/api/googleAI/route.ts
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { PROCESS_CSVCKT_MIN, PROCESS_KKTS_MIN, PROCESS_MSHHDV_MIN, PROCESS_THTS_MIN, PROCESS_TLTS_MIN } from "@/constant/constant"

export const runtime = "nodejs" // quan trọng khi deploy Vercel

type ClientMsg = {
  text: string
  sender: "user" | "ai"
}

type GenAIRole = "user" | "model"

function prettifyLinks(md: string) {
  if (!md) return md;

  // Case 1: "(Link:https://...)" hoặc "(Link: https://...)"
  md = md.replace(
    /\(Link:\s*(https?:\/\/[^\s)]+)\s*\)/gi,
    (_m, url) => `([Tải biểu mẫu](${url}))`
  );

  // Case 2: "Link:https://..." (không có ngoặc)
  md = md.replace(
    /Link:\s*(https?:\/\/[^\s)]+)\s*/gi,
    (_m, url) => `[Tải biểu mẫu](${url})`
  );

  // Case 3: "Biểu mẫu: Tên ( [Tải...] )" -> giữ, không đụng thêm
  return md;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})
const DOC_PACK = `
${PROCESS_TLTS_MIN}

${PROCESS_KKTS_MIN}

${PROCESS_THTS_MIN}

${PROCESS_CSVCKT_MIN}

${PROCESS_MSHHDV_MIN}
`


// ====== 2) System instruction (khóa nguồn + ép format) ======
const SYSTEM_INSTRUCTION = `
Bạn là trợ lý nội bộ về quy trình và biểu mẫu của Trường.
Bạn CHỈ được phép trả lời dựa trên "TÀI LIỆU NỘI BỘ" được cung cấp trong hội thoại.
TUYỆT ĐỐI KHÔNG dùng kiến thức chung hoặc suy đoán.
Nếu câu hỏi vượt ngoài tài liệu → trả lời đúng 1 câu: "Chưa có thông tin trong tài liệu nội bộ đã cung cấp."

YÊU CẦU ĐỊNH DẠNG:
- Trả lời Markdown.
- Không viết 1 đoạn dài.
- Ưu tiên gạch đầu dòng.
- Khi trả lời về 1 bước: luôn có các mục: Nội dung công việc/ Chủ trì / Phối hợp / Kết quả / Thời hạn / Biểu mẫu (nếu tài liệu có).
- Nếu có URL biểu mẫu: PHẢI viết theo Markdown link dạng: Biểu mẫu: [Tên biểu mẫu](URL)
`

function buildContents(message: string, history: ClientMsg[]) {
  const docContext = {
    role: "user" as const,
    parts: [
      {
        text: `TÀI LIỆU NỘI BỘ (dùng làm nguồn duy nhất):
${DOC_PACK}
`,
      },
    ],
  }

 const historyContents = (history || []).map((m) => {
  const role: GenAIRole = m.sender === "user" ? "user" : "model"

  return {
    role,
    parts: [{ text: m.text }],
  }
})

  const latest = { role: "user" as const, parts: [{ text: message }] }

  return [docContext, ...historyContents, latest]
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const message = String(body?.message || "").trim()
    const history = (body?.history || []) as ClientMsg[]

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 })
    }

    const contents = buildContents(message, history)

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    })
const raw = resp.text || "";
const pretty = prettifyLinks(raw);

return NextResponse.json({ reply: pretty });

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Google AI failed" }, { status: 500 })
  }
}
