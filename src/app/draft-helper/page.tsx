"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Shield, Zap, Brain, Sparkles, ChevronRight, Target, Swords, Users, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { fetchHeroes, analyzeDraft, type DotaHero, type DraftAnalysis } from "@/lib/dota-api"

const POSITIONS = ["pos1", "pos2", "pos3", "pos4", "pos5"] as const
const POSITION_LABELS: Record<string, string> = {
  pos1: "Safe Lane",
  pos2: "Mid Lane",
  pos3: "Offlane",
  pos4: "Soft Support",
  pos5: "Hard Support",
}

function getRankColor(index: number): string {
  if (index === 0) return "text-yellow-400"
  if (index === 1) return "text-slate-300"
  if (index === 2) return "text-amber-600"
  return "text-white/40"
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "from-emerald-500 to-cyan-400"
  if (score >= 60) return "from-cyan-500 to-blue-400"
  if (score >= 40) return "from-yellow-500 to-orange-400"
  return "from-red-500 to-pink-400"
}

interface HeroSelectorProps {
  heroes: DotaHero[]
  selected: DotaHero[]
  search: string
  onSearchChange: (value: string) => void
  onToggle: (hero: DotaHero) => void
  limit: number
  label: string
  icon: React.ElementType
  accentColor: string
}

function HeroSelector({
  heroes,
  selected,
  search,
  onSearchChange,
  onToggle,
  limit,
  label,
  icon: Icon,
  accentColor,
}: HeroSelectorProps) {
  const filtered = useMemo(
    () => heroes.filter(
      (h) => h.localized_name.toLowerCase().includes(search.toLowerCase())
    ),
    [heroes, search]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", accentColor)} />
          <span className="text-sm font-medium text-white/80">{label}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {selected.length}/{limit}
        </Badge>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <AnimatePresence mode="popLayout">
            {selected.map((hero) => (
              <motion.button
                key={hero.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onToggle(hero)}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 text-xs text-purple-200 hover:bg-purple-500/30 transition-colors"
              >
                {hero.localized_name}
                <X className="h-3 w-3" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search heroes..."
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
        />
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
          {filtered.map((hero) => {
            const isSelected = selected.some((s) => s.id === hero.id)
            const atLimit = selected.length >= limit && !isSelected
            return (
              <motion.button
                key={hero.id}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={atLimit}
                onClick={() => onToggle(hero)}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-medium transition-all truncate",
                  isSelected
                    ? "bg-purple-500/30 border border-purple-400/40 text-purple-200"
                    : atLimit
                      ? "bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {hero.localized_name}
              </motion.button>
            )
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-white/30 text-xs py-4">
              No heroes found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DraftHelperPage() {
  const [heroes, setHeroes] = useState<DotaHero[]>([])
  const [heroesLoading, setHeroesLoading] = useState(true)
  const [heroesError, setHeroesError] = useState<string | null>(null)

  const [role, setRole] = useState("pos1")
  const [allySearch, setAllySearch] = useState("")
  const [enemySearch, setEnemySearch] = useState("")
  const [allies, setAllies] = useState<DotaHero[]>([])
  const [enemies, setEnemies] = useState<DotaHero[]>([])

  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<DraftAnalysis[] | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    fetchHeroes()
      .then((data) => {
        setHeroes(data)
        setHeroesLoading(false)
      })
      .catch((err) => {
        setHeroesError(err.message || "Failed to load heroes")
        setHeroesLoading(false)
      })
  }, [])

  const toggleAlly = useCallback((hero: DotaHero) => {
    setAllies((prev) => {
      const exists = prev.find((h) => h.id === hero.id)
      if (exists) return prev.filter((h) => h.id !== hero.id)
      if (prev.length >= 4) return prev
      return [...prev, hero]
    })
  }, [])

  const toggleEnemy = useCallback((hero: DotaHero) => {
    setEnemies((prev) => {
      const exists = prev.find((h) => h.id === hero.id)
      if (exists) return prev.filter((h) => h.id !== hero.id)
      if (prev.length >= 5) return prev
      return [...prev, hero]
    })
  }, [])

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true)
    setAnalysisError(null)
    setResults(null)
    try {
      const data = await analyzeDraft(
        role,
        allies.map((h) => h.id),
        enemies.map((h) => h.id)
      )
      setResults(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed. Please try again."
      setAnalysisError(message)
    } finally {
      setAnalyzing(false)
    }
  }, [role, allies, enemies])

  const canAnalyze = allies.length > 0 && enemies.length > 0 && !analyzing

  if (heroesLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-10 w-10 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
          <p className="text-white/50 text-sm">Loading heroes...</p>
        </motion.div>
      </div>
    )
  }

  if (heroesError) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <Card className="border-red-500/30 bg-red-500/5 max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Shield className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Failed to Load Heroes</h2>
            <p className="text-white/50 text-sm mb-4">{heroesError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Draft Analyzer
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Draft Helper
          </h1>
          <p className="text-white/50 text-lg">
            Select position, allies, and enemies to find the best pick
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-purple-400" />
                    Position
                  </CardTitle>
                  <CardDescription>Select the role you want to fill</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {POSITIONS.map((p) => (
                      <motion.button
                        key={p}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setRole(p)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium border transition-all",
                          role === p
                            ? "bg-purple-500/20 border-purple-400/40 text-purple-200 shadow-lg shadow-purple-500/10"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
                        )}
                      >
                        <span className="mr-1.5 opacity-60">{p.toUpperCase()}</span>
                        {POSITION_LABELS[p]}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card>
                <CardContent className="p-5 space-y-4">
                  <HeroSelector
                    heroes={heroes}
                    selected={allies}
                    search={allySearch}
                    onSearchChange={setAllySearch}
                    onToggle={toggleAlly}
                    limit={4}
                    label="Allied Heroes"
                    icon={Shield}
                    accentColor="text-emerald-400"
                  />
                  <div className="border-t border-white/5" />
                  <HeroSelector
                    heroes={heroes}
                    selected={enemies}
                    search={enemySearch}
                    onSearchChange={setEnemySearch}
                    onToggle={toggleEnemy}
                    limit={5}
                    label="Enemy Heroes"
                    icon={Swords}
                    accentColor="text-red-400"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="premium"
                size="lg"
                className="w-full text-base"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                {analyzing ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                    Analyzing Draft...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Draft
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
              {!canAnalyze && !analyzing && (
                <p className="text-xs text-white/30 text-center mt-2">
                  {allies.length === 0 && enemies.length === 0
                    ? "Add allied and enemy heroes to analyze"
                    : allies.length === 0
                      ? "Add at least one allied hero"
                      : "Add at least one enemy hero"}
                </p>
              )}
            </motion.div>

            {analysisError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">Analysis Failed</p>
                      <p className="text-xs text-red-200/60 mt-0.5">{analysisError}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                      <div className="h-12 w-12 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-white font-medium">Analyzing Draft</p>
                        <p className="text-white/40 text-sm mt-1">Checking synergies and counters...</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
                    <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
                  </div>
                  <AnimatePresence>
                    {results.map((pick, index) => (
                      <motion.div
                        key={pick.heroId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        <Card className="group hover:border-purple-500/30 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                                  getRankColor(index),
                                  index === 0
                                    ? "bg-yellow-500/15 border border-yellow-500/30"
                                    : index === 1
                                      ? "bg-slate-400/10 border border-slate-400/20"
                                      : index === 2
                                        ? "bg-amber-600/10 border border-amber-600/20"
                                        : "bg-white/5 border border-white/10"
                                )}
                              >
                                {index + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-base font-semibold text-white truncate">
                                    {pick.heroName}
                                  </h3>
                                  <span
                                    className={cn(
                                      "text-sm font-bold tabular-nums ml-2",
                                      pick.score >= 70
                                        ? "text-emerald-400"
                                        : pick.score >= 50
                                          ? "text-yellow-400"
                                          : "text-red-400"
                                    )}
                                  >
                                    {pick.score}
                                  </span>
                                </div>

                                <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pick.score}%` }}
                                    transition={{ delay: index * 0.06 + 0.2, duration: 0.6, ease: "easeOut" }}
                                    className={cn(
                                      "h-full rounded-full bg-gradient-to-r",
                                      getScoreBarColor(pick.score)
                                    )}
                                  />
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  <Badge variant="default" className="text-[10px] px-2 py-0.5">
                                    <Zap className="h-3 w-3 mr-1" />
                                    {pick.winrate.toFixed(0)}% WR
                                  </Badge>
                                  <Badge
                                    variant={pick.synergyScore >= 20 ? "success" : "outline"}
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    <Users className="h-3 w-3 mr-1" />
                                    Syn: {pick.synergyScore}
                                  </Badge>
                                  <Badge
                                    variant={pick.counterScore >= 20 ? "warning" : "outline"}
                                    className="text-[10px] px-2 py-0.5"
                                  >
                                    <Target className="h-3 w-3 mr-1" />
                                    Ctr: {pick.counterScore}
                                  </Badge>
                                </div>

                                {pick.reasons.length > 0 && (
                                  <ul className="space-y-0.5">
                                    {pick.reasons.map((reason, ri) => (
                                      <li key={ri} className="flex items-start gap-1.5 text-xs text-white/50">
                                        <ChevronRight className="h-3 w-3 text-purple-400 shrink-0 mt-0.5" />
                                        {reason}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center">
                        <Brain className="h-8 w-8 text-purple-400" />
                      </div>
                      <div className="text-center max-w-xs">
                        <p className="text-white font-medium mb-1">Ready to Analyze</p>
                        <p className="text-white/40 text-sm">
                          Select your position, add allies and enemies, then click analyze to get smart draft recommendations
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-3 text-xs text-white/30 mt-2">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" /> Position
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Allies
                        </div>
                        <div className="flex items-center gap-1">
                          <Swords className="h-3 w-3" /> Enemies
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
