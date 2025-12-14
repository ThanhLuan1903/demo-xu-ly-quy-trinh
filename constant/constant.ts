export const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  assigned: "Đã giao",
  resolved: "Đã giải quyết",
  rejected: "Đã từ chối",
}

export const getStatusLabel = (status: string | string) => {
  return STATUS_LABEL[status as string] ?? status
}
