import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

const ALLOWED_PRIORITY = ["low", "medium", "high", "critical"] as const;

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } // ✅ params là Promise (Next mới)
) {
  try {
    const { id } = await ctx.params; // ✅ unwrap params
    const incidentId = String(id || "").trim();
    if (!incidentId) return err("Missing incident id", 400);

    // ✅ chỉ nhận JSON
    const body = await request.json().catch(() => ({}));

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const proposed_fix =
      typeof body.proposed_fix === "string" ? body.proposed_fix.trim() : "";
    const priority =
      typeof body.priority === "string" ? body.priority.trim() : "";

    if (!title) return err("Thiếu tiêu đề", 400);
    if (!description) return err("Thiếu mô tả", 400);

    if (priority && !ALLOWED_PRIORITY.includes(priority as any)) {
      return err(
        `Invalid priority. Allowed: ${ALLOWED_PRIORITY.join(", ")}`,
        400
      );
    }

    // check exists
    const { data: current, error: curErr } = await supabaseAdmin
      .from("incidents")
      .select("id")
      .eq("id", incidentId)
      .maybeSingle();

    if (curErr) return err("Failed to load incident", 500);
    if (!current) return err("Incident not found", 404);

    const patch = {
      title,
      description,
      proposed_fix, // cho phép rỗng
      priority: (priority || "medium") as any,
      updated_at: new Date().toISOString(),
    };

    const { error: upErr } = await supabaseAdmin
      .from("incidents")
      .update(patch)
      .eq("id", incidentId);

    if (upErr) {
      console.error(upErr);
      return err("Failed to update incident", 500);
    }

    return NextResponse.json({ ok: true, incident_id: incidentId }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}
