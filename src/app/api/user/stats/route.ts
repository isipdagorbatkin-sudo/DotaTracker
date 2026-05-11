import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.steamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const steamId = session.user.steamId
    const res = await fetch(`https://api.opendota.com/api/players/${steamId}`)
    const data = await res.json()

    const winLossRes = await fetch(`https://api.opendota.com/api/players/${steamId}/wl`)
    const winLoss = await winLossRes.json()

    const recentRes = await fetch(`https://api.opendota.com/api/players/${steamId}/recentMatches`)
    const recentMatches = await recentRes.json()

    return NextResponse.json({
      profile: data.profile || {},
      mmr_estimate: data.mmr_estimate || {},
      rank_tier: data.rank_tier || 0,
      winLoss,
      recentMatches: recentMatches?.slice(0, 10) || [],
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
