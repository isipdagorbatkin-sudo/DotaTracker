import { NextResponse } from "next/server"
import { fetchHeroStats, getCurrentPatch } from "@/lib/dota-api"

export const revalidate = 3600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get("position") || "all"
  const sortBy = searchParams.get("sort") || "winrate"

  try {
    const stats = await fetchHeroStats()

    let filtered = stats

    if (position !== "all") {
      const posFilters: Record<string, (h: any) => boolean> = {
        pos1: (h) => h.roles?.includes("Carry"),
        pos2: (h) => h.roles?.includes("Nuker"),
        pos3: (h) => h.roles?.includes("Initiator") || h.roles?.includes("Durable"),
        pos4: (h) => h.roles?.includes("Support") && h.roles?.includes("Disabler"),
        pos5: (h) => h.roles?.includes("Support"),
      }
      const filter = posFilters[position]
      if (filter) {
        filtered = stats.filter(filter)
      }
    }

    const heroes = filtered.map((h: any) => {
      const totalGames = (h.pro_pick || 0) + (h.pro_ban || 0)
      const winrate = h.pro_pick ? ((h.pro_win || 0) / h.pro_pick) * 100 : 50
      const pickRate = Math.min((h.pro_pick || 0) / Math.max(totalGames, 1) * 100, 100)
      const banRate = Math.min((h.pro_ban || 0) / Math.max(totalGames, 1) * 100, 100)

      return {
        id: h.id,
        name: h.localized_name,
        primary_attr: h.primary_attr,
        attack_type: h.attack_type,
        roles: h.roles || [],
        winrate: Math.round(winrate * 10) / 10,
        pickRate: Math.round(pickRate * 10) / 10,
        banRate: Math.round(banRate * 10) / 10,
        proPick: h.pro_pick || 0,
        proWin: h.pro_win || 0,
        proBan: h.pro_ban || 0,
        metaScore: Math.round((winrate + pickRate * 0.5 + banRate * 0.3) * 10) / 10,
      }
    })

    heroes.sort((a: any, b: any) => {
      switch (sortBy) {
        case "winrate": return b.winrate - a.winrate
        case "pickrate": return b.pickRate - a.pickRate
        case "banrate": return b.banRate - a.banRate
        default: return b.metaScore - a.metaScore
      }
    })

    return NextResponse.json({
      patch: getCurrentPatch(),
      heroes: heroes.slice(0, 50),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch meta heroes" }, { status: 500 })
  }
}
