import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

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

    await signIn("credentials", {
      steamId: player.steamid,
      name: player.personaname,
      avatar: player.avatarfull,
      redirect: false,
    })
  } catch {
    // signIn may throw on redirect
  }

  return NextResponse.redirect(new URL("/dashboard", request.url))
}
