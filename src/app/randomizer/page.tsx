"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  fetchHeroes,
  getPositionForHero,
  getRandomBuild,
  getHeroWinrate,
  type DotaHero,
  type ItemBuild,
} from "@/lib/dota-api"
import {
  Dice1 as Dice,
  RefreshCw,
  Sparkles,
  Swords,
  Shield,
  Zap,
  Heart,
  Orbit,
  Sword,
  Wand2,
  Target,
  Loader2,
} from "lucide-react"

const POSITIONS = ["pos1", "pos2", "pos3", "pos4", "pos5"] as const
type Position = (typeof POSITIONS)[number]

const positionMeta: Record<Position, { label: string; icon: typeof Swords; gradient: string; color: string }> = {
  pos1: { label: "Safe Lane", icon: Swords, gradient: "from-amber-500 to-orange-500", color: "amber" },
  pos2: { label: "Mid Lane", icon: Zap, gradient: "from-red-500 to-rose-500", color: "red" },
  pos3: { label: "Off Lane", icon: Shield, gradient: "from-emerald-500 to-teal-500", color: "emerald" },
  pos4: { label: "Soft Support", icon: Wand2, gradient: "from-cyan-500 to-blue-500", color: "cyan" },
  pos5: { label: "Hard Support", icon: Heart, gradient: "from-purple-500 to-pink-500", color: "purple" },
}

const attrMap: Record<string, { label: string; color: string }> = {
  str: { label: "Strength", color: "text-red-400" },
  agi: { label: "Agility", color: "text-emerald-400" },
  int: { label: "Intelligence", color: "text-blue-400" },
  all: { label: "Universal", color: "text-purple-400" },
}

function Shimmer() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-8 w-3/4 rounded-lg bg-white/5" />
      <div className="h-4 w-1/2 rounded-lg bg-white/5" />
      <div className="h-4 w-2/3 rounded-lg bg-white/5" />
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-20 rounded-full bg-white/5" />
        <div className="h-6 w-24 rounded-full bg-white/5" />
        <div className="h-6 w-16 rounded-full bg-white/5" />
      </div>
    </div>
  )
}

function WinrateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 55 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/20" :
    rate >= 48 ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/20" :
    "text-red-400 border-red-500/30 bg-red-500/20"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold border", color)}>
      <Target className="h-3.5 w-3.5" />
      {rate.toFixed(1)}%
    </span>
  )
}

export default function RandomizerPage() {
  const [position, setPosition] = useState<Position>("pos1")
  const [heroes, setHeroes] = useState<DotaHero[]>([])
  const [hero, setHero] = useState<DotaHero | null>(null)
  const [build, setBuild] = useState<ItemBuild | null>(null)
  const [winrate, setWinrate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [randomizing, setRandomizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    fetchHeroes()
      .then(setHeroes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const randomize = useCallback(async () => {
    if (heroes.length === 0) return
    setRandomizing(true)
    setError(null)

    try {
      const eligible = heroes.filter((h) => getPositionForHero(h).includes(position))
      if (eligible.length === 0) {
        setError("No heroes found for this position")
        setRandomizing(false)
        return
      }
      const picked = eligible[Math.floor(Math.random() * eligible.length)]
      setHero(picked)
      setBuild(getRandomBuild(position))
      const wr = await getHeroWinrate(picked.id)
      setWinrate(wr)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to randomize")
    } finally {
      setRandomizing(false)
    }
  }, [heroes, position])

  const rerollBuild = useCallback(() => {
    if (!hero) return
    setBuild(getRandomBuild(position))
  }, [hero, position])

  useEffect(() => {
    if (!loading && heroes.length > 0 && !initialized.current) {
      initialized.current = true
      randomize()
    }
  }, [loading, heroes, randomize])

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[128px]" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Hero Randomizer
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Random <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Hero</span> Generator
          </h1>
          <p className="text-white/50 text-lg">
            Pick a position and get a random hero with a full build
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">Select Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => {
              const meta = positionMeta[pos]
              const Icon = meta.icon
              const selected = position === pos
              return (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                    selected
                      ? `${meta.gradient} text-white border-transparent shadow-lg`
                      : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="p-8">
                  <Shimmer />
                </CardContent>
              </Card>
            </motion.div>
          ) : hero && build ? (
            <motion.div
              key={hero.id + position}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="overflow-hidden border-white/10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <motion.h2
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-3xl sm:text-4xl font-bold mb-2"
                        >
                          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                            {hero.localized_name}
                          </span>
                        </motion.h2>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-wrap items-center gap-3"
                        >
                          <Badge variant="outline" className="text-white/70">
                            <Orbit className="h-3 w-3 mr-1.5" />
                            Patch 7.41c
                          </Badge>
                          {hero.primary_attr && (
                            <span className={cn("text-sm font-medium", attrMap[hero.primary_attr]?.color || "text-white/50")}>
                              {attrMap[hero.primary_attr]?.label || hero.primary_attr}
                            </span>
                          )}
                          <span className="text-sm text-white/40">•</span>
                          <span className="text-sm text-white/50">{hero.attack_type}</span>
                          {winrate !== null && <WinrateBadge rate={winrate} />}
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="hidden sm:flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30"
                      >
                        <Dice className="h-7 w-7 text-purple-400" />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex flex-wrap gap-2 mt-4"
                    >
                      {hero.roles.map((role) => (
                        <Badge key={role} variant="default">{role}</Badge>
                      ))}
                    </motion.div>
                  </CardHeader>
                </div>

                <CardContent className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sword className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Item Build</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {build.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/70"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Skill Build</h3>
                      </div>
                      <div className="space-y-1">
                        {build.skills.map((skill, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm font-mono text-white/70"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Wand2 className="h-4 w-4 text-pink-400" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Talents</h3>
                      </div>
                      <div className="space-y-1">
                        {build.talents.map((talent, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/70"
                          >
                            {talent}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {build.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/10"
                    >
                      <p className="text-sm text-white/60 leading-relaxed">{build.explanation}</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-3 mt-6"
              >
                <Button
                  variant="premium"
                  size="lg"
                  onClick={randomize}
                  disabled={randomizing}
                  className="flex-1 sm:flex-none"
                >
                  {randomizing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Dice className="h-4 w-4 mr-2" />
                  )}
                  {randomizing ? "Randomizing..." : "Reroll Hero"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={rerollBuild}
                  disabled={randomizing}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reroll Build
                </Button>
              </motion.div>
            </motion.div>
          ) : !error ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Dice className="h-16 w-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/40 text-lg">Select a position and click randomize</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
