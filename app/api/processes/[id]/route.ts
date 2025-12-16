// app/api/processes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const processId = String(id || "").trim()
    if (!processId) return err("Missing process id", 400)

    // 1) process
    const { data: proc, error: pErr } = await supabaseAdmin
      .from("processes")
      .select("id,code,name,description,version,is_active,created_at")
      .eq("id", processId)
      .maybeSingle()

    if (pErr) return err(pErr.message, 500)
    if (!proc) return err("Process not found", 404)

    // 2) steps
    const { data: steps, error: sErr } = await supabaseAdmin
      .from("process_steps")
      .select("id,process_id,step_no,step_name,note,created_at")
      .eq("process_id", processId)
      .order("step_no", { ascending: true })

    if (sErr) return err(sErr.message, 500)

    const stepIds = (steps || []).map((x: any) => x.id)

    // 3) sub-steps
    let subSteps: any[] = []
    if (stepIds.length) {
      const { data, error } = await supabaseAdmin
        .from("process_sub_steps")
        .select("id,step_id,sub_no,work_content,expected_result,due_days,created_at")
        .in("step_id", stepIds)
        .order("sub_no", { ascending: true })

      if (error) return err(error.message, 500)
      subSteps = data || []
    }

    const subStepIds = subSteps.map((x) => x.id)

    // 4) actors + forms
    let actors: any[] = []
    let forms: any[] = []
    if (subStepIds.length) {
      const [aRes, fRes] = await Promise.all([
        supabaseAdmin
          .from("process_sub_step_actors")
          .select("id,sub_step_id,actor_type,actor_text,note,created_at")
          .in("sub_step_id", subStepIds),
        supabaseAdmin
          .from("process_sub_step_forms")
          .select("id,sub_step_id,form_code,form_name,note,created_at,url_file")
          .in("sub_step_id", subStepIds),
      ])
      if (aRes.error) return err(aRes.error.message, 500)
      if (fRes.error) return err(fRes.error.message, 500)
      actors = aRes.data || []
      forms = fRes.data || []
    }

    // 5) assemble
    const stepsJoined = (steps || []).map((st: any) => {
      const subs = subSteps
        .filter((ss) => String(ss.step_id) === String(st.id))
        .sort((a, b) => (a.sub_no ?? 0) - (b.sub_no ?? 0))
        .map((ss) => {
          const ssActors = actors.filter((a) => String(a.sub_step_id) === String(ss.id))
          const ssForms = forms.filter((f) => String(f.sub_step_id) === String(ss.id))
          const url_file = ssForms.find((f) => f.form_code === "url_file")
                  return {
            ...ss,
            performers: ssActors.filter((a) => a.actor_type === "performer"),
            coordinators: ssActors.filter((a) => a.actor_type === "coordinator"),
            forms: ssForms,
            url_file,
          }
        })

      return { ...st, sub_steps: subs }
    })

    return NextResponse.json({ ...proc, steps: stepsJoined })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch process detail" }, { status: 500 })
  }
}
