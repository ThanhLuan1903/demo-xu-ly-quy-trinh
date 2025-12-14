import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import crypto from "crypto"
import { readDb, writeDb } from "@/lib/db"

function fileTypeFromMime(mime: string) {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "file"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const viewer_id = searchParams.get("viewer_id") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    const q = (searchParams.get("q") || "").toLowerCase()

    const db = await readDb()
    const users = db.users || []
    let incidents = db.incidents || []
    const attachments = db.incident_attachments || []
    console.log("incidents_comments", db.incidents_comments);
    const comments = db.incident_comments || []

    // ✅ filter by role
    if (role === "reporter" && viewer_id) {
      incidents = incidents.filter((i: any) => String(i.reporter_id) === String(viewer_id))
    }
    if (role === "admin" && viewer_id) {
      incidents = incidents.filter((i: any) => String(i.assigned_to) === String(viewer_id))
    }

    // optional filters
    if (status) incidents = incidents.filter((i: any) => i.status === status)
    if (q) {
      incidents = incidents.filter(
        (i: any) =>
          (i.title || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q),
      )
    }

    // sort newest first
    incidents.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // join
    const result = incidents.map((i: any) => {
      const reporter = users.find((u: any) => String(u.id) === String(i.reporter_id)) || null
      const assignee = users.find((u: any) => String(u.id) === String(i.assigned_to)) || null

      const atts = attachments.filter((a: any) => String(a.incident_id) === String(i.id))
      const cmts = comments
        .filter((c: any) => String(c.incident_id) === String(i.id))
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((c: any) => ({
          ...c,
          author: users.find((u: any) => String(u.id) === String(c.author_id)) || null,
        }))

      return {
        ...i,
        reporter,
        assignee,
        attachments: atts,
        comments: cmts,
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
  }
}



export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()

    const title = String(form.get("title") || "").trim()
    const description = String(form.get("description") || "").trim()
    const proposed_fix = String(form.get("proposed_fix") || "").trim()
    const priority = String(form.get("priority") || "medium")
    const assigned_to = String(form.get("assigned_to") || "").trim()

    // ✅ Lấy user đang đăng nhập từ client gửi lên (demo)
    // Anh đang lưu localStorage => server không đọc được localStorage.
    // Vì vậy client cần gửi reporter_id + facility_id đúng.
    const reporter_id = String(form.get("reporter_id") || "").trim()
    const facility_id = String(form.get("facility_id") || "").trim()

    if (!title || !description) {
      return NextResponse.json({ error: "Missing title/description" }, { status: 400 })
    }
    if (!reporter_id || !facility_id) {
      return NextResponse.json({ error: "Missing reporter_id/facility_id" }, { status: 400 })
    }
    if (!assigned_to) {
      return NextResponse.json({ error: "Missing assigned_to (admin)" }, { status: 400 })
    }

    const db = await readDb()

    const incidentId = crypto.randomUUID()
    const now = new Date().toISOString()

    const newIncident = {
      id: incidentId,
      facility_id,
      reporter_id,
      title,
      description,
      proposed_fix,
      priority,
      status: "assigned", // theo luồng: reporter tạo -> assigned cho admin
      assigned_to,
      created_at: now,
      updated_at: now,
    }

    db.incidents = db.incidents || []
    db.incidents.push(newIncident)

    // ✅ Save attachments
    const files = form.getAll("attachments") as File[]
    db.incident_attachments = db.incident_attachments || []

    const incidentFolder = path.join(process.cwd(), "public", "uploads", "incidents", incidentId)
    await fs.mkdir(incidentFolder, { recursive: true })

    for (const f of files) {
      if (!(f instanceof File)) continue
      if (!f.size) continue

      const safeName = (f.name || "file").replace(/[^\w.\-]+/g, "_")
      const finalName = `${Date.now()}_${safeName}`
      const diskPath = path.join(incidentFolder, finalName)

      const buf = Buffer.from(await f.arrayBuffer())
      await fs.writeFile(diskPath, buf)

      db.incident_attachments.push({
        id: crypto.randomUUID(),
        incident_id: incidentId,
        type: fileTypeFromMime(f.type || ""),
        url: `/uploads/incidents/${incidentId}/${finalName}`,
        filename: f.name,
        mime: f.type,
        size: f.size,
        created_at: now,
      })
    }

    await writeDb(db)

    return NextResponse.json(
      { incident: newIncident, attachments_count: files.length },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}
