import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const returnTo = `${process.env.NEXTAUTH_URL}/api/auth/steam/callback`
  const realm = process.env.NEXTAUTH_URL!

  const steamUrl = new URL("https://steamcommunity.com/openid/login")
  steamUrl.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0")
  steamUrl.searchParams.set("openid.mode", "checkid_setup")
  steamUrl.searchParams.set("openid.return_to", returnTo)
  steamUrl.searchParams.set("openid.realm", realm)
  steamUrl.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select")
  steamUrl.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select")

  return NextResponse.redirect(steamUrl)
}
