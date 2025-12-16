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



export async function POST(req: Request) {
  const body = await req.json()

  const {
    code,
    name,
    description,
    steps, // full tree
  } = body

  // 1. insert process
  const { data: process, error: pErr } = await supabaseAdmin
    .from("processes")
    .insert({
      code,
      name,
      description,
      version: 1,
      is_active: true,
    })
    .select()
    .single()

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 })
  }

  // 2. insert steps
  for (const step of steps) {
    const { data: stepRow } = await supabaseAdmin
      .from("process_steps")
      .insert({
        process_id: process.id,
        step_no: step.step_no,
        step_name: step.step_name,
        note: step.note,
      })
      .select()
      .single()

    // 3. insert sub steps
    for (const sub of step.sub_steps) {
      const { data: subRow } = await supabaseAdmin
        .from("process_sub_steps")
        .insert({
          step_id: stepRow.id,
          sub_no: sub.sub_no,
          work_content: sub.work_content,
          expected_result: sub.expected_result,
          due_days: sub.due_days,
        })
        .select()
        .single()

      // 4. actors
      if (sub.actors?.length) {
        await supabaseAdmin
          .from("process_sub_step_actors")
          .insert(
            sub.actors.map((a: any) => ({
              sub_step_id: subRow.id,
              actor_type: a.actor_type,
              actor_text: a.actor_text,
            }))
          )
      }

      // 5. forms
      if (sub.forms?.length) {
        await supabaseAdmin
          .from("process_sub_step_forms")
          .insert(
            sub.forms.map((f: any) => ({
              sub_step_id: subRow.id,
              form_code: f.form_code,
              form_name: f.form_name,
              url_file: f.url_file,
            }))
          )
      }
    }
  }

  return NextResponse.json({ success: true })
}


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const processId = params.id
  const body = await req.json()

  // update process meta
  await supabaseAdmin
    .from("processes")
    .update({
      name: body.name,
      description: body.description,
      version: body.version + 1,
    })
    .eq("id", processId)

  // delete old tree
  await supabaseAdmin.from("process_steps").delete().eq("process_id", processId)

  // insert new tree (reuse logic POST)
  // 👉 gọi lại logic insert steps/substeps ở trên
}


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("processes")
    .delete()
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
