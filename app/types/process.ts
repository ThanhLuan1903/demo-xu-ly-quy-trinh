// src/types/process.ts

export type ActorType = "performer" | "coordinator"

export type ProcessRow = {
  id: string
  code: string
  name: string
  description: string | null
  version: number
  is_active: boolean
  created_at: string
}

export type StepRow = {
  id: string
  process_id: string
  step_no: number
  step_name: string
  note: string | null
  created_at: string
}

export type SubStepRow = {
  id: string
  step_id: string
  sub_no: number
  work_content: string
  expected_result: string | null
  due_days: number | null
  created_at: string
}

export type SubStepActorRow = {
  id: string
  sub_step_id: string
  actor_type: ActorType
  actor_text: string
  note: string | null
  created_at: string
}

export type SubStepFormRow = {
  id: string
  sub_step_id: string
  form_code: string
  form_name: string | null
  note: string | null
  created_at: string
  url_file: string
}

export type ProcessDetail = ProcessRow & {
  steps: Array<
    StepRow & {
      sub_steps: Array<
        SubStepRow & {
          performers: SubStepActorRow[]
          coordinators: SubStepActorRow[]
          forms: SubStepFormRow[]
        }
      >
    }
  >
}
