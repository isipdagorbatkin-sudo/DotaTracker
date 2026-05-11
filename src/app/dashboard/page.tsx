"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dice1 as Dice, Target, Sword, CircleDot, TrendingUp, Users, Sparkles, ArrowRight, LogIn } from "lucide-react"

const quickActions = [
  { href: "/randomizer", label: "Randomize Hero", icon: Dice, color: "from-purple-500 to-pink-500", desc: "Get a random hero with build" },
  { href: "/draft-helper", label: "Analyze Draft", icon: Target, color: "from-cyan-500 to-blue-500", desc: "Find the best pick" },
  { href: "/punishment-wheel", label: "Spin the Wheel", icon: CircleDot, color: "from-pink-500 to-rose-500", desc: "Get a cursed build" },
  { href: "/meta-heroes", label: "Meta Heroes", icon: Sword, color: "from-amber-500 to-orange-500", desc: "Current patch meta rankings" },
]

const userFeatures = [
  { href: "/profile", label: "Profile", icon: Users, desc: "Your match stats and top heroes", color: "from-purple-500/10 to-cyan-500/5" },
  { href: "/mmr-tracker", label: "MMR Tracker", icon: TrendingUp, desc: "Rank progression chart", color: "from-emerald-500/10 to-teal-500/5" },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-20 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Dashboard
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {status === "authenticated" ? `Welcome back, ${session.user?.name}` : "Welcome to Dota2Tracker"}
          </h1>
          <p className="text-white/50 text-lg">
            {status === "authenticated"
              ? "Your personal Dota 2 command center"
              : "Sign in with Steam to unlock personalized features"}
          </p>
        </motion.div>

        {status === "unauthenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/5">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-semibold text-white mb-1">Unlock Your Stats</h2>
                    <p className="text-sm text-white/50">Sign in with Steam to view your match stats, MMR history, and more</p>
                  </div>
                  <a href="/api/auth/steam">
                    <Button variant="premium" size="lg">
                      <LogIn className="h-4 w-4 mr-2" />Sign in via Steam
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {status === "authenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-semibold text-white mb-1">Your Data</h2>
                    <p className="text-sm text-white/50">View your personal match statistics and rank progression</p>
                  </div>
                  <div className="flex gap-2">
                    {userFeatures.map(f => (
                      <Link key={f.href} href={f.href}>
                        <Button variant="outline" size="sm">{f.label}</Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={action.href}>
                  <Card className="group cursor-pointer hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-20 mb-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-gradient transition-all">
                        {action.label}
                      </h3>
                      <p className="text-sm text-white/40">{action.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">All Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/meta-heroes", label: "Meta Heroes", icon: Sword, desc: "Current patch hero rankings", color: "from-amber-500/20 to-orange-500/10" },
              { href: "/randomizer", label: "Randomizer", icon: Dice, desc: "Random hero with optimal build", color: "from-purple-500/20 to-pink-500/10" },
              { href: "/draft-helper", label: "Draft Helper", icon: Target, desc: "AI-powered draft analysis", color: "from-cyan-500/20 to-blue-500/10" },
              { href: "/punishment-wheel", label: "Punishment Wheel", icon: CircleDot, desc: "Cursed item builds generator", color: "from-pink-500/20 to-rose-500/10" },
              { href: "/profile", label: "Profile", icon: Users, desc: "Your match stats and top heroes", color: "from-purple-500/20 to-cyan-500/10" },
              { href: "/mmr-tracker", label: "MMR Tracker", icon: TrendingUp, desc: "Rank progression chart", color: "from-emerald-500/20 to-teal-500/10" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link href={item.href}>
                    <Card className={`bg-gradient-to-br ${item.color} border-white/10 group cursor-pointer hover:border-white/20 transition-all`}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                          <div>
                            <p className="font-medium text-white group-hover:text-gradient transition-all">{item.label}</p>
                            <p className="text-xs text-white/40">{item.desc}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-purple-400 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
