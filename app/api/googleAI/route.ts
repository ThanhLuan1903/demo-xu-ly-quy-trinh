// app/api/googleAI/route.ts
import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export const runtime = "nodejs" // quan trọng khi deploy Vercel

type ClientMsg = {
  text: string
  sender: "user" | "ai"
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// ====== 1) TÀI LIỆU NỘI BỘ (bạn có thể bổ sung thêm bước) ======
const PROCESS_TLTS = `
QUY TRÌNH: THANH LÝ TÀI SẢN (QT.0x/CĐĐN-TCHCQT)

BƯỚC 1 — Đơn vị quản lý tài sản lập giấy đề nghị
- Nội dung: Đơn vị quản lý/sử dụng xác định tài sản không còn nhu cầu hoặc tần suất sử dụng thấp/khai thác không hiệu quả; hoặc có nhu cầu nhưng chưa trang bị → chủ động đề xuất.
- Chủ trì: Trưởng đơn vị có yêu cầu
- Phối hợp: Phòng TCHC-QT
- Kết quả: Giấy đề nghị
- Thời hạn: (không nêu)
- Biểu mẫu: M.01/QT.0x/CĐĐN-TCHCQT

BƯỚC 2 — Tổng hợp danh sách tài sản cần thanh lý
- Nội dung: Trưởng phòng TCHC-QT kiểm tra, đối chiếu hồ sơ và xác định tài sản theo đề nghị; không đồng ý thì phản hồi; đồng ý thì tham mưu BGH phụ trách cơ sở phê duyệt.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính và các đơn vị liên quan
- Kết quả: Giấy đề nghị (đã được xem xét)
- Thời hạn: 3 ngày
- Biểu mẫu: (không nêu)

BƯỚC 3 — Kiểm tra, đánh giá hiện trạng
- Nội dung: Kiểm tra xác nhận tình trạng; kiến nghị hướng xử lý đúng quy định tài chính.
- Chủ trì: Trưởng phòng TC
- Phối hợp: Trưởng phòng TCHC-QT
- Kết quả: Biên bản hiện trạng
- Thời hạn: 2 ngày
- Biểu mẫu: M.02/QT.01/CĐĐN-TCHCQT

BƯỚC 4 — Xét duyệt yêu cầu, danh mục đề xuất
- Nội dung: Tổng hợp đề xuất; căn cứ biên bản kiểm kê/hiện trạng; lập danh mục tài sản cần thu hồi; lập kế hoạch thanh lý; tham mưu thành lập Hội đồng TLTS.
- Chủ trì: Trưởng phòng TC / Trưởng phòng TCHC-QT (tùy nội dung)
- Phối hợp: Đơn vị có tài sản cần thu hồi
- Kết quả: Danh mục tài sản cần thu hồi; Kế hoạch thanh lý tài sản; Quyết định thành lập Hội đồng TLTS
- Thời hạn: 2 ngày (theo từng nội dung)
- Biểu mẫu: M.03/QT.0x/...; M.04/QT.0x/...; M.05/QT.0x/... (nếu áp dụng)
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
- Khi trả lời về 1 bước: luôn có các mục: Chủ trì / Phối hợp / Kết quả / Thời hạn / Biểu mẫu (nếu tài liệu có).
`

function buildContents(message: string, history: ClientMsg[]) {
  const docContext = {
    role: "user" as const,
    parts: [
      {
        text: `TÀI LIỆU NỘI BỘ (dùng làm nguồn duy nhất):
${PROCESS_TLTS}
`,
      },
    ],
  }

  const historyContents = (history || []).map((m) => ({
    role: (m.sender === "user" ? "user" : "model") as const,
    parts: [{ text: m.text }],
  }))

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

    return NextResponse.json({ reply: resp.text || "" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Google AI failed" }, { status: 500 })
  }
}
