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

    const [matchesRes, heroesRes] = await Promise.all([
      fetch(`https://api.opendota.com/api/players/${steamId}/matches?limit=100`, { signal: ac.signal }),
      fetch(`https://api.opendota.com/api/players/${steamId}/heroes`, { signal: ac.signal }),
    ])

    clearTimeout(timeout)

    const matches = await matchesRes.json()
    const heroStats = await heroesRes.json()

    let longestGame = 0
    let bestKDA = { kills: 0, deaths: 0, assists: 0, matchId: 0 }
    let worstKDA = { kills: 0, deaths: 99, assists: 0, matchId: 0 }
    let highestGPM = 0
    let highestXPM = 0
    let highestDamage = 0
    let highestTowerDamage = 0
    let highestHealing = 0
    let currentStreak = 0
    let bestStreak = 0
    let worstStreak = 0
    let streakType: "win" | "loss" = "win"

    for (const match of matches || []) {
      if (match.duration > longestGame) longestGame = match.duration
      if (match.gold_per_min > highestGPM) highestGPM = match.gold_per_min
      if (match.xp_per_min > highestXPM) highestXPM = match.xp_per_min
      if ((match.hero_damage || 0) > highestDamage) highestDamage = match.hero_damage
      if ((match.tower_damage || 0) > highestTowerDamage) highestTowerDamage = match.tower_damage
      if ((match.hero_healing || 0) > highestHealing) highestHealing = match.hero_healing

      const kda = match.kills + match.assists / Math.max(match.deaths, 1)
      const bestKdaScore = bestKDA.kills + bestKDA.assists / Math.max(bestKDA.deaths, 1)
      if (kda > bestKdaScore) {
        bestKDA = { kills: match.kills, deaths: match.deaths, assists: match.assists, matchId: match.match_id }
      }
      const worstKdaScore = worstKDA.kills + worstKDA.assists / Math.max(worstKDA.deaths, 1)
      if (kda < worstKdaScore && match.deaths > 0) {
        worstKDA = { kills: match.kills, deaths: match.deaths, assists: match.assists, matchId: match.match_id }
      }

      const won = match.player_slot < 128 === match.radiant_win
      if (won) {
        if (streakType === "win") currentStreak++
        else { bestStreak = Math.max(bestStreak, currentStreak); currentStreak = 1; streakType = "win" }
      } else {
        if (streakType === "loss") currentStreak++
        else { worstStreak = Math.max(worstStreak, currentStreak); currentStreak = 1; streakType = "loss" }
      }
    }

    bestStreak = Math.max(bestStreak, currentStreak)
    worstStreak = Math.max(worstStreak, currentStreak)

    const heroStatsSorted = (heroStats || []).sort((a: any, b: any) => b.games - a.games)
    const mostPlayed = heroStatsSorted[0] || null
    const bestWinrate = heroStatsSorted.filter((h: any) => h.games >= 5).sort((a: any, b: any) => (b.win / b.games) - (a.win / a.games))[0] || null
    const worstWinrate = heroStatsSorted.filter((h: any) => h.games >= 5).sort((a: any, b: any) => (a.win / a.games) - (b.win / b.games))[0] || null

    return NextResponse.json({
      longestGame,
      bestKDA,
      worstKDA,
      highestGPM,
      highestXPM,
      highestDamage,
      highestTowerDamage,
      highestHealing,
      bestStreak,
      worstStreak,
      mostPlayed,
      bestWinrate,
      worstWinrate,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fun stats" }, { status: 500 })
  }
}
