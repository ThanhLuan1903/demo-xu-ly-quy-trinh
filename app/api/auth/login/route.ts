import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

type DbUser = {
  id: string
  name: string
  email: string
  password: string
  role: "admin" | "reporter"
  facility_id: string | null
  created_at?: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string }

    const cleanEmail = String(email || "").trim().toLowerCase()
    const cleanPassword = String(password || "")

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id,name,email,password,role,facility_id,created_at")
      .eq("email", cleanEmail)
      .maybeSingle<DbUser>()

    if (error) {
      console.error("Supabase login query error:", error)
      return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    if (String(user.password) !== cleanPassword) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const { password: _pw, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })

  } catch (e) {
    console.error("Login error:", e)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
