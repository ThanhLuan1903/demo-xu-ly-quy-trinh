import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
function normalizeQ(s: string) {
  // normalize thêm ở JS cho chắc: "Đ/đ" -> "d", bỏ dấu unicode
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function normalizeSearchText(name: string, email: string) {
  // bản tối giản (không bỏ dấu ở JS). DB trigger sẽ unaccent chuẩn.
  return `${name} ${email}`.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const facility_id = searchParams.get("facility_id");

    let query = supabaseAdmin
      .from("users")
      .select("id,name,email,role,facility_id,created_at,is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (role) query = query.eq("role", role);
    if (facility_id) query = query.eq("facility_id", facility_id);
    const qRaw = searchParams.get("q") || "";
    const q = normalizeQ(qRaw);
    if (q) query = query.ilike("search_text", `%${q}%`);

    const { data, error } = await query;
    if (error) {
      console.error("GET users error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (e) {
    console.error("GET users exception:", e);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

type CreateUserBody = {
  name?: string;
  email?: string;
  password?: string; // demo: plain text
  role?: "admin" | "reporter";
  facility_id?: string | null;
  is_active?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CreateUserBody;

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const role = body.role;
    const facility_id = body.facility_id ?? null;
    const is_active = body.is_active ?? true;

    if (!name)
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    if (!password)
      return NextResponse.json({ error: "Missing password" }, { status: 400 });
    if (!role || !["admin", "reporter"].includes(role))
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    // (optional) validate facility exists if provided
    if (facility_id) {
      const { data: f, error: fErr } = await supabaseAdmin
        .from("facilities")
        .select("id")
        .eq("id", facility_id)
        .maybeSingle();
      if (fErr)
        return NextResponse.json(
          { error: "Failed to validate facility" },
          { status: 500 }
        );
      if (!f)
        return NextResponse.json(
          { error: "Invalid facility_id" },
          { status: 400 }
        );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        name,
        email,
        password, // demo: plain text
        role,
        facility_id,
        is_active,
        search_text: normalizeSearchText(name, email),
      })
      .select("id,name,email,role,facility_id,created_at,is_active")
      .maybeSingle();

    if (error) {
      console.error("POST users error:", error);
      // email unique -> bắt lỗi dễ hiểu
      if (
        String(error.message || "")
          .toLowerCase()
          .includes("duplicate")
      ) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error("POST users exception:", e);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
