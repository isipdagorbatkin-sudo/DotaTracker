"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sword, TrendingUp, Users, Star, Shield, Sparkles, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { getCurrentPatch } from "@/lib/dota-api"
import { cn, getWinRateColor } from "@/lib/utils"

interface HeroMeta {
  id: number
  name: string
  localized_name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  winRate: number
  pickRate: number
  banRate: number
  matchCount: number
  metaScore: number
  positions: string[]
}

type SortKey = "winRate" | "pickRate" | "banRate"
type PositionFilter = "all" | "pos1" | "pos2" | "pos3" | "pos4" | "pos5"

const POSITIONS: { key: PositionFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pos1", label: "Pos 1" },
  { key: "pos2", label: "Pos 2" },
  { key: "pos3", label: "Pos 3" },
  { key: "pos4", label: "Pos 4" },
  { key: "pos5", label: "Pos 5" },
]

const SORT_OPTIONS: { key: SortKey; label: string; icon: typeof TrendingUp }[] = [
  { key: "winRate", label: "Win Rate", icon: TrendingUp },
  { key: "pickRate", label: "Pick Rate", icon: Users },
  { key: "banRate", label: "Ban Rate", icon: Shield },
]

const ATTR_CONFIG: Record<string, { color: string; label: string }> = {
  str: { color: "text-red-400", label: "Strength" },
  agi: { color: "text-green-400", label: "Agility" },
  int: { color: "text-blue-400", label: "Intelligence" },
  all: { color: "text-yellow-400", label: "Universal" },
}

function getPositionsForHero(roles: string[]): string[] {
  const positions: string[] = []
  if (roles.some(r => ["Carry", "Escape"].includes(r))) positions.push("pos1")
  if (roles.some(r => ["Nuker", "Disabler"].includes(r))) positions.push("pos2")
  if (roles.some(r => ["Initiator", "Durable", "Escape"].includes(r))) positions.push("pos3")
  if (roles.some(r => ["Support", "Disabler"].includes(r))) positions.push("pos4")
  if (roles.includes("Support") && !roles.includes("Escape")) positions.push("pos5")
  return positions.length > 0 ? positions : ["pos3"]
}

interface MetaAPIResponse {
  patch: string
  heroes: {
    id: number
    name: string
    primary_attr: string
    attack_type: string
    roles: string[]
    winrate: number
    pickRate: number
    banRate: number
    games: number
    wins: number
    bans: number
    metaScore: number
  }[]
}

async function fetchMetaHeroes(position: string, sort: string): Promise<HeroMeta[]> {
  const res = await fetch(`/api/dota/meta?position=${position}&sort=${sort}`)
  if (!res.ok) throw new Error("Failed to fetch meta heroes")
  const data: MetaAPIResponse = await res.json()
  return data.heroes.map((h) => ({
    id: h.id,
    name: h.name,
    localized_name: h.name,
    primary_attr: h.primary_attr,
    attack_type: h.attack_type,
    roles: h.roles,
    winRate: h.winrate,
    pickRate: h.pickRate,
    banRate: h.banRate,
    matchCount: h.games + h.bans,
    metaScore: h.metaScore,
    positions: getPositionsForHero(h.roles),
  }))
}

function ShimmerCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-28 rounded bg-white/5" />
            <div className="h-3 w-20 rounded bg-white/5" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-white/5" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-white/5" />
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-white/5" />
              <div className="h-3 w-10 rounded bg-white/5" />
            </div>
            <div className="h-2 rounded-full bg-white/5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-14 rounded bg-white/5" />
              <div className="h-3 w-10 rounded bg-white/5" />
            </div>
            <div className="h-2 rounded-full bg-white/5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-14 rounded bg-white/5" />
              <div className="h-3 w-10 rounded bg-white/5" />
            </div>
            <div className="h-2 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroCard({ heroMeta, index }: { heroMeta: HeroMeta; index: number }) {
  const { localized_name, primary_attr, attack_type, roles, winRate, pickRate, banRate, metaScore, positions } = heroMeta
  const attr = ATTR_CONFIG[primary_attr] || ATTR_CONFIG.str
  const winRateColor = getWinRateColor(winRate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
    >
      <Card className="group h-full border-white/[0.06] hover:border-amber-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border",
                primary_attr === "str" && "bg-red-500/10 border-red-500/30 text-red-400",
                primary_attr === "agi" && "bg-green-500/10 border-green-500/30 text-green-400",
                primary_attr === "int" && "bg-blue-500/10 border-blue-500/30 text-blue-400",
                primary_attr === "all" && "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
              )}>
                {primary_attr === "str" ? "S" : primary_attr === "agi" ? "A" : primary_attr === "int" ? "I" : "U"}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight group-hover:text-amber-300 transition-colors duration-300">
                  {localized_name}
                </h3>
                <p className="text-xs text-white/40">{attack_type} · {attr.label}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-2xl font-extrabold tracking-tight", winRateColor)}>
                {winRate.toFixed(1)}%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/30">Win Rate</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {roles.slice(0, 3).map(role => (
              <Badge key={role} variant="outline" className="text-[10px] px-2 py-0 border-white/10 text-white/50">
                {role}
              </Badge>
            ))}
            {positions.map(pos => (
              <Badge
                key={pos}
                variant="default"
                className="text-[10px] px-2 py-0 bg-amber-500/10 text-amber-300 border-amber-500/20"
              >
                {pos.toUpperCase().replace("POS", "Pos ")}
              </Badge>
            ))}
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Pick Rate
                </span>
                <span className="text-white/70 font-medium">{pickRate.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(pickRate / 35) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.03 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Ban Rate
                </span>
                <span className="text-white/70 font-medium">{banRate.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(banRate / 25) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.03 }}
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-white/50">Meta Score</span>
            </div>
            <span className="text-sm font-bold text-amber-400">{metaScore}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function MetaHeroesPage() {
  const [heroMetaList, setHeroMetaList] = useState<HeroMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("winRate")
  const [showFilters, setShowFilters] = useState(false)
  const [loadingDuration, setLoadingDuration] = useState(0)
  const patch = getCurrentPatch()

  useEffect(() => {
    let cancelled = false
    let loadTimer: ReturnType<typeof setInterval> | null = null

    async function load() {
      try {
        setLoading(true)
        setLoadingDuration(0)
        setError(null)
        loadTimer = setInterval(() => {
          if (!cancelled) setLoadingDuration(prev => prev + 1)
        }, 1000)
        const meta = await fetchMetaHeroes(positionFilter, sortKey)
        if (cancelled) return
        setHeroMetaList(meta)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load heroes")
      } finally {
        if (!cancelled) setLoading(false)
        if (loadTimer) clearInterval(loadTimer)
      }
    }

    load()
    return () => {
      cancelled = true
      if (loadTimer) clearInterval(loadTimer)
    }
  }, [positionFilter, sortKey])

  const sortedHeroes = useMemo(() => {
    return [...heroMetaList].sort((a, b) => {
      switch (sortKey) {
        case "winRate": return b.winRate - a.winRate
        case "pickRate": return b.pickRate - a.pickRate
        case "banRate": return b.banRate - a.banRate
        default: return b.metaScore - a.metaScore
      }
    })
  }, [heroMetaList, sortKey])

  const summaryStats = useMemo(() => {
    if (heroMetaList.length === 0) return null
    const avgWinRate = heroMetaList.reduce((s, h) => s + h.winRate, 0) / heroMetaList.length
    const avgPickRate = heroMetaList.reduce((s, h) => s + h.pickRate, 0) / heroMetaList.length
    const avgBanRate = heroMetaList.reduce((s, h) => s + h.banRate, 0) / heroMetaList.length
    const topMeta = [...heroMetaList].sort((a, b) => b.metaScore - a.metaScore)[0]
    return { avgWinRate, avgPickRate, avgBanRate, topMeta }
  }, [heroMetaList])

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
              <Shield className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Failed to Load Heroes</h2>
            <p className="text-white/50 mb-6 max-w-md">{error}</p>
            <Button onClick={() => window.location.reload()} variant="premium">
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-32 left-1/4 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[128px]" />
      <div className="absolute bottom-32 right-1/4 w-[400px] h-[400px] bg-purple-500/3 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Patch {patch}
            </Badge>
            <Badge variant="outline" className="border-amber-500/20 text-amber-400/70">
              <Sword className="h-3 w-3 mr-1" />
              Meta Heroes
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Meta Heroes
          </h1>
          <p className="text-white/50 text-lg">
            Current patch hero rankings based on win rate, pick rate, and ban rate
          </p>
        </motion.div>

        {summaryStats && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8"
          >
            <StatCard label="Avg Win Rate" value={`${summaryStats.avgWinRate.toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4" />} color="emerald" />
            <StatCard label="Avg Pick Rate" value={`${summaryStats.avgPickRate.toFixed(1)}%`} icon={<Users className="h-4 w-4" />} color="cyan" />
            <StatCard label="Avg Ban Rate" value={`${summaryStats.avgBanRate.toFixed(1)}%`} icon={<Shield className="h-4 w-4" />} color="red" />
            <StatCard label="Top Meta Hero" value={summaryStats.topMeta.localized_name} icon={<Star className="h-4 w-4" />} color="yellow" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {POSITIONS.map(pos => (
                <Button
                  key={pos.key}
                  variant={positionFilter === pos.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPositionFilter(pos.key)}
                  className={cn(
                    "transition-all duration-300",
                    positionFilter === pos.key && "bg-gradient-to-r from-amber-600 to-orange-500 border-0 shadow-lg shadow-amber-600/25"
                  )}
                >
                  {pos.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 mr-1 hidden sm:inline">Sort by:</span>
              <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
                {SORT_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setSortKey(opt.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300",
                        sortKey === opt.key
                          ? "bg-gradient-to-r from-amber-600/30 to-orange-500/30 text-amber-300 shadow-sm border border-amber-500/20"
                          : "text-white/40 hover:text-white/70"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden sm:hidden"
              >
                <div className="flex flex-wrap gap-2 pt-3">
                  {POSITIONS.map(pos => (
                    <Button
                      key={pos.key}
                      variant={positionFilter === pos.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPositionFilter(pos.key)}
                    >
                      {pos.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {loading ? (
          <div>
            {loadingDuration >= 15 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
              >
                <p className="text-amber-300/80 text-sm mb-2">
                  {loadingDuration >= 30
                    ? "This is taking longer than expected. OpenDota API may be slow — you can retry or wait."
                    : "Still loading meta data from OpenDota API..."}
                </p>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>Elapsed: {loadingDuration}s</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedHeroes.map((heroMeta, i) => (
                <HeroCard key={heroMeta.id} heroMeta={heroMeta} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && sortedHeroes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-white/30" />
            </div>
            <p className="text-white/40 text-lg">No heroes match this filter.</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setPositionFilter("all")}
            >
              Clear Filter
            </Button>
          </motion.div>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-white/20"
          >
            Showing {sortedHeroes.length} of {heroMetaList.length} heroes · Patch {patch}
          </motion.div>
        )}
      </div>
    </div>
  )
}
