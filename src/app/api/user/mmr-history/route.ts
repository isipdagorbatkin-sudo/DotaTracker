import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.steamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const steamId = session.user.steamId
    const res = await fetch(`https://api.opendota.com/api/players/${steamId}/matches?limit=100`)
    const matches = await res.json()

    const daily: Record<string, { games: number; wins: number; mmrChange: number }> = {}
    const now = new Date()

    for (const match of matches || []) {
      const date = new Date(match.start_time * 1000).toISOString().split("T")[0]
      if (!daily[date]) {
        daily[date] = { games: 0, wins: 0, mmrChange: 0 }
      }
      daily[date].games++
      if (match.player_slot < 128 === match.radiant_win) {
        daily[date].wins++
        daily[date].mmrChange += 25
      } else {
        daily[date].mmrChange -= 25
      }
    }

    const history = Object.entries(daily)
      .map(([date, data]) => ({
        date,
        mmrChange: data.mmrChange,
        games: data.games,
        wins: data.wins,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    let cumulative = 0
    const chartData = history.map((d) => {
      cumulative += d.mmrChange
      return { ...d, cumulativeMMR: cumulative }
    })

    const today = now.toISOString().split("T")[0]
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const todayData = history.find((d) => d.date === today)
    const weekData = history.filter((d) => d.date >= weekAgo)
    const monthData = history.filter((d) => d.date >= monthAgo)

    return NextResponse.json({
      today: todayData?.mmrChange || 0,
      week: weekData.reduce((sum, d) => sum + d.mmrChange, 0),
      month: monthData.reduce((sum, d) => sum + d.mmrChange, 0),
      allTime: cumulative,
      chartData,
      recentChanges: history.slice(-20).reverse(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch MMR history" }, { status: 500 })
  }
}