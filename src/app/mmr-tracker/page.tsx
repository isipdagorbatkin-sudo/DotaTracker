"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Search, Sparkles, Shield } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface MMRPoint {
  date: string
  mmr: number
  rankLabel: string
  matchId: number
  heroId: number
  win: boolean
}

interface MMRData {
  history: MMRPoint[]
  currentMmr: number
  currentRank: string
}

export default function MMRTrackerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MMRTrackerContent />
    </Suspense>
  )
}

function MMRTrackerContent() {
  const searchParams = useSearchParams()
  const steamId = searchParams.get("steamId") || ""
  const [input, setInput] = useState(steamId)
  const [data, setData] = useState<MMRData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!steamId) return
    setLoading(true)
    setError("")
    fetch(`/api/user/mmr-history?steamId=${steamId}`)
      .then(r => r.ok ? r.json() : Promise.reject("Failed to load"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [steamId])

  if (!steamId) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-lg mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-white mb-2">MMR Tracker</h1>
            <p className="text-white/50 mb-8">Enter your Steam ID to see rank progression</p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Steam ID"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                onKeyDown={e => { if (e.key === "Enter" && input) window.location.href = `/mmr-tracker?steamId=${encodeURIComponent(input)}` }}
              />
              <Button variant="premium" onClick={() => input && (window.location.href = `/mmr-tracker?steamId=${encodeURIComponent(input)}`)}>
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
            <div className="h-64 bg-white/5 rounded-xl" />
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
          <Button variant="outline" onClick={() => window.location.href = "/mmr-tracker"}>Try another ID</Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const chartData = data.history.map((p, i) => ({
    index: i + 1,
    mmr: p.mmr,
    label: p.date.slice(5),
    win: p.win,
  }))

  const mmrChange = data.history.length >= 2
    ? data.history[data.history.length - 1].mmr - data.history[0].mmr
    : 0

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-32 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
            <Badge variant="premium"><Sparkles className="h-3 w-3 mr-1" />MMR Tracker</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rank Progression</h1>
          <p className="text-white/50">Estimated rank based on match data</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Current Rank" value={data.currentRank} icon={<Shield className="h-4 w-4" />} color="emerald" />
          <StatCard label="Estimated MMR" value={String(data.currentMmr)} icon={<TrendingUp className="h-4 w-4" />} color="cyan" />
          <StatCard label="Matches Tracked" value={String(data.history.length)} icon={<TrendingUp className="h-4 w-4" />} color="blue" />
          <StatCard label="MMR Change" value={mmrChange >= 0 ? `+${mmrChange}` : String(mmrChange)} icon={<TrendingUp className="h-4 w-4" />} color={mmrChange >= 0 ? "emerald" : "red"} />
        </div>

        {chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-white/10">
              <CardContent className="p-6">
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="index" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} domain={["dataMin - 200", "dataMax + 200"]} />
                      <Tooltip
                        contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                        labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                        formatter={(value: any) => [`${value} MMR`, "Estimated MMR"]}
                      />
                      <Line type="monotone" dataKey="mmr" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {data.history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6">
            <p className="text-xs text-white/20 text-center">MMR is estimated from rank_tier data. Actual MMR may differ.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
