import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const status = String(body.status || "").trim()

    if (!id) return err("Missing incident id", 400)
    if (!status) return err("Missing status", 400)

    // update (trigger sẽ tự set updated_at)
    const { data, error } = await supabaseAdmin
      .from("incidents")
      .update({ status })
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error(error)
      return err("Failed to update incident", 500)
    }
    if (!data) return err("Incident not found", 404)

    return NextResponse.json(data, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 })
  }
}
