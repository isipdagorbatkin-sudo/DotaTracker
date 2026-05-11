import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlayerSummary, getMatchHistory, getMatchDetails, getTeamPlayers, formatRankTier, convertSteamIdToAccountId } from "@/lib/steam-api"

export async function GET(request: Request) {
  const session = await auth()
  const steamId = session?.user?.steamId

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

    const win = historyItems.filter(m => {
      const playerData = m.players?.find(p => p.account_id === convertSteamIdToAccountId(steamId))
      if (!playerData) return false
      const isRadiant = playerData.player_slot < 128
      return isRadiant ? m.radiant_win : !m.radiant_win
    }).length

    const total = historyItems.filter(m => m.players?.some(p => p.account_id === convertSteamIdToAccountId(steamId))).length

    const heroCounts: Record<number, { games: number; wins: number }> = {}
    for (const m of historyItems) {
      const playerData = m.players?.find(p => p.account_id === convertSteamIdToAccountId(steamId))
      if (!playerData || m.radiant_win === undefined) continue
      const isRadiant = playerData.player_slot < 128
      const won = isRadiant ? m.radiant_win : !m.radiant_win
      if (!heroCounts[playerData.hero_id]) heroCounts[playerData.hero_id] = { games: 0, wins: 0 }
      heroCounts[playerData.hero_id].games++
      if (won) heroCounts[playerData.hero_id].wins++
    }

    const heroEntries = Object.entries(heroCounts)
      .map(([heroId, stats]) => ({ heroId: Number(heroId), ...stats, wr: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0 }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10)

    let currentRank = "Uncalibrated"
    if (historyItems.length > 0) {
      const lastDetails = await getMatchDetails(historyItems[0].match_id)
      if (lastDetails) {
        const playerData = getTeamPlayers(lastDetails.players, convertSteamIdToAccountId(steamId))
        if (playerData?.rank_tier) {
          currentRank = formatRankTier(playerData.rank_tier).label
        }
      }
    }

    return NextResponse.json({
      name: player.personaname,
      avatar: player.avatarfull,
      steamId: player.steamid,
      profileUrl: player.profileurl,
      country: player.loccountrycode || null,
      matches: total,
      wins: win,
      losses: total - win,
      winRate: total > 0 ? Math.round((win / total) * 1000) / 10 : 0,
      currentRank,
      topHeroes: heroEntries,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
