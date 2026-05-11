"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  color?: "emerald" | "cyan" | "purple" | "pink" | "yellow" | "red" | "blue"
  className?: string
}

const colorMap = {
  emerald: { from: "from-emerald-500/20", to: "to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  cyan: { from: "from-cyan-500/20", to: "to-cyan-600/10", border: "border-cyan-500/30", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
  purple: { from: "from-purple-500/20", to: "to-purple-600/10", border: "border-purple-500/30", text: "text-purple-400", glow: "shadow-purple-500/20" },
  pink: { from: "from-pink-500/20", to: "to-pink-600/10", border: "border-pink-500/30", text: "text-pink-400", glow: "shadow-pink-500/20" },
  yellow: { from: "from-yellow-500/20", to: "to-yellow-600/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  red: { from: "from-red-500/20", to: "to-red-600/10", border: "border-red-500/30", text: "text-red-400", glow: "shadow-red-500/20" },
  blue: { from: "from-blue-500/20", to: "to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
}

export function StatCard({ label, value, icon, trend, color = "cyan", className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-xl p-5 transition-all duration-300 hover:scale-[1.02]",
        c.from, c.to, c.border,
        "shadow-lg",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</span>
          {icon && <span className={cn("w-4 h-4", c.text)}>{icon}</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold tracking-tight", c.text)}>{value}</span>
          {trend === "up" && <span className="text-emerald-400 text-sm">↑</span>}
          {trend === "down" && <span className="text-red-400 text-sm">↓</span>}
        </div>
      </div>
      <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br blur-3xl opacity-20 group-hover:opacity-30 transition-opacity", c.from, c.to)} />
    </motion.div>
  )
}
