import { NextResponse } from "next/server"
import { getMatchHistory, getMatchDetails, getTeamPlayers, didPlayerWin, convertSteamIdToAccountId } from "@/lib/steam-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const steamId = searchParams.get("steamId")

  if (!steamId) {
    return NextResponse.json({ error: "steamId required" }, { status: 400 })
  }

  try {
    const historyItems = await getMatchHistory(steamId, 50)
    if (historyItems.length === 0) {
      return NextResponse.json({
        totalMatches: 0,
        bestKda: null,
        worstKda: null,
        longestGame: null,
        shortestGame: null,
        mostKills: null,
        mostDeaths: null,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        avgKda: { k: 0, d: 0, a: 0 },
        currentStreak: { type: "none", count: 0 },
        bestWinStreak: 0,
        bestLoseStreak: 0,
      })
    }

    const accountId = convertSteamIdToAccountId(steamId)
    const detailPromises = historyItems.slice(0, 30).map(m => getMatchDetails(m.match_id))
    const details = (await Promise.all(detailPromises)).filter(Boolean) as Awaited<ReturnType<typeof getMatchDetails>>[]

    let bestKda = { heroId: 0, k: 0, d: 0, a: 0, kda: 0, matchId: 0 }
    let worstKda = { heroId: 0, k: 0, d: 0, a: 0, kda: Infinity, matchId: 0 }
    let longestGame = { duration: 0, heroId: 0, matchId: 0, win: false }
    let shortestGame = { duration: Infinity, heroId: 0, matchId: 0, win: false }
    let mostKills = { heroId: 0, kills: 0, matchId: 0 }
    let mostDeaths = { heroId: 0, deaths: 0, matchId: 0 }
    let totalKills = 0, totalDeaths = 0, totalAssists = 0
    let matchCount = 0
    const results: boolean[] = []

    for (const match of details) {
      if (!match) continue
      const playerData = getTeamPlayers(match.players, accountId)
      if (!playerData) continue

      const isRadiant = playerData.player_slot < 128
      const won = isRadiant ? match.radiant_win : !match.radiant_win
      results.push(won)

      const k = playerData.kills
      const d = playerData.deaths || 1
      const a = playerData.assists
      const kda = (k + a) / d

      totalKills += k
      totalDeaths += playerData.deaths
      totalAssists += a
      matchCount++

      if (kda > bestKda.kda) bestKda = { heroId: playerData.hero_id, k, d: playerData.deaths, a, kda, matchId: match.match_id }
      if (kda < worstKda.kda) worstKda = { heroId: playerData.hero_id, k, d: playerData.deaths, a, kda, matchId: match.match_id }
      if (k > mostKills.kills) mostKills = { heroId: playerData.hero_id, kills: k, matchId: match.match_id }
      if (playerData.deaths > mostDeaths.deaths) mostDeaths = { heroId: playerData.hero_id, deaths: playerData.deaths, matchId: match.match_id }
      if (match.duration > longestGame.duration) longestGame = { duration: match.duration, heroId: playerData.hero_id, matchId: match.match_id, win: won }
      if (match.duration < shortestGame.duration) shortestGame = { duration: match.duration, heroId: playerData.hero_id, matchId: match.match_id, win: won }
    }

    // Streaks
    let currentStreak = 0
    let currentStreakType: "win" | "lose" = results[results.length - 1] ? "win" : "lose"
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] === (currentStreakType === "win")) currentStreak++
      else break
    }

    let bestWinStreak = 0, bestLoseStreak = 0
    let streak = 1
    for (let i = 1; i < results.length; i++) {
      if (results[i] === results[i - 1]) streak++
      else { if (results[i - 1]) bestWinStreak = Math.max(bestWinStreak, streak); else bestLoseStreak = Math.max(bestLoseStreak, streak); streak = 1 }
    }
    if (results.length > 0) {
      if (results[results.length - 1]) bestWinStreak = Math.max(bestWinStreak, streak)
      else bestLoseStreak = Math.max(bestLoseStreak, streak)
    }

    if (worstKda.kda === Infinity) worstKda = { heroId: 0, k: 0, d: 0, a: 0, kda: 0, matchId: 0 }

    return NextResponse.json({
      totalMatches: matchCount,
      bestKda,
      worstKda,
      longestGame,
      shortestGame,
      mostKills,
      mostDeaths,
      totalKills,
      totalDeaths,
      totalAssists,
      avgKda: { k: matchCount > 0 ? Math.round(totalKills / matchCount * 10) / 10 : 0, d: matchCount > 0 ? Math.round(totalDeaths / matchCount * 10) / 10 : 0, a: matchCount > 0 ? Math.round(totalAssists / matchCount * 10) / 10 : 0 },
      currentStreak: { type: currentStreakType, count: currentStreak },
      bestWinStreak,
      bestLoseStreak,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fun stats" }, { status: 500 })
  }
}
