import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase"

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const incidentId = String(id || "")
    if (!incidentId) return err("Missing incident id", 400)

    const body = await req.json().catch(() => ({}))
    const author_id = String(body.author_id || "").trim()
    const message = String(body.message || "").trim()

    if (!author_id) return err("Missing author_id", 400)
    if (!message) return err("Missing message", 400)

    // validate relations: incident exists + author exists
    const [incRes, userRes] = await Promise.all([
      supabaseAdmin.from("incidents").select("id").eq("id", incidentId).maybeSingle(),
      supabaseAdmin.from("users").select("id").eq("id", author_id).maybeSingle(),
    ])
    if (incRes.error || userRes.error) return err("Failed to validate relations", 500)
    if (!incRes.data) return err("Incident not found", 404)
    if (!userRes.data) return err("Invalid author_id", 400)

    const now = new Date().toISOString()
    const newComment = {
      id: crypto.randomUUID(),
      incident_id: incidentId,
      author_id,
      message,
      created_at: now,
    }

    const { error: cErr } = await supabaseAdmin.from("incident_comments").insert(newComment)
    if (cErr) {
      console.error(cErr)
      return err("Failed to add comment", 500)
    }

    // bump updated_at (trigger only runs on UPDATE)
    const { error: bumpErr } = await supabaseAdmin
      .from("incidents")
      .update({ updated_at: now })
      .eq("id", incidentId)
    if (bumpErr) console.error(bumpErr)

    return NextResponse.json(newComment, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
