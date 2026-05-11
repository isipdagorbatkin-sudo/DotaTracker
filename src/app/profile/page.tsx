"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  User, Sword, TrendingUp, Clock, BarChart3, Star, LogIn, Sparkles, Shield, Loader2,
} from "lucide-react"

interface UserStats {
  profile: { personaname?: string; avatarfull?: string }
  mmr_estimate: { estimate?: number }
  rank_tier: number
  winLoss: { win?: number; lose?: number }
  recentMatches: any[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 18 } },
}

const RANK_NAMES: Record<number, string> = {
  1: "Herald", 2: "Guardian", 3: "Crusader", 4: "Archon",
  5: "Legend", 6: "Ancient", 7: "Divine", 8: "Immortal",
}

function getRankName(rankTier: number): string {
  if (!rankTier) return "Uncalibrated"
  const medal = Math.floor(rankTier / 10)
  const stars = rankTier % 10
  const name = RANK_NAMES[medal] || "Unknown"
  return stars > 0 ? `${name} ${"★".repeat(stars)}` : name
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/user/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoadingStats(false))
  }, [status])

  if (status === "loading") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-lg">
          <motion.div variants={item}>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.04] overflow-hidden">
              <CardContent className="p-8 sm:p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center"
                >
                  <Shield className="w-9 h-9 text-purple-400" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Connect Your Steam Account</h1>
                <p className="text-white/50 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
                  Unlock your personal Dota 2 profile.
                </p>
                <Button variant="premium" size="lg" className="w-full text-base" onClick={() => signIn("steam")}>
                  <LogIn className="w-4 h-4" />
                  Sign in with Steam
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const user = session?.user

  if (loadingStats) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  const totalMatches = stats ? (stats.winLoss?.win ?? 0) + (stats.winLoss?.lose ?? 0) : 0
  const winRate = totalMatches > 0 ? ((stats!.winLoss.win! / totalMatches) * 100).toFixed(1) : "—"
  const mmr = stats?.mmr_estimate?.estimate ?? null
  const rankName = getRankName(stats?.rank_tier ?? 0)

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[160px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={item}>
            <Card className="border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.06] to-cyan-500/[0.03]" />
              <CardContent className="p-6 sm:p-8 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[#0a0a0f]">
                      {user?.image ? (
                        <img src={user.image} alt={user.name ?? "Player"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-cyan-500/30">
                          <User className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {user?.name ?? "Unknown Player"}
                      </h1>
                      <Badge variant="premium" className="self-center sm:self-auto w-fit px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {rankName}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/40 font-mono tracking-tight">
                      Steam ID: {user?.steamId?.slice(0, 12) ?? "—"}...
                    </p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalMatches > 0 ? `${totalMatches} matches played` : "No matches yet"}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Profile Stats</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Matches" value={totalMatches.toLocaleString()} color="blue" icon={<Sword className="w-4 h-4" />} />
              <StatCard label="Win Rate" value={winRate === "—" ? "—" : `${winRate}%`} color="emerald" trend={Number(winRate) >= 50 ? "up" : "down"} icon={<TrendingUp className="w-4 h-4" />} />
              <StatCard label="MMR Estimate" value={mmr !== null ? mmr.toLocaleString() : "—"} color="purple" icon={<BarChart3 className="w-4 h-4" />} />
              <StatCard label="Rank" value={rankName} color="cyan" icon={<Star className="w-4 h-4" />} />
            </div>
          </motion.div>

          {stats?.recentMatches && stats.recentMatches.length > 0 && (
            <motion.div variants={item}>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {stats.recentMatches.slice(0, 5).map((match: any, i: number) => (
                  <motion.div
                    key={match.match_id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className={cn(
                      "border-l-2 transition-all duration-300 hover:border-l-purple-500/60",
                      (match.player_slot < 128) === match.radiant_win ? "border-l-emerald-500/50" : "border-l-red-500/50"
                    )}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          (match.player_slot < 128) === match.radiant_win
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        )} />
                        <div className="flex-1 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                              <Sword className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white truncate">Hero #{match.hero_id}</p>
                              <p className={cn("text-xs font-semibold", (match.player_slot < 128) === match.radiant_win ? "text-emerald-400" : "text-red-400")}>
                                {(match.player_slot < 128) === match.radiant_win ? "Victory" : "Defeat"}
                              </p>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-4 text-xs text-white/50">
                            <span className="font-mono">{match.kills}/{match.deaths}/{match.assists}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}