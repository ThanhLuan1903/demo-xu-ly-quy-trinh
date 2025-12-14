import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { readDb, writeDb } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ✅ params là Promise
) {
  try {
    const { id } = await params                      // ✅ unwrap

    const { author_id, message } = await req.json()

    const incidentId = String(id || "")
    if (!incidentId) return NextResponse.json({ error: "Missing incident id" }, { status: 400 })
    if (!author_id) return NextResponse.json({ error: "Missing author_id" }, { status: 400 })
    if (!message || !String(message).trim()) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 })
    }

    const db = await readDb()
    db.incident_comments = db.incident_comments || []
    db.incidents = db.incidents || []

    const idx = db.incidents.findIndex((i: any) => String(i.id) === String(incidentId))
    if (idx === -1) return NextResponse.json({ error: "Incident not found" }, { status: 404 })

    const now = new Date().toISOString()
    const newComment = {
      id: crypto.randomUUID(),
      incident_id: incidentId,               // ✅ key đúng để JOIN
      author_id: String(author_id),
      message: String(message).trim(),       // (hoặc đổi thành content nếu UI cần)
      created_at: now,
    }

    db.incident_comments.push(newComment)
    db.incidents[idx] = { ...db.incidents[idx], updated_at: now }

    await writeDb(db)
    return NextResponse.json(newComment, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
