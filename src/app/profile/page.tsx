"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { cn } from "@/lib/utils"
import {
  User, Sword, TrendingUp, Clock, BarChart3, Star, LogIn, Sparkles, Shield, Mail,
} from "lucide-react"

const recentMatches = [
  { hero: "Pudge", result: "win", kills: 12, deaths: 4, assists: 18, duration: "42:15", date: "2h ago", kda: "12/4/18" },
  { hero: "Invoker", result: "loss", kills: 6, deaths: 9, assists: 7, duration: "38:40", date: "4h ago", kda: "6/9/7" },
  { hero: "Earthshaker", result: "win", kills: 3, deaths: 2, assists: 25, duration: "51:02", date: "6h ago", kda: "3/2/25" },
  { hero: "Juggernaut", result: "loss", kills: 8, deaths: 7, assists: 4, duration: "35:18", date: "8h ago", kda: "8/7/4" },
  { hero: "Phoenix", result: "win", kills: 5, deaths: 3, assists: 22, duration: "45:30", date: "10h ago", kda: "5/3/22" },
]

const topHeroes = [
  { name: "Pudge", games: 187, wins: 108, winrate: 57.8, icon: "🧟" },
  { name: "Invoker", games: 143, wins: 76, winrate: 53.1, icon: "🔥" },
  { name: "Earthshaker", games: 98, wins: 60, winrate: 61.2, icon: "🌍" },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 18 } },
} as const

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white/40 text-sm">Loading profile...</p>
        </motion.div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-lg"
        >
          <motion.div variants={item}>
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-cyan-500/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              <CardContent className="p-8 sm:p-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center"
                >
                  <Shield className="w-9 h-9 text-purple-400" />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Connect Your Steam Account
                </h1>
                <p className="text-white/50 text-sm sm:text-base mb-8 max-w-sm mx-auto leading-relaxed">
                  Unlock your personal Dota 2 profile — track MMR, view match history, analyze your hero pool, and more.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: BarChart3, label: "Match Stats" },
                    { icon: TrendingUp, label: "MMR History" },
                    { icon: Sword, label: "Hero Pool" },
                  ].map((feat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <feat.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-[11px] text-white/40 font-medium">{feat.label}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="premium"
                  size="lg"
                  className="w-full text-base"
                  onClick={() => signIn("steam")}
                >
                  <LogIn className="w-4 h-4" />
                  Sign in with Steam
                </Button>

                <p className="mt-4 text-xs text-white/30">
                  We never post without your permission.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const user = session?.user
  const joinDate = "Member since April 2024"

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[160px]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Profile Header */}
          <motion.div variants={item}>
            <Card className="border-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.06] to-cyan-500/[0.03]" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
              <CardContent className="p-6 sm:p-8 relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[#0a0a0f]">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20" />
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name ?? "Player"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-cyan-500/30">
                          <User className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500/40 to-cyan-500/40 blur-lg -z-10" />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {user?.name ?? "Unknown Player"}
                      </h1>
                      <Badge variant="premium" className="self-center sm:self-auto w-fit px-3 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Legend IV
                      </Badge>
                    </div>
                    <p className="text-sm text-white/40 font-mono tracking-tight">
                      Steam ID: {user?.steamId?.slice(0, 12) ?? "—"}...
                    </p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {joinDate}
                      </span>
                      {user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Profile Stats</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Matches"
                value="1,247"
                color="blue"
                trend="up"
                icon={<Sword className="w-4 h-4" />}
              />
              <StatCard
                label="Win Rate"
                value="52.3%"
                color="emerald"
                trend="up"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatCard
                label="Current MMR"
                value="3,850"
                color="purple"
                trend="up"
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <StatCard
                label="Rank"
                value="Legend IV"
                color="cyan"
                icon={<Star className="w-4 h-4" />}
              />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {recentMatches.map((match, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className={cn(
                    "border-l-2 transition-all duration-300 hover:border-l-purple-500/60",
                    match.result === "win" ? "border-l-emerald-500/50" : "border-l-red-500/50"
                  )}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        match.result === "win" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      )} />

                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                            <Sword className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white truncate">{match.hero}</p>
                            <p className={cn(
                              "text-xs font-semibold",
                              match.result === "win" ? "text-emerald-400" : "text-red-400"
                            )}>
                              {match.result === "win" ? "Victory" : "Defeat"}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 text-xs text-white/50">
                          <span className="font-mono">{match.kda}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {match.duration}
                          </span>
                        </div>

                        <span className="text-xs text-white/30 shrink-0">{match.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Pool */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Top Heroes</h2>
            </div>
            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-white/60">Most Played</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {topHeroes.map((hero, i) => {
                  const maxGames = Math.max(...topHeroes.map(h => h.games))
                  const barWidth = (hero.games / maxGames) * 100
                  return (
                    <motion.div
                      key={hero.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 text-sm">
                          {hero.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-white">{hero.name}</span>
                            <span className="text-xs text-white/40 font-mono">
                              {hero.games} games
                            </span>
                          </div>

                          <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                hero.winrate >= 55 ? "bg-gradient-to-r from-emerald-500/80 to-emerald-400/60" : "bg-gradient-to-r from-purple-500/80 to-cyan-500/60"
                              )}
                            />
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] text-white/30">{hero.wins}W / {hero.games - hero.wins}L</span>
                            <span className={cn(
                              "text-xs font-semibold",
                              hero.winrate >= 55 ? "text-emerald-400" : hero.winrate >= 50 ? "text-yellow-400" : "text-red-400"
                            )}>
                              {hero.winrate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
