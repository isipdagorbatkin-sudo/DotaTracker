"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, TrendingDown, Calendar, BarChart3,
  Plus, Minus, Sparkles, Clock,
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { cn, formatMMR } from "@/lib/utils"

const DAYS = 30
const START_MMR = 3500

function generateMockData() {
  let current = START_MMR
  const data: { date: string; change: number; mmr: number; matches: number }[] = []
  for (let i = DAYS; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const change = i === 0 ? 0 : Math.floor(Math.random() * 101) - 50
    current += change
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      change,
      mmr: current,
      matches: Math.floor(Math.random() * 5) + 1,
    })
  }
  return data
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: { date: string; change: number; mmr: number; matches: number } }[]
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl p-4 shadow-2xl">
      <p className="text-sm text-white/50 mb-2">{d.date}</p>
      <p className="text-lg font-bold text-white mb-1">{d.mmr.toLocaleString()} MMR</p>
      <div className="flex items-center gap-1.5 text-sm">
        {d.change >= 0 ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span className={d.change >= 0 ? "text-emerald-400" : "text-red-400"}>
          {formatMMR(d.change)}
        </span>
      </div>
      <p className="text-xs text-white/40 mt-1">{d.matches} matches</p>
    </div>
  )
}

export default function MMRTrackerPage() {
  const historyData = useMemo(() => generateMockData(), [])

  const todayEntry = historyData[historyData.length - 1]
  const weekEntries = historyData.slice(-7)
  const monthEntries = historyData

  const weekChange = weekEntries.reduce((sum, e) => sum + e.change, 0)
  const monthChange = monthEntries.reduce((sum, e) => sum + e.change, 0)
  const allTimeChange = todayEntry.mmr - historyData[0].mmr

  const recentChanges = [...historyData].reverse().slice(0, 10)

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
            value={formatMMR(todayEntry.change)}
            icon={todayEntry.change >= 0 ? <TrendingUp /> : <TrendingDown />}
            trend={todayEntry.change >= 0 ? "up" : "down"}
            color={todayEntry.change >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR This Week"
            value={formatMMR(weekChange)}
            icon={<Calendar />}
            trend={weekChange >= 0 ? "up" : "down"}
            color={weekChange >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR This Month"
            value={formatMMR(monthChange)}
            icon={<BarChart3 />}
            trend={monthChange >= 0 ? "up" : "down"}
            color={monthChange >= 0 ? "emerald" : "red"}
          />
          <StatCard
            label="MMR All Time"
            value={formatMMR(allTimeChange)}
            icon={<Clock />}
            trend={allTimeChange >= 0 ? "up" : "down"}
            color={allTimeChange >= 0 ? "emerald" : "red"}
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
                  <CardDescription>Your MMR over the last 30 days</CardDescription>
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
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                      dataKey="mmr"
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
                <Badge variant="outline">{recentChanges.length} entries</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Change</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">MMR</th>
                      <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-3">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentChanges.map((entry, i) => (
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
                            {entry.change >= 0 ? (
                              <Plus className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Minus className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span
                              className={cn(
                                "text-sm font-medium",
                                entry.change >= 0 ? "text-emerald-400" : "text-red-400",
                              )}
                            >
                              {Math.abs(entry.change)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{entry.mmr.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-white/50">{entry.matches}</td>
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
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add Manual Entry
          </Button>
          <Button variant="default">
            <TrendingUp className="h-4 w-4" />
            Sync with Steam
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
