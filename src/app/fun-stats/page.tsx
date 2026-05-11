"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration, getKDA } from "@/lib/utils"
import {
  Clock, Star, Skull, Swords, Trophy, Flame,
  TrendingUp, TrendingDown, Activity, Zap, Crosshair,
  Shield, Heart, Sparkles,
} from "lucide-react"

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

const stats: StatItem[] = [
  {
    label: "Longest Game",
    value: formatDuration(5123),
    icon: Clock,
    gradient: "from-orange-500/20 to-amber-600/10",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    badge: "1h 25m",
    badgeVariant: "warning",
  },
  {
    label: "Best KDA",
    value: getKDA(22, 1, 15),
    icon: Star,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    badge: "37.00",
    badgeVariant: "success",
  },
  {
    label: "Worst KDA",
    value: getKDA(2, 14, 3),
    icon: Skull,
    gradient: "from-red-500/20 to-red-600/10",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    badge: "0.36",
    badgeVariant: "danger",
  },
  {
    label: "Most Played Hero",
    value: "Phantom Assassin",
    icon: Swords,
    gradient: "from-purple-500/20 to-purple-600/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    badge: "182 games",
    badgeVariant: "default",
  },
  {
    label: "Best Winrate Hero",
    value: "Crystal Maiden",
    icon: Trophy,
    gradient: "from-cyan-500/20 to-cyan-600/10",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    badge: "68.4%",
    badgeVariant: "success",
  },
  {
    label: "Worst Winrate Hero",
    value: "Invoker",
    icon: Flame,
    gradient: "from-pink-500/20 to-pink-600/10",
    textColor: "text-pink-400",
    borderColor: "border-pink-500/30",
    badge: "32.1%",
    badgeVariant: "danger",
  },
  {
    label: "Best Win Streak",
    value: "14 Wins",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 to-teal-600/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    badge: "Record",
    badgeVariant: "success",
  },
  {
    label: "Worst Lose Streak",
    value: "11 Losses",
    icon: TrendingDown,
    gradient: "from-red-500/20 to-rose-600/10",
    textColor: "text-red-400",
    borderColor: "border-red-500/30",
    badge: "Oof",
    badgeVariant: "danger",
  },
  {
    label: "Highest GPM",
    value: "892",
    icon: Activity,
    gradient: "from-yellow-500/20 to-amber-600/10",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    badge: "Gold/min",
    badgeVariant: "warning",
  },
  {
    label: "Highest XPM",
    value: "1,024",
    icon: Zap,
    gradient: "from-blue-500/20 to-blue-600/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    badge: "XP/min",
    badgeVariant: "default",
  },
  {
    label: "Most Hero Damage",
    value: "98,742",
    icon: Crosshair,
    gradient: "from-orange-500/20 to-red-600/10",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    badge: "Pudge",
    badgeVariant: "danger",
  },
  {
    label: "Most Tower Damage",
    value: "24,561",
    icon: Shield,
    gradient: "from-indigo-500/20 to-indigo-600/10",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    badge: "Towers",
    badgeVariant: "default",
  },
  {
    label: "Most Healing",
    value: "42,389",
    icon: Heart,
    gradient: "from-green-500/20 to-green-600/10",
    textColor: "text-green-400",
    borderColor: "border-green-500/30",
    badge: "Dazzle",
    badgeVariant: "success",
  },
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

export default function FunStatsPage() {
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
