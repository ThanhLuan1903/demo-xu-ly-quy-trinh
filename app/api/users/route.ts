import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    const facility_id = searchParams.get("facility_id") // optional

    let q = supabaseAdmin
      .from("users")
      .select("id,name,email,role,facility_id,created_at")
      .order("created_at", { ascending: false })

    if (role) q = q.eq("role", role)
    if (facility_id) q = q.eq("facility_id", facility_id)

    const { data, error } = await q
    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
