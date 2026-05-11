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
    const detailPromises = historyItems.slice(0, 30).map(m => getMatchDetails(m.match_id))
    const details = (await Promise.all(detailPromises)).filter(Boolean) as Awaited<ReturnType<typeof getMatchDetails>>[]

    let wins = 0, total = 0
    let currentRank = "Uncalibrated"
    const heroCounts: Record<number, { games: number; wins: number }> = {}

    for (const match of details) {
      if (!match) continue
      const playerData = getTeamPlayers(match.players, accountId)
      if (!playerData) continue
      total++
      const isRadiant = playerData.player_slot < 128
      const won = isRadiant ? match.radiant_win : !match.radiant_win
      if (won) wins++
      if (!heroCounts[playerData.hero_id]) heroCounts[playerData.hero_id] = { games: 0, wins: 0 }
      heroCounts[playerData.hero_id].games++
      if (won) heroCounts[playerData.hero_id].wins++
      if (!currentRank || currentRank === "Uncalibrated") {
        if (playerData.rank_tier) {
          currentRank = formatRankTier(playerData.rank_tier).label
        }
      }
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
