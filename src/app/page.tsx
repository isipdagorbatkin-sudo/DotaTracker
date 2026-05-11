"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dice1 as Dice, CircleDot, TrendingUp, Target, Sword, Users,
  Sparkles, ArrowRight, ChevronRight, Shield,
} from "lucide-react"

const features = [
  {
    icon: Dice,
    title: "Hero Randomizer",
    desc: "Random hero with optimal build, talents, and skill build for any position",
    href: "/randomizer",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Draft Analyzer",
    desc: "AI-powered draft analysis showing best picks, counters, and synergies",
    href: "/draft-helper",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: CircleDot,
    title: "Punishment Wheel",
    desc: "Meme punishment wheel — get random cursed item builds",
    href: "/punishment-wheel",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "MMR Tracker",
    desc: "Track your MMR history with beautiful charts and statistics",
    href: "/mmr-tracker",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Sword,
    title: "Meta Heroes",
    desc: "Current patch meta heroes with winrates, pickrates and banrates",
    href: "/meta-heroes",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Fun Stats",
    desc: "Interesting statistics: best KDA, longest game, highest damage and more",
    href: "/fun-stats",
    color: "from-violet-500 to-purple-500",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[128px]" />

      <div className="relative">
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="premium" className="px-4 py-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Premium Dota 2 Assistant
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Level Up Your
              </span>
              <br />
              <span className="text-white">Dota 2 Experience</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10"
            >
              Analyze drafts, track MMR, discover meta heroes, randomize builds, and more.
              Your ultimate companion for Dota 2.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/dashboard">
                <Button variant="premium" size="lg" className="text-base">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/randomizer">
                <Button variant="outline" size="lg" className="text-base">
                  <Dice className="h-4 w-4 mr-2" />
                  Try Randomizer
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl px-4 pb-24"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gradient">Everything</span> You Need
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Premium tools to improve your gameplay, settle disputes, and have fun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Link href={feature.href} className="group block">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative">
                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-20 mb-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gradient transition-all">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                          {feature.desc}
                        </p>
                        <div className="mt-4 flex items-center text-xs text-white/30 group-hover:text-purple-400 transition-colors">
                          Explore <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <section className="border-t border-white/10 py-16 px-4">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to <span className="text-gradient">Dominate</span>?
              </h2>
              <p className="text-white/50 text-lg mb-8">
                Sign in with Steam to unlock personalized features
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Shield className="h-4 w-4" />
                  Secure Steam Auth
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Sparkles className="h-4 w-4" />
                  Free to use
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 px-4">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/30">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Dota2Tracker — Premium Dota 2 Assistant
            </div>
            <div className="flex items-center gap-4 text-xs text-white/20">
              <span>Not affiliated with Valve Corporation</span>
              <span>Data via OpenDota API</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
