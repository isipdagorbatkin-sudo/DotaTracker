"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Sword, Dice1 as Dice, CircleDot, TrendingUp, BarChart3, Target,
  Users, Menu, X, LogOut, ChevronRight, Sparkles,
} from "lucide-react"
import { useState } from "react"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/randomizer", label: "Randomizer", icon: Dice },
  { href: "/draft-helper", label: "Draft Helper", icon: Target },
  { href: "/meta-heroes", label: "Meta Heroes", icon: Sword },
  { href: "/punishment-wheel", label: "Punishment Wheel", icon: CircleDot },
  { href: "/mmr-tracker", label: "MMR Tracker", icon: TrendingUp },
  { href: "/fun-stats", label: "Fun Stats", icon: Users },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Dota2Tracker
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 rounded-lg border border-white/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              {session?.user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur-sm opacity-50" />
                      <img
                        src={session.user.image || ""}
                        alt="Avatar"
                        className="relative h-8 w-8 rounded-full border border-white/20"
                      />
                    </div>
                    <span className="hidden sm:block text-sm text-white/70 group-hover:text-white transition-colors">
                      {session.user.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="hidden sm:flex items-center gap-1 text-xs text-white/40 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-3 w-3" />
                    Exit
                  </button>
                </div>
              ) : (
                <a
                  href="/api/auth/steam"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <img src="https://steamcommunity.com/favicon.ico" alt="" className="h-4 w-4" />
                  Sign in via Steam
                </a>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-white/60 hover:text-white"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/10 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-purple-600/20 to-cyan-500/20 text-white border border-white/10"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                      <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                    </Link>
                  )
                })}
                {session?.user && (
                  <button
                    onClick={() => { signOut(); setMobileOpen(false) }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
