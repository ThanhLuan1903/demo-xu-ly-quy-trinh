import { NextRequest, NextResponse } from "next/server"
import { readDb, writeDb } from "@/lib/db"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // ✅ unwrap params promise

    const body = await req.json()
    const { status } = body

    const db = await readDb()
    const incidents = db.incidents || []

    const idx = incidents.findIndex((x: any) => String(x.id) === String(id))
    if (idx === -1) return NextResponse.json({ error: "Incident not found" }, { status: 404 })

    incidents[idx] = {
      ...incidents[idx],
      status,
      updated_at: new Date().toISOString(),
    }

    db.incidents = incidents
    await writeDb(db)

    return NextResponse.json(incidents[idx], { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 })
  }
}
