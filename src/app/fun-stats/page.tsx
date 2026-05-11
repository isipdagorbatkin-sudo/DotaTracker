"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, Skull, Zap, Clock, Crosshair, Heart, TrendingUp, TrendingDown } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

interface FunStatsData {
  totalMatches: number
  bestKda: { heroId: number; k: number; d: number; a: number; kda: number; matchId: number }
  worstKda: { heroId: number; k: number; d: number; a: number; kda: number; matchId: number }
  longestGame: { duration: number; heroId: number; matchId: number; win: boolean }
  shortestGame: { duration: number; heroId: number; matchId: number; win: boolean }
  mostKills: { heroId: number; kills: number; matchId: number }
  mostDeaths: { heroId: number; deaths: number; matchId: number }
  totalKills: number
  totalDeaths: number
  totalAssists: number
  avgKda: { k: number; d: number; a: number }
  currentStreak: { type: string; count: number }
  bestWinStreak: number
  bestLoseStreak: number
}

export default function FunStatsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <FunStatsContent />
    </Suspense>
  )
}

function FunStatsContent() {
  const searchParams = useSearchParams()
  const steamId = searchParams.get("steamId") || ""
  const [input, setInput] = useState(steamId)
  const [stats, setStats] = useState<FunStatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!steamId) return
    setLoading(true)
    setError("")
    fetch(`/api/user/fun-stats?steamId=${steamId}`)
      .then(r => r.ok ? r.json() : Promise.reject("Failed to load"))
      .then(setStats)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [steamId])

  if (!steamId) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-lg mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-white mb-2">Fun Stats</h1>
            <p className="text-white/50 mb-8">Enter your Steam ID to see interesting match statistics</p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Steam ID"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                onKeyDown={e => e.key === "Enter" && input && (window.location.href = `/fun-stats?steamId=${encodeURIComponent(input)}`)}
              />
              <Button variant="premium" onClick={() => input && (window.location.href = `/fun-stats?steamId=${encodeURIComponent(input)}`)}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-white/5 rounded mx-auto" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.href = "/fun-stats"}>Try another ID</Button>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-lg mx-auto px-4 py-24 text-center">
          <p className="text-white/50 mb-4">No match data found. Play some ranked games first.</p>
          <Button variant="outline" onClick={() => window.location.href = "/fun-stats"}>Try another ID</Button>
        </div>
      </div>
    )
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, "0")}`
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-32 left-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
            <Badge variant="premium"><Sparkles className="h-3 w-3 mr-1" />Fun Stats</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Match Statistics</h1>
          <p className="text-white/50">Interesting stats from your recent matches</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Matches Analyzed" value={String(stats.totalMatches)} icon={<Sparkles className="h-4 w-4" />} color="purple" />
          <StatCard label="Avg K/D/A" value={`${stats.avgKda.k}/${stats.avgKda.d}/${stats.avgKda.a}`} icon={<Crosshair className="h-4 w-4" />} color="cyan" />
          <StatCard label="Total Kills" value={String(stats.totalKills)} icon={<Zap className="h-4 w-4" />} color="yellow" />
          <StatCard label="Total Deaths" value={String(stats.totalDeaths)} icon={<Heart className="h-4 w-4" />} color="red" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-white mb-4">Records</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Card className="border-white/10 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Zap className="h-3 w-3" />Best KDA</div>
                <div className="text-xl font-bold text-white mb-1">{stats.bestKda.kda.toFixed(1)}</div>
                <div className="text-xs text-white/40">{stats.bestKda.k} kills, {stats.bestKda.d} deaths, {stats.bestKda.a} assists</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-red-500/5 to-orange-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Heart className="h-3 w-3" />Worst KDA</div>
                <div className="text-xl font-bold text-white mb-1">{stats.worstKda.kda.toFixed(1)}</div>
                <div className="text-xs text-white/40">{stats.worstKda.k} kills, {stats.worstKda.d} deaths, {stats.worstKda.a} assists</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Clock className="h-3 w-3" />Longest Game</div>
                <div className="text-xl font-bold text-white mb-1">{formatDuration(stats.longestGame.duration)}</div>
                <div className="text-xs text-white/40">{stats.longestGame.win ? "Win" : "Loss"}</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Clock className="h-3 w-3" />Shortest Game</div>
                <div className="text-xl font-bold text-white mb-1">{formatDuration(stats.shortestGame.duration)}</div>
                <div className="text-xs text-white/40">{stats.shortestGame.win ? "Win" : "Loss"}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Card className="border-white/10 bg-gradient-to-br from-rose-500/5 to-pink-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Crosshair className="h-3 w-3" />Most Kills in a Game</div>
                <div className="text-xl font-bold text-white mb-1">{stats.mostKills.kills}</div>
                <div className="text-xs text-white/40">Hero ID: {stats.mostKills.heroId}</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-slate-500/5 to-gray-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2"><Skull className="h-3 w-3" />Most Deaths in a Game</div>
                <div className="text-xl font-bold text-white mb-1">{stats.mostDeaths.deaths}</div>
                <div className="text-xs text-white/40">Hero ID: {stats.mostDeaths.heroId}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-white mb-4">Streaks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-white/10 bg-gradient-to-br from-emerald-500/10 to-green-500/5">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-2"><TrendingUp className="h-3 w-3" />Current Streak</div>
                <div className="text-2xl font-bold text-white mb-1">
                  {stats.currentStreak.type === "win" ? `🔥 ${stats.currentStreak.count}W` : stats.currentStreak.type === "lose" ? `💀 ${stats.currentStreak.count}L` : "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-emerald-500/10 to-green-500/5">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-2"><TrendingUp className="h-3 w-3" />Best Win Streak</div>
                <div className="text-2xl font-bold text-emerald-400 mb-1">{stats.bestWinStreak}</div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-gradient-to-br from-red-500/10 to-orange-500/5">
              <CardContent className="p-5 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-white/40 mb-2"><TrendingDown className="h-3 w-3" />Best Lose Streak</div>
                <div className="text-2xl font-bold text-red-400 mb-1">{stats.bestLoseStreak}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
