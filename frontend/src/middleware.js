import { NextResponse } from "next/server"

const PROTECTED_PATHS = ["/settings"]

export function middleware(request) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}`)
  )

  if(!isProtected) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has("refreshToken")

  if(!hasSession) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("from", pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/settings/:path*"
  ]
}
