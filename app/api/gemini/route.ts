// app/api/gemini/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// === 1. Đọc API Key từ env (bảo mật tuyệt đối) ===
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");



// === 2. Schema validate response từ Gemini ===
const GeminiResponseSchema = z.object({
  reply: z.string().min(1),
  matchedProcessId: z.string().optional(),
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().nullable().optional(), // THÊM .nullable() Ở ĐÂY
});

type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

// === 3. Cache data processes + forms (tăng tốc cực mạnh) ===
let cachedData: { processes: any[]; forms: any[] } | null = null;
async function getProcurementData() {
  if (cachedData) return cachedData;

  try {
    const [procRes, formRes] = await Promise.all([
    //   fetch(
    //     // `${
    //     //   process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
    //     // }/api/procurement_processes`
    //   ),
    //   fetch(
    //     // `${
    //     //   process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
    //     // }/api/process-forms`
    //   ),

    fetch("http://localhost:3001/procurement_processes"),
    fetch("http://localhost:3001/process_forms"),
    ]);

    const processes = await procRes.json();
    const forms = await formRes.json();

    cachedData = { processes, forms };
    return cachedData;
  } catch (error) {
    console.error("Lỗi load data quy trình:", error);
    throw new Error("Không thể tải dữ liệu quy trình");
  }
}

// === 4. API Route Handler ===
// export async function POST(req: NextRequest) {
//   try {
//     // Lấy tin nhắn từ user
//     const { message, history } = await req.json();

//     if (!message?.trim()) {
//       return NextResponse.json({ error: "Tin nhắn trống" }, { status: 400 });
//     }

//     // Load data quy trình + biểu mẫu
//     const { processes, forms } = await getProcurementData();

//     // Tạo prompt siêu thông minh
//     const systemPrompt = `
// Bạn là AI trợ lý mua sắm chuyên nghiệp của công ty, trả lời bằng tiếng Việt, thân thiện, ngắn gọn, chính xác.

// Danh sách quy trình mua sắm hiện có sẵn:
// ${processes
//   .map(
//     (p: any) => `
// - ID: ${p.id}
//   Tiêu đề: ${p.title}
//   Phiên bản: ${p.version}
//   Mô tả: ${p.description}
//   Từ khóa: ${p.tags?.join(", ")}
//   Các bước: ${p.steps.join(" → ")}
// `
//   )
//   .join("\n")}

// Biểu mẫu liên quan:
// ${forms
//   .map(
//     (f: any) => `
// - Process ID: ${f.process_id}
//   Tên biểu mẫu: ${f.title}
//   File: ${
//     f.filename ? `/uploads/${f.filename}` : f.external_link || "Liên kết ngoài"
//   }
// `
//   )
//   .join("\n")}

// Hãy phân tích tin nhắn người dùng và làm 1 trong các việc sau:
// 1. Nếu rõ ràng thuộc quy trình nào → trả về matchedProcessId và reply chi tiết (có liệt kê bước + link tải biểu mẫu)
// 2. Nếu mơ hồ hoặc có thể thuộc nhiều quy trình → đặt câu hỏi làm rõ (needsClarification: true)
// 3. Nếu không liên quan → trả lời lịch sự rằng bạn chỉ hỗ trợ về quy trình mua sắm

// Lịch sử trò chuyện (nếu có):
// ${
//   history
//     ?.map((m: any) => `${m.sender === "user" ? "Người dùng" : "AI"}: ${m.text}`)
//     .join("\n") || "Chưa có"
// }

// Trả về đúng định dạng JSON sau, không thêm text thừa:
// {
//   "reply": "nội dung trả lời",
//   "matchedProcessId": "1" hoặc null,
//   "needsClarification": true/false,
//   "clarificationQuestion": "câu hỏi làm rõ nếu cần"
// }
// `;


// const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

//     const result = await model.generateContent([
//       systemPrompt,
//       `Tin nhắn mới nhất: ${message}`,
//     ]);

//     const text = result.response.text();

//     // Làm sạch JSON từ Gemini (nó hay thêm ```json)
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       throw new Error("Gemini không trả về JSON hợp lệ");
//     }

//     const parsed = GeminiResponseSchema.safeParse(JSON.parse(jsonMatch[0]));

//     if (!parsed.success) {
//       console.error("Zod validate failed:", parsed.error);
//       return NextResponse.json({
//         reply: "Xin lỗi, tôi chưa hiểu rõ. Bạn có thể nói cụ thể hơn không ạ?",
//         needsClarification: true,
//       });
//     }

//     const data = parsed.data;

//     // Nếu match được process → bổ sung link tải file đẹp hơn
//     if (data.matchedProcessId) {
//       const process = processes.find(
//         (p: any) => p.id === data.matchedProcessId
//       );
//       const relatedForms = forms.filter(
//         (f: any) => f.process_id === data.matchedProcessId
//       );

//       if (process) {
//         data.reply += `\n\n**Quy trình: ${process.title} (${process.version})**\n`;
//         data.reply += `${process.description}\n\n`;
//         data.reply += `**Các bước thực hiện:**\n${process.steps
//           .map((s: string, i: number) => `${i + 1}. ${s}`)
//           .join("\n")}\n\n`;

//         if (relatedForms.length > 0) {
//           data.reply += `**Biểu mẫu cần thiết:**\n`;
//           relatedForms.forEach((f: any) => {
//             const link = f.filename
//               ? `${
//                   process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
//                 }/uploads/${f.filename}`
//               : f.external_link;
//             data.reply += `• [${f.title}](${link})\n`;
//           });
//         } else {
//           data.reply += `Không có biểu mẫu đính kèm.\n`;
//         }
//       }
//     }

//     return NextResponse.json(data);
//   } catch (error: any) {
//     console.error("Lỗi Gemini API:", error);
//     return NextResponse.json(
//       {
//         reply: "Xin lỗi, hệ thống AI đang bận. Thử lại sau vài giây nhé!",
//         needsClarification: false,
//       },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: "Tin nhắn trống" }, { status: 400 })
    }

    const { processes, forms } = await getProcurementData();

    const systemPrompt = `
Bạn là AI trợ lý mua sắm chuyên nghiệp, trả lời tiếng Việt, thân thiện, chính xác.

Danh sách quy trình:
${processes.map((p: any) => `- ID: ${p.id} | ${p.title} | Từ khóa: ${p.tags?.join(", ")}`).join("\n")}

Biểu mẫu:
${forms.map((f: any) => `- ID quy trình ${f.process_id}: ${f.title}`).join("\n")}

Người dùng hỏi: "${message}"

Trả về JSON đúng định dạng (không thêm text thừa, không code block):
{
  "reply": "nội dung trả lời",
  "matchedProcessId": "1" hoặc null,
  "needsClarification": true hoặc false,
  "clarificationQuestion": "nếu cần hỏi lại"
}
`.trim()

// const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent(systemPrompt + `\n\nTin nhắn: ${message}`)
    const text = result.response.text()

    // Làm sạch JSON
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || "{}"
    const raw = JSON.parse(jsonStr)

    // FIX 3: Dùng transform để Zod không lỗi null
    const parsed = GeminiResponseSchema.parse({
      ...raw,
      matchedProcessId: raw.matchedProcessId || null,
      needsClarification: raw.needsClarification || false,
    })

    let reply = parsed.reply

    // Nếu có match → bổ sung thông tin đẹp
    if (parsed.matchedProcessId) {
      const process = processes.find((p: any) => p.id === parsed.matchedProcessId)
      const relatedForms = forms.filter((f: any) => f.process_id === parsed.matchedProcessId)

      if (process) {
        reply += `\n\n**Quy trình: ${process.title}**\n`
        reply += `${process.description}\n\n`
        reply += `**Các bước:**\n${process.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}`

        if (relatedForms.length > 0) {
          reply += `\n\n**Biểu mẫu:**\n`
          relatedForms.forEach((f: any) => {
            const link = f.filename 
              ? `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/uploads/${f.filename}`
              : f.external_link || "#"
            reply += `• [${f.title}](${link})\n`
          })
        }
      }
    }

    return NextResponse.json({
      reply,
      matchedProcessId: parsed.matchedProcessId,
      needsClarification: parsed.needsClarification || false,
      clarificationQuestion: parsed.clarificationQuestion,
    })

  } catch (error: any) {
    console.error("Lỗi Gemini:", error.message)
    return NextResponse.json({
      reply: "Xin lỗi, AI đang bận. Bạn thử lại sau 5 giây nhé!",
      needsClarification: false,
    })
  }
}
