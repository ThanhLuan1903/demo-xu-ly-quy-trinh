import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // For demo, using hardcoded credentials
    const validUsers = [
      {
        id: "1",
        name: "Nguyễn Văn Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        facility_id: "1",
      },
      {
        id: "2",
        name: "Trần Thị Reporter",
        email: "reporter@example.com",
        password: "123",
        role: "reporter",
        facility_id: "1",
      },
    ]

    const user = validUsers.find((u) => u.email === email && u.password === password)
    
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
