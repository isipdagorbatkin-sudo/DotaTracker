import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.steamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const steamId = session.user.steamId

    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 15000)

    const [wlRes, recentRes] = await Promise.all([
      fetch(`https://api.opendota.com/api/players/${steamId}/wl`, { signal: ac.signal }),
      fetch(`https://api.opendota.com/api/players/${steamId}/recentMatches`, { signal: ac.signal }),
    ])
    clearTimeout(timeout)

    const winLoss = await wlRes.json()
    const recentMatches = await recentRes.json()

    const playerAc = new AbortController()
    const playerTimeout = setTimeout(() => playerAc.abort(), 10000)
    const playerResp = await fetch(`https://api.opendota.com/api/players/${steamId}`, { signal: playerAc.signal })
    clearTimeout(playerTimeout)
    const data = await playerResp.json()

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