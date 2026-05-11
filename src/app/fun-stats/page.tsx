"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration, getKDA } from "@/lib/utils"
import {
  Clock, Star, Skull, Swords, Trophy, Flame,
  TrendingUp, TrendingDown, Activity, Zap, Crosshair,
  Shield, Heart, Sparkles, Loader2,
} from "lucide-react"

interface FunStatsData {
  longestGame: number
  bestKDA: { kills: number; deaths: number; assists: number; matchId: number }
  worstKDA: { kills: number; deaths: number; assists: number; matchId: number }
  highestGPM: number
  highestXPM: number
  highestDamage: number
  highestTowerDamage: number
  highestHealing: number
  bestStreak: number
  worstStreak: number
  mostPlayed: { hero_id: number; games: number; win: number } | null
  bestWinrate: { hero_id: number; games: number; win: number } | null
  worstWinrate: { hero_id: number; games: number; win: number } | null
}

interface HeroMap {
  [key: number]: string
}

type StatKey = keyof FunStatsData

const statConfigs: { label: string; key: string; icon: React.ElementType; gradient: string; textColor: string; borderColor: string; badgeVariant: "default" | "success" | "warning" | "danger" | "premium" | "outline"; format?: (v: number) => string }[] = [
  { label: "Longest Game", key: "longestGame", icon: Clock, gradient: "from-orange-500/20 to-amber-600/10", textColor: "text-orange-400", borderColor: "border-orange-500/30", badgeVariant: "warning" as const, format: (v: number) => formatDuration(v) },
  { label: "Best KDA", key: "bestKDA", icon: Star, gradient: "from-emerald-500/20 to-emerald-600/10", textColor: "text-emerald-400", borderColor: "border-emerald-500/30", badgeVariant: "success" as const },
  { label: "Worst KDA", key: "worstKDA", icon: Skull, gradient: "from-red-500/20 to-red-600/10", textColor: "text-red-400", borderColor: "border-red-500/30", badgeVariant: "danger" as const },
  { label: "Most Played Hero", key: "mostPlayed", icon: Swords, gradient: "from-purple-500/20 to-purple-600/10", textColor: "text-purple-400", borderColor: "border-purple-500/30", badgeVariant: "default" as const },
  { label: "Best Winrate Hero", key: "bestWinrate", icon: Trophy, gradient: "from-cyan-500/20 to-cyan-600/10", textColor: "text-cyan-400", borderColor: "border-cyan-500/30", badgeVariant: "success" as const },
  { label: "Worst Winrate Hero", key: "worstWinrate", icon: Flame, gradient: "from-pink-500/20 to-pink-600/10", textColor: "text-pink-400", borderColor: "border-pink-500/30", badgeVariant: "danger" as const },
  { label: "Best Win Streak", key: "bestStreak", icon: TrendingUp, gradient: "from-emerald-500/20 to-teal-600/10", textColor: "text-emerald-400", borderColor: "border-emerald-500/30", badgeVariant: "success" as const },
  { label: "Worst Lose Streak", key: "worstStreak", icon: TrendingDown, gradient: "from-red-500/20 to-rose-600/10", textColor: "text-red-400", borderColor: "border-red-500/30", badgeVariant: "danger" as const },
  { label: "Highest GPM", key: "highestGPM", icon: Activity, gradient: "from-yellow-500/20 to-amber-600/10", textColor: "text-yellow-400", borderColor: "border-yellow-500/30", badgeVariant: "warning" as const, format: (v: number) => v.toLocaleString() },
  { label: "Highest XPM", key: "highestXPM", icon: Zap, gradient: "from-blue-500/20 to-blue-600/10", textColor: "text-blue-400", borderColor: "border-blue-500/30", badgeVariant: "default" as const, format: (v: number) => v.toLocaleString() },
  { label: "Most Hero Damage", key: "highestDamage", icon: Crosshair, gradient: "from-orange-500/20 to-red-600/10", textColor: "text-orange-400", borderColor: "border-orange-500/30", badgeVariant: "danger" as const, format: (v: number) => v.toLocaleString() },
  { label: "Most Tower Damage", key: "highestTowerDamage", icon: Shield, gradient: "from-indigo-500/20 to-indigo-600/10", textColor: "text-indigo-400", borderColor: "border-indigo-500/30", badgeVariant: "default" as const, format: (v: number) => v.toLocaleString() },
  { label: "Most Healing", key: "highestHealing", icon: Heart, gradient: "from-green-500/20 to-green-600/10", textColor: "text-green-400", borderColor: "border-green-500/30", badgeVariant: "success" as const, format: (v: number) => v.toLocaleString() },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

interface StatItem {
  label: string
  value: string
  icon: React.ElementType
  gradient: string
  textColor: string
  borderColor: string
  badge?: string
  badgeVariant?: "default" | "success" | "warning" | "danger" | "premium" | "outline"
}

export default function FunStatsPage() {
  const [data, setData] = useState<FunStatsData | null>(null)
  const [heroMap, setHeroMap] = useState<HeroMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, heroesRes] = await Promise.all([
          fetch("/api/user/fun-stats"),
          fetch("/api/dota/heroes"),
        ])
        if (!statsRes.ok) {
          if (statsRes.status === 401) {
            setError("Please sign in to view fun stats")
          } else {
            setError("Failed to load fun stats")
          }
          return
        }
        const stats = await statsRes.json()
        const heroes = await heroesRes.json()
        const map: HeroMap = {}
        for (const h of heroes) {
          map[h.id] = h.localized_name
        }
        setData(stats)
        setHeroMap(map)
      } catch {
        setError("Failed to load fun stats")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo<StatItem[]>(() => {
    if (!data) return []

    return statConfigs.map((cfg) => {
      const Icon = cfg.icon
      let value: string
      let badge: string | undefined

      switch (cfg.key) {
        case "longestGame":
          value = cfg.format!(data.longestGame)
          badge = `${Math.floor(data.longestGame / 60)}m ${data.longestGame % 60}s`
          break
        case "bestKDA":
          value = getKDA(data.bestKDA.kills, data.bestKDA.deaths, data.bestKDA.assists)
          badge = `${((data.bestKDA.kills + data.bestKDA.assists) / Math.max(data.bestKDA.deaths, 1)).toFixed(2)} KDA`
          break
        case "worstKDA":
          value = getKDA(data.worstKDA.kills, data.worstKDA.deaths, data.worstKDA.assists)
          badge = `${((data.worstKDA.kills + data.worstKDA.assists) / Math.max(data.worstKDA.deaths, 1)).toFixed(2)} KDA`
          break
        case "mostPlayed":
          if (data.mostPlayed) {
            value = heroMap[data.mostPlayed.hero_id] || `Hero #${data.mostPlayed.hero_id}`
            badge = `${data.mostPlayed.games} games`
          } else {
            value = "—"
          }
          break
        case "bestWinrate":
          if (data.bestWinrate) {
            value = heroMap[data.bestWinrate.hero_id] || `Hero #${data.bestWinrate.hero_id}`
            badge = `${((data.bestWinrate.win / data.bestWinrate.games) * 100).toFixed(1)}%`
          } else {
            value = "—"
          }
          break
        case "worstWinrate":
          if (data.worstWinrate) {
            value = heroMap[data.worstWinrate.hero_id] || `Hero #${data.worstWinrate.hero_id}`
            badge = `${((data.worstWinrate.win / data.worstWinrate.games) * 100).toFixed(1)}%`
          } else {
            value = "—"
          }
          break
        case "bestStreak":
          value = `${data.bestStreak} Wins`
          badge = "Record"
          break
        case "worstStreak":
          value = `${data.worstStreak} Losses`
          badge = "Oof"
          break
        default:
          value = cfg.format ? cfg.format(data[cfg.key as StatKey] as unknown as number) : String(data[cfg.key as StatKey] ?? "—")
      }

      return {
        label: cfg.label,
        value,
        icon: Icon,
        gradient: cfg.gradient,
        textColor: cfg.textColor,
        borderColor: cfg.borderColor,
        badge,
        badgeVariant: cfg.badgeVariant,
      }
    })
  }, [data, heroMap])

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-white/60 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex justify-center">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Fun Stats
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Your Dota 2 <span className="text-gradient">Curiosities</span>
          </h1>
          <p className="text-white/50 text-lg">
            The best, the worst, and everything in between
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={cardVariants}>
                <Card
                  className={cn(
                    "group relative overflow-hidden border transition-all duration-300 hover:scale-[1.02]",
                    stat.gradient,
                    stat.borderColor,
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${stat.textColor.replace("text-", "").replace("-400", "-500/30")}, transparent)`,
                    }}
                  />
                  <CardContent className="relative z-10 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {stat.label}
                      </span>
                      <Icon className={cn("h-4 w-4", stat.textColor)} />
                    </div>
                    <div className="mb-3">
                      <span className={cn("text-xl font-bold tracking-tight", stat.textColor)}>
                        {stat.value}
                      </span>
                    </div>
                    {stat.badge && (
                      <Badge variant={stat.badgeVariant ?? "default"} className="text-[11px]">
                        {stat.badge}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}