import { NextResponse } from "next/server"

const PROTECTED_PATHS = [
  "/settings",
  "/new",
]

export function proxy(request) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}`)
  )

  if(!isProtected) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has("refreshToken")

  if(!hasSession) {
    const redirectTo = new URL("/auth/protected", request.url)
    redirectTo.searchParams.set("from", pathname)

    return NextResponse.redirect(redirectTo)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/new",
  ]
}
