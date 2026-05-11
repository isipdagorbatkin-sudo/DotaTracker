import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const protectedPaths = ["/dashboard", "/profile", "/mmr-tracker", "/fun-stats"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!isProtected) return

  if (!req.auth) {
    const loginUrl = new URL("/", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
