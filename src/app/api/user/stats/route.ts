import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.steamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const steamId = session.user.steamId
    const dataRes = await fetch(`https://api.opendota.com/api/players/${steamId}`)
    const data = await dataRes.json()

    const [wlRes, recentRes] = await Promise.all([
      fetch(`https://api.opendota.com/api/players/${steamId}/wl`),
      fetch(`https://api.opendota.com/api/players/${steamId}/recentMatches`),
    ])

    const winLoss = await wlRes.json()
    const recentMatches = await recentRes.json()

    return NextResponse.json({
      profile: data.profile || {},
      mmr_estimate: data.mmr_estimate || {},
      rank_tier: data.rank_tier || 0,
      winLoss,
      recentMatches: recentMatches?.slice(0, 10) || [],
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}