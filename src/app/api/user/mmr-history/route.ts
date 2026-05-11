import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getMatchHistory, getMatchDetails, getTeamPlayers, formatRankTier, convertSteamIdToAccountId } from "@/lib/steam-api"

const RANK_TIER_MMR: Record<number, number> = {
  0: 0, 11: 77, 12: 231, 13: 308, 14: 385, 15: 462,
  21: 539, 22: 616, 23: 693, 24: 770, 25: 847,
  31: 924, 32: 1001, 33: 1078, 34: 1155, 35: 1232,
  41: 1309, 42: 1386, 43: 1463, 44: 1540, 45: 1617,
  51: 1694, 52: 1771, 53: 1848, 54: 1925, 55: 2002,
  61: 2079, 62: 2156, 63: 2233, 64: 2310, 65: 2387,
  71: 2464, 72: 2541, 73: 2618, 74: 2695, 75: 2772,
  80: 3500,
}

function estimateMmr(rankTier: number): number {
  return RANK_TIER_MMR[rankTier] || 0
}

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
    const historyItems = await getMatchHistory(steamId, 50)
    if (historyItems.length === 0) {
      return NextResponse.json({ history: [] })
    }

    const accountId = convertSteamIdToAccountId(steamId)
    const detailPromises = historyItems.slice(0, 40).map(m => getMatchDetails(m.match_id))
    const details = (await Promise.all(detailPromises)).filter(Boolean) as Awaited<ReturnType<typeof getMatchDetails>>[]

    const mmrHistory: { date: string; mmr: number; rankLabel: string; matchId: number; heroId: number; win: boolean }[] = []

    for (const match of details) {
      if (!match) continue
      const playerData = getTeamPlayers(match.players, accountId)
      if (!playerData || !playerData.rank_tier) continue
      const isRadiant = playerData.player_slot < 128
      const won = isRadiant ? match.radiant_win : !match.radiant_win
      mmrHistory.push({
        date: new Date(match.start_time * 1000).toISOString().split("T")[0],
        mmr: estimateMmr(playerData.rank_tier),
        rankLabel: formatRankTier(playerData.rank_tier).label,
        matchId: match.match_id,
        heroId: playerData.hero_id,
        win: won,
      })
    }

    mmrHistory.reverse()

    return NextResponse.json({
      history: mmrHistory,
      currentMmr: mmrHistory.length > 0 ? mmrHistory[mmrHistory.length - 1].mmr : 0,
      currentRank: mmrHistory.length > 0 ? mmrHistory[mmrHistory.length - 1].rankLabel : "Uncalibrated",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch MMR history" }, { status: 500 })
  }
}
