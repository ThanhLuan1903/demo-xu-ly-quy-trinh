import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { supabaseAdmin } from "@/lib/supabase"

const BUCKET = process.env.SUPABASE_BUCKET_INCIDENTS || "incident-attachments"

function fileTypeFromMime(mime: string) {
  if (!mime) return "file"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "file"
}

function safeFileName(name: string) {
  return (name || "file").replace(/[^\w.\-]+/g, "_")
}

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const viewer_id = searchParams.get("viewer_id") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || ""
    const q = (searchParams.get("q") || "").toLowerCase()

    // 1) query incidents
    let incQ = supabaseAdmin
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })

    if (role === "reporter" && viewer_id) incQ = incQ.eq("reporter_id", viewer_id)
    if (role === "admin" && viewer_id) incQ = incQ.eq("assigned_to", viewer_id)
    if (status) incQ = incQ.eq("status", status)
    if (q) incQ = incQ.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

    const { data: incidents, error: incErr } = await incQ
    if (incErr) {
      console.error(incErr)
      return err("Failed to fetch incidents", 500)
    }

    const incList = incidents || []
    const incidentIds = incList.map((i) => i.id)

    // 2) fetch all users & facilities used for join
    const [{ data: users, error: uErr }, { data: facilities, error: fErr }] = await Promise.all([
      supabaseAdmin.from("users").select("id,name,email,role,facility_id"),
      supabaseAdmin.from("facilities").select("*"),
    ])
    if (uErr) return err("Failed to fetch users", 500)
    if (fErr) return err("Failed to fetch facilities", 500)

    const usersList = users || []
    const facilitiesList = facilities || []

    // 3) attachments & comments by incidentIds
    let attachments: any[] = []
    let comments: any[] = []

    if (incidentIds.length) {
      const [attRes, cmtRes] = await Promise.all([
        supabaseAdmin.from("incident_attachments").select("*").in("incident_id", incidentIds),
        supabaseAdmin
          .from("incident_comments")
          .select("*")
          .in("incident_id", incidentIds)
          .order("created_at", { ascending: true }),
      ])

      if (attRes.error) return err("Failed to fetch attachments", 500)
      if (cmtRes.error) return err("Failed to fetch comments", 500)

      attachments = attRes.data || []
      comments = cmtRes.data || []
    }

    // 4) join result
    const result = incList.map((i: any) => {
      const reporter = usersList.find((u: any) => String(u.id) === String(i.reporter_id)) || null
      const assignee = usersList.find((u: any) => String(u.id) === String(i.assigned_to)) || null
      const facility = facilitiesList.find((f: any) => String(f.id) === String(i.facility_id)) || null

      const atts = attachments.filter((a: any) => String(a.incident_id) === String(i.id))
      const cmts = comments
        .filter((c: any) => String(c.incident_id) === String(i.id))
        .map((c: any) => ({
          ...c,
          author: usersList.find((u: any) => String(u.id) === String(c.author_id)) || null,
        }))

      return { ...i, reporter, assignee, facility, attachments: atts, comments: cmts }
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
    const priority = String(form.get("priority") || "medium").trim()
    const assigned_to = String(form.get("assigned_to") || "").trim()

    const reporter_id = String(form.get("reporter_id") || "").trim()
    const facility_id = String(form.get("facility_id") || "").trim()

    if (!title || !description) return err("Missing title/description", 400)
    if (!reporter_id || !facility_id) return err("Missing reporter_id/facility_id", 400)

    // validate FK: facility & reporter exist
    const [repRes, facRes] = await Promise.all([
      supabaseAdmin.from("users").select("id").eq("id", reporter_id).maybeSingle(),
      supabaseAdmin.from("facilities").select("id").eq("id", facility_id).maybeSingle(),
    ])

    if (repRes.error || facRes.error) return err("Failed to validate relations", 500)
    if (!repRes.data) return err("Invalid reporter_id", 400)
    if (!facRes.data) return err("Invalid facility_id", 400)

    // assigned_to optional (schema allows null)
    if (assigned_to) {
      const asg = await supabaseAdmin.from("users").select("id").eq("id", assigned_to).maybeSingle()
      if (asg.error) return err("Failed to validate assigned_to", 500)
      if (!asg.data) return err("Invalid assigned_to", 400)
    }

    const incidentId = crypto.randomUUID()
    const now = new Date().toISOString()

    // ✅ status must be in ('open','in_progress','resolved')
    const newIncident = {
      id: incidentId,
      facility_id,
      reporter_id,
      title,
      description,
      proposed_fix,
      priority,
      status: "open",
      assigned_to: assigned_to || null,
      created_at: now,
      updated_at: now,
    }

    const { error: insErr } = await supabaseAdmin.from("incidents").insert(newIncident)
    if (insErr) {
      console.error(insErr)
      return err("Failed to create incident", 500)
    }

    // Upload attachments to Supabase Storage
    const files = form.getAll("attachments") as File[]
    const rows: any[] = []

    for (const f of files) {
      if (!(f instanceof File)) continue
      if (!f.size) continue

      const finalName = `${Date.now()}_${safeFileName(f.name)}`
      const storagePath = `incidents/${incidentId}/${finalName}`

      const buf = Buffer.from(await f.arrayBuffer())
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, buf, {
          contentType: f.type || "application/octet-stream",
          upsert: false,
        })

      if (upErr) {
        console.error("Upload error:", upErr)
        continue
      }

      // Public URL (bucket public). Nếu bucket private: cần signed url.
      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath)

      rows.push({
        id: crypto.randomUUID(),
        incident_id: incidentId,
        type: fileTypeFromMime(f.type || ""),
        url: pub?.publicUrl || storagePath,
        filename: f.name,
        mime: f.type,
        size: f.size,
        created_at: now,
      })
    }

    if (rows.length) {
      const { error: attErr } = await supabaseAdmin.from("incident_attachments").insert(rows)
      if (attErr) console.error(attErr)
    }

    return NextResponse.json({ incident: newIncident, attachments_count: rows.length }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create incident" }, { status: 500 })
  }
}
