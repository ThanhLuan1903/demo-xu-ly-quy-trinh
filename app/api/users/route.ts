import { NextRequest, NextResponse } from "next/server"
import { readDb } from "@/lib/db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role")

  const db = await readDb()
  let users = db.users || []

  if (role) users = users.filter((u: any) => u.role === role)

  return NextResponse.json(users)
}
