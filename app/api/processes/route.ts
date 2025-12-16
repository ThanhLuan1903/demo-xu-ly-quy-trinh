// app/api/processes/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()

    let query = supabaseAdmin
      .from("processes")
      .select("id,code,name,description,version,is_active,created_at")
      .order("created_at", { ascending: false })

    if (q) {
      // search name/code/description
      query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%`)
    }

    const { data, error } = await query
    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch processes" }, { status: 500 })
  }
}
