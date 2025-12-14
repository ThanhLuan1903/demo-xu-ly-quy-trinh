import { type NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/admin", "/reporter"]
const publicRoutes = ["/login", "/"]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const userCookie = request.cookies.get("user")?.value

  // Parse user data if it exists
  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch {
      // Invalid cookie, clear it
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("user")
      return response
    }
  }

  // Check if route is protected
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // If accessing protected route without auth
  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If accessing protected route with wrong role
  if (pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/reporter/dashboard", request.url))
  }

  if (pathname.startsWith("/reporter") && user?.role !== "reporter") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // If accessing login with auth
  if (pathname === "/login" && user) {
    const redirectUrl = user.role === "admin" ? "/admin/dashboard" : "/reporter/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
