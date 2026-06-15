import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const url = request.nextUrl.clone()

  // Paths that do not require auth or are system-level
  const isLoginPage = url.pathname === "/login"
  const isAuthCallback = url.pathname.startsWith("/auth")
  
  // Allow static asset requests, next image loader, favicon to bypass redirects
  const isStatic =
    url.pathname.startsWith("/_next") ||
    url.pathname.includes(".") ||
    url.pathname === "/favicon.ico"

  if (isStatic || isAuthCallback) {
    return supabaseResponse
  }

  // Redirection: If no logged-in user and not on login page -> Send to login
  if (!user && !isLoginPage) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirection: If logged in and browsing to login page -> Send to dashboard home
  if (user && isLoginPage) {
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static folders
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
