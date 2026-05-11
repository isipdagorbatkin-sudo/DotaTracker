"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Sword, Globe, ExternalLink, LogIn } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

interface PlayerStats {
  name: string
  avatar: string
  steamId: string
  profileUrl: string
  country: string | null
  matches: number
  wins: number
  losses: number
  winRate: number
  currentRank: string
  topHeroes: { heroId: number; games: number; wins: number; wr: number }[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated") return
    setLoading(true)
    setError("")
    fetch("/api/user/stats")
      .then(r => r.ok ? r.json() : Promise.reject("Failed to load"))
      .then(setStats)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [status])

  if (status === "loading") {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/5 mx-auto" />
            <div className="h-6 w-48 bg-white/5 rounded mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-lg mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-white mb-2">Player Profile</h1>
            <p className="text-white/50 mb-8">Sign in with Steam to view your match stats</p>
            <Button variant="premium" size="lg" onClick={() => signIn("steam")}>
              <LogIn className="h-4 w-4 mr-2" />Sign in via Steam
            </Button>
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
            <div className="w-20 h-20 rounded-full bg-white/5 mx-auto" />
            <div className="h-6 w-48 bg-white/5 rounded mx-auto" />
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
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const heroNames: Record<number, string> = {
    1: "Anti-Mage", 2: "Axe", 3: "Bane", 4: "Bloodseeker", 5: "Crystal Maiden",
    6: "Drow Ranger", 7: "Earthshaker", 8: "Juggernaut", 9: "Mirana", 10: "Morphling",
    11: "Shadow Fiend", 12: "Phantom Lancer", 13: "Puck", 14: "Pudge", 15: "Razor",
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-32 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
            <Badge variant="premium"><Sparkles className="h-3 w-3 mr-1" />Profile</Badge>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img src={stats.avatar} alt="" className="w-20 h-20 rounded-full border-2 border-purple-500/50" />
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-white mb-1">{stats.name}</h1>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-white/50 mb-4">
                    {stats.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{stats.country}</span>}
                    <span className="flex items-center gap-1"><Sword className="h-3 w-3" />{stats.currentRank}</span>
                    <a href={stats.profileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                      <ExternalLink className="h-3 w-3" />Steam Profile
                    </a>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{stats.winRate}%</div>
                  <div className="text-xs text-white/40">Win Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Matches" value={String(stats.matches)} icon={<TrendingUp className="h-4 w-4" />} color="purple" />
          <StatCard label="Wins" value={String(stats.wins)} icon={<TrendingUp className="h-4 w-4" />} color="emerald" />
          <StatCard label="Losses" value={String(stats.losses)} icon={<TrendingUp className="h-4 w-4" />} color="red" />
          <StatCard label="Rank" value={stats.currentRank} icon={<Sword className="h-4 w-4" />} color="yellow" />
        </div>

        {stats.topHeroes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-lg font-semibold text-white mb-4">Most Played Heroes</h2>
            <div className="space-y-2">
              {stats.topHeroes.map((h, i) => (
                <div key={h.heroId} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/20 w-5">#{i + 1}</span>
                  <span className="flex-1 text-white/80">{heroNames[h.heroId] || `Hero ${h.heroId}`}</span>
                  <span className="text-sm text-white/40">{h.games} games</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${h.wr}%` }} />
                  </div>
                  <span className="text-sm font-medium text-white/60 w-12 text-right">{h.wr.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
