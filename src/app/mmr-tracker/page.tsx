"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Calendar, BarChart3,
  Plus, Minus, Sparkles, Clock, Loader2,
} from "lucide-react"
import {
  AreaChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { cn, formatMMR } from "@/lib/utils"

interface MMRDataPoint {
  date: string
  mmrChange: number
  games: number
  wins: number
  cumulativeMMR: number
}

interface MMRResponse {
  today: number
  week: number
  month: number
  allTime: number
  chartData: MMRDataPoint[]
  recentChanges: { date: string; mmrChange: number; games: number; wins: number }[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: MMRDataPoint }[]
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 shadow-2xl">
      <p className="text-sm text-white/50 mb-2">{d.date}</p>
      <p className="text-lg font-bold text-white mb-1">{d.cumulativeMMR.toLocaleString()} MMR</p>
      <div className="flex items-center gap-1.5 text-sm">
        {d.mmrChange >= 0 ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className={d.mmrChange >= 0 ? "text-emerald-400" : "text-red-400"}>
          {formatMMR(d.mmrChange)}
        </span>
      </div>
      <p className="text-xs text-white/40 mt-1">{d.games} matches ({d.wins}W / {d.games - d.wins}L)</p>
    </div>
  )
}

export default function MMRTrackerPage() {
  const [data, setData] = useState<MMRResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/mmr-history")
        if (!res.ok) {
          if (res.status === 401) setError("Please sign in to view MMR history")
          else setError("Failed to load MMR history")
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError("Failed to load MMR history")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex justify-center">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </div>
    )
  }

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

  if (!data) return null

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              MMR Tracker
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            MMR History
          </h1>
          <p className="text-white/50 text-lg">
            Track your MMR progression over time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="MMR Today"
            value={formatMMR(data.today)}
            icon={data.today >= 0 ? <TrendingUp /> : <TrendingDown />}
            trend={data.today >= 0 ? "up" : "down"}
            color={data.today >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR This Week"
            value={formatMMR(data.week)}
            icon={<Calendar />}
            trend={data.week >= 0 ? "up" : "down"}
            color={data.week >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR This Month"
            value={formatMMR(data.month)}
            icon={<BarChart3 />}
            trend={data.month >= 0 ? "up" : "down"}
            color={data.month >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR All Time"
            value={formatMMR(data.allTime)}
            icon={<Clock />}
            trend={data.allTime >= 0 ? "up" : "down"}
            color={data.allTime >= 0 ? "emerald" : "red"}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>MMR Progression</CardTitle>
                  <CardDescription>Your MMR over recent matches</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>MMR</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mmrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="mmrLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["dataMin - 100", "dataMax + 100"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      tickFormatter={(v: number) => v.toLocaleString()}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeMMR"
                      stroke="url(#mmrLineGradient)"
                      strokeWidth={2.5}
                      fill="url(#mmrGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: "#a78bfa", stroke: "#1a1a2e", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Changes</CardTitle>
                  <CardDescription>Your latest MMR updates</CardDescription>
                </div>
                <Badge variant="outline">{data.recentChanges.length} entries</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Change</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Matches</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentChanges.map((entry, i) => (
                      <motion.tr
                        key={entry.date + i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          "border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors",
                        )}
                      >
                        <td className="px-6 py-4 text-sm text-white/70">{entry.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {entry.mmrChange >= 0 ? (
                              <Plus className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Minus className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium",
                                entry.mmrChange >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {Math.abs(entry.mmrChange)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">{entry.games}</td>
                        <td className="px-6 py-4 text-sm text-white/50">{entry.wins}W / {entry.games - entry.wins}L</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4" />
            Add Manual Entry
          </Button>
          <Button variant="default" disabled>
            <TrendingUp className="h-4 w-4" />
            Sync with Steam
          </Button>
        </motion.div>
      </div>
    </div>
  )
}