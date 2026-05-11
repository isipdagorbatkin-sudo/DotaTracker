import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlayerSummary, getMatchHistory, getMatchDetails, getTeamPlayers, formatRankTier, convertSteamIdToAccountId } from "@/lib/steam-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let steamId = searchParams.get("steamId")

  if (!steamId) {
    const session = await auth()
    steamId = session?.user?.steamId ?? null
  }

  if (!steamId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const [player, historyItems] = await Promise.all([
      getPlayerSummary(steamId),
      getMatchHistory(steamId, 50),
    ])

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    const accountId = convertSteamIdToAccountId(steamId)
    const matchIds = historyItems.map(m => m.match_id)

    const detailResults = await Promise.allSettled(
      matchIds.slice(0, 50).map(mid => getMatchDetails(mid)),
    )

    const matchMap = new Map<number, { player_slot: number; hero_id: number }>()
    for (const m of historyItems) {
      const p = m.players?.find(pl => pl.account_id === accountId)
      if (p) matchMap.set(m.match_id, { player_slot: p.player_slot, hero_id: p.hero_id })
    }

    let wins = 0, total = 0
    let currentRank = "Uncalibrated"
    const heroCounts: Record<number, { games: number; wins: number }> = {}

    for (const result of detailResults) {
      if (result.status !== "fulfilled" || !result.value) continue
      const match = result.value
      const info = matchMap.get(match.match_id)
      if (!info) continue
      total++
      const isRadiant = info.player_slot < 128
      const won = isRadiant ? match.radiant_win : !match.radiant_win
      if (won) wins++
      if (!heroCounts[info.hero_id]) heroCounts[info.hero_id] = { games: 0, wins: 0 }
      heroCounts[info.hero_id].games++
      if (won) heroCounts[info.hero_id].wins++

      if (!currentRank || currentRank === "Uncalibrated") {
        const playerData = getTeamPlayers(match.players, accountId)
        if (playerData?.rank_tier) {
          currentRank = formatRankTier(playerData.rank_tier).label
        }
      }
    }

    if (currentRank === "Uncalibrated") {
      try {
        const odRes = await fetch(`https://api.opendota.com/api/players/${accountId}`, { next: { revalidate: 3600 } })
        if (odRes.ok) {
          const odData = await odRes.json()
          if (odData.rank_tier) currentRank = formatRankTier(odData.rank_tier).label
        }
      } catch {}
    }

    const heroEntries = Object.entries(heroCounts)
      .map(([heroId, stats]) => ({ heroId: Number(heroId), ...stats, wr: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0 }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)

    return NextResponse.json({
      name: player.personaname,
      avatar: player.avatarfull,
      steamId: player.steamid,
      profileUrl: player.profileurl,
      country: player.loccountrycode || null,
      matches: total,
      wins,
      losses: total - wins,
      winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
      currentRank,
      topHeroes: heroEntries,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
