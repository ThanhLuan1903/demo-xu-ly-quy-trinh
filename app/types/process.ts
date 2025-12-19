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


 export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

 export const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };