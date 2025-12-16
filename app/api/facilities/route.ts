import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    let query = supabaseAdmin
      .from("facilities")
      .select("id,name,location,description,created_at")
      .order("created_at", { ascending: false });

    if (q) {
      // search nhẹ theo tên / location
      query = query.or(`name.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("GET facilities error:", error);
      return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (e) {
    console.error("GET facilities exception:", e);
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  }
}
