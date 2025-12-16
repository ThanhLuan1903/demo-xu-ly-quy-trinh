import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = String(id || "").trim();
  if (!userId) return err("Missing user id", 400);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role,facility_id,created_at,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("GET user error:", error);
    return err("Failed to fetch user", 500);
  }
  if (!data) return err("User not found", 404);

  return NextResponse.json(data, { status: 200 });
}

type UpdateUserBody = {
  name?: string;
  email?: string;
  password?: string; // demo plain text
  role?: "admin" | "reporter";
  facility_id?: string | null;
  is_active?: boolean;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = String(id || "").trim();
  if (!userId) return err("Missing user id", 400);

  const body = (await req.json().catch(() => ({}))) as UpdateUserBody;

  const payload: Record<string, any> = {};

  if (body.name !== undefined) {
    const name = String(body.name || "").trim();
    if (!name) return err("Invalid name", 400);
    payload.name = name;
  }

  if (body.email !== undefined) {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return err("Invalid email", 400);
    payload.email = email;
  }

  if (body.password !== undefined) {
    const password = String(body.password || "");
    if (!password) return err("Invalid password", 400);
    payload.password = password;
  }

  if (body.role !== undefined) {
    if (!body.role || !["admin", "reporter"].includes(body.role))
      return err("Invalid role", 400);
    payload.role = body.role;
  }

  if (body.facility_id !== undefined) {
    const facility_id = body.facility_id ?? null;
    if (facility_id) {
      const { data: f, error: fErr } = await supabaseAdmin
        .from("facilities")
        .select("id")
        .eq("id", facility_id)
        .maybeSingle();
      if (fErr) return err("Failed to validate facility", 500);
      if (!f) return err("Invalid facility_id", 400);
    }
    payload.facility_id = facility_id;
  }

  if (body.is_active !== undefined) {
    payload.is_active = !!body.is_active;
  }

  if (!Object.keys(payload).length) return err("Nothing to update", 400);

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("id,name,email,role,facility_id,created_at,is_active")
    .maybeSingle();

  if (error) {
    console.error("PATCH user error:", error);
    if (String(error.message || "").toLowerCase().includes("duplicate")) {
      return err("Email already exists", 409);
    }
    return err("Failed to update user", 500);
  }
  if (!data) return err("User not found", 404);

  return NextResponse.json(data, { status: 200 });
}

// ✅ demo: soft delete (không xoá cứng để tránh đứt FK incidents.reporter_id/assigned_to)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = String(id || "").trim();
  if (!userId) return err("Missing user id", 400);

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ is_active: false })
    .eq("id", userId)
    .select("id,is_active")
    .maybeSingle();

  if (error) {
    console.error("DELETE user error:", error);
    return err("Failed to delete user", 500);
  }
  if (!data) return err("User not found", 404);

  return NextResponse.json({ ok: true, user: data }, { status: 200 });
}
