import { NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY || "A4F39BB226A06CDE5C52C47471E00A30"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const claimedId = searchParams.get("openid.claimed_id") || searchParams.get("openid.identity") || ""
  const steamId = claimedId.replace("https://steamcommunity.com/openid/id/", "")

  if (!steamId) {
    return NextResponse.redirect(new URL("/?error=no_steam_id", request.url))
  }

  try {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
    )
    const data = await res.json()
    const player = data?.response?.players?.[0]

    if (!player) {
      return NextResponse.redirect(new URL("/?error=steam_fetch_failed", request.url))
    }

    const callbackUrl = new URL("/auth/callback", request.url)
    callbackUrl.searchParams.set("steamId", player.steamid)
    callbackUrl.searchParams.set("name", player.personaname)
    callbackUrl.searchParams.set("avatar", player.avatarfull)
    return NextResponse.redirect(callbackUrl)
  } catch {
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
