import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const claimedId = searchParams.get("openid.claimed_id")
  if (!claimedId) {
    return NextResponse.redirect(new URL("/?error=no_claimed_id", request.url))
  }

  const steamId = claimedId.match(/\/(\d+)$/)?.[1]
  if (!steamId) {
    return NextResponse.redirect(new URL("/?error=invalid_steam_id", request.url))
  }

  let name = "Unknown"
  let avatar = ""

  try {
    const key = process.env.STEAM_API_KEY
    if (key) {
      const res = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`,
      )
      if (res.ok) {
        const data = await res.json()
        const player = data.response?.players?.[0]
        if (player) {
          name = player.personaname
          avatar = player.avatarfull
        }
      }
    }
  } catch {
    // non-critical — fallback to defaults
  }

  const redirectUrl = new URL("/auth/callback", request.url)
  redirectUrl.searchParams.set("steamId", steamId)
  redirectUrl.searchParams.set("name", name)
  redirectUrl.searchParams.set("avatar", avatar)

  return NextResponse.redirect(redirectUrl)
}
