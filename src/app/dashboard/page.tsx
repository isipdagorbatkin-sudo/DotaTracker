"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Dice1 as Dice, Target, Sword, CircleDot, Sparkles, ArrowRight } from "lucide-react"

const quickActions = [
  { href: "/randomizer", label: "Randomize Hero", icon: Dice, color: "from-purple-500 to-pink-500", desc: "Get a random hero with build" },
  { href: "/draft-helper", label: "Analyze Draft", icon: Target, color: "from-cyan-500 to-blue-500", desc: "Find the best pick" },
  { href: "/punishment-wheel", label: "Spin the Wheel", icon: CircleDot, color: "from-pink-500 to-rose-500", desc: "Get a cursed build" },
  { href: "/meta-heroes", label: "Meta Heroes", icon: Sword, color: "from-amber-500 to-orange-500", desc: "Current patch meta rankings" },
]

export default function DashboardPage() {
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
            Welcome to Dota2Tracker
          </h1>
          <p className="text-white/50 text-lg">
            Your personal Dota 2 command center
          </p>
        </motion.div>

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
