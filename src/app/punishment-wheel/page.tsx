"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CircleDot, RefreshCw, Sparkles, Skull, Swords, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRandomPunishment } from "@/lib/dota-api"
import { cn } from "@/lib/utils"

const SEGMENTS = [
  { label: "Cursed", full: "Cursed Build", color: "#FFD700" },
  { label: "Bad Items", full: "Bad Items", color: "#A855F7" },
  { label: "Wrong Role", full: "Wrong Role", color: "#EC4899" },
  { label: "Meme Pick", full: "Meme Pick", color: "#06B6D4" },
  { label: "Forbidden", full: "Forbidden Tech", color: "#F97316" },
  { label: "Tilt Mode", full: "Tilt Mode", color: "#10B981" },
  { label: "Chaos", full: "Chaos Build", color: "#EF4444" },
  { label: "Pure Pain", full: "Pure Pain", color: "#3B82F6" },
]

const CONFETTI_COLORS = ["#FFD700", "#A855F7", "#EC4899", "#06B6D4", "#F97316", "#10B981", "#EF4444", "#3B82F6"]

const SEGMENT_ANGLE = 45

const gradientSegments = SEGMENTS.map((s, i) => {
  const start = i * SEGMENT_ANGLE
  const end = start + SEGMENT_ANGLE - 0.5
  return `${s.color} ${start}deg ${end}deg, rgba(0,0,0,0.4) ${end}deg ${end + 0.5}deg`
}).join(", ")

export default function PunishmentWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [confettiKey, setConfettiKey] = useState(0)

  const resultRef = useRef<string | null>(null)
  const categoryRef = useRef<string | null>(null)
  const spinningRef = useRef(false)

  const confettiPieces = useMemo(() => {
    if (!showResult) return []
    return Array.from({ length: 40 }, (_, i) => ({
      id: `confetti-${confettiKey}-${i}`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.5 + Math.random() * 2,
      size: 3 + Math.random() * 7,
      rotation: Math.random() * 360,
      isCircle: Math.random() > 0.5,
    }))
  }, [confettiKey, showResult])

  const spin = useCallback(() => {
    if (spinningRef.current) return
    spinningRef.current = true
    setSpinning(true)
    setShowResult(false)
    setResult(null)
    setSelectedCategory(null)
    setConfettiKey((k) => k + 1)

    const punishment = getRandomPunishment()
    const segIndex = Math.floor(Math.random() * SEGMENTS.length)
    const category = SEGMENTS[segIndex].full

    const spins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = segIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2
    const finalRotation = rotation + spins * 360 + (360 - targetAngle)

    resultRef.current = punishment
    categoryRef.current = category
    setRotation(finalRotation)
  }, [rotation])

  const handleSpinComplete = useCallback(() => {
    spinningRef.current = false
    setSpinning(false)
    setShowResult(true)
    setResult(resultRef.current)
    setSelectedCategory(categoryRef.current)
    if (resultRef.current) {
      setHistory((prev) => [resultRef.current!, ...prev].slice(0, 20))
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-pink-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px] pointer-events-none" />

      {showResult && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.left}%`,
                top: "-5%",
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                borderRadius: p.isCircle ? "50%" : "2px",
                transform: `rotate(${p.rotation}deg)`,
                animation: `punishment-confetti ${p.duration}s ${p.delay}s ease-out forwards`,
                opacity: 0,
                boxShadow: `0 0 6px ${p.color}60`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
            <Badge variant="premium" className="px-3 py-1">
              <CircleDot className="h-3 w-3 mr-1" />
              Punishment Wheel
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Spin to Find Your Cursed Build
          </h1>
          <p className="text-white/50 text-base sm:text-lg">
            Let fate decide your suffering in the next game
          </p>
        </motion.div>

        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 blur-3xl scale-110" />

            <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-pink-500/40 to-amber-500/40 p-[3px] shadow-2xl shadow-purple-500/20">
                <div className="w-full h-full rounded-full bg-[#0a0a0f] p-[3px]">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-white/5 to-white/[0.02] relative overflow-hidden">
                    <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 z-20">
                      <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[22px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]" />
                    </div>

                    <motion.div
                      className="w-full h-full rounded-full"
                      style={{ background: `conic-gradient(${gradientSegments})` }}
                      animate={{ rotate: spinning || showResult || rotation !== 0 ? rotation : 0 }}
                      transition={{
                        duration: 4,
                        ease: [0.15, 0.85, 0.35, 1],
                      }}
                      onAnimationComplete={handleSpinComplete}
                    >
                      {SEGMENTS.map((seg, i) => {
                        const angleRad = ((i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2) * Math.PI) / 180
                        const r = 84
                        const x = Math.cos(angleRad) * r
                        const y = Math.sin(angleRad) * r
                        return (
                          <div
                            key={i}
                            className="absolute"
                            style={{
                              left: `calc(50% + ${x}px)`,
                              top: `calc(50% + ${y}px)`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <span className="block text-[10px] sm:text-[11px] leading-tight font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wider uppercase text-center">
                              {seg.label}
                            </span>
                          </div>
                        )
                      })}
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20 flex items-center justify-center z-10">
                      <Swords className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="premium"
              size="lg"
              onClick={spin}
              disabled={spinning}
              className="min-w-[200px] text-base shadow-xl shadow-purple-500/20"
            >
              {spinning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <CircleDot className="h-4 w-4" />
                  Spin the Wheel
                </>
              )}
            </Button>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {showResult && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="mb-10 sm:mb-12"
            >
              <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-purple-500/5 to-pink-500/10 shadow-[0_0_50px_rgba(255,215,0,0.12)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-pink-500/5 animate-pulse-glow" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />

                <CardContent className="p-6 sm:p-8 relative">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                      className="inline-flex items-center gap-2 mb-4"
                    >
                      <Badge variant="premium" className="text-sm px-4 py-1.5">
                        <Skull className="h-4 w-4 mr-1" />
                        {selectedCategory}
                      </Badge>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-xl sm:text-2xl font-bold text-white/80 mb-4"
                    >
                      Your Punishment
                    </motion.h2>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                      className="inline-block mb-6 sm:mb-8"
                    >
                      <span className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 py-4 px-5 sm:px-8 rounded-xl bg-white/[0.04] border border-white/10 inline-block">
                        {result}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <Button
                        variant="premium"
                        size="lg"
                        onClick={spin}
                        disabled={spinning}
                        className="shadow-xl shadow-purple-500/20"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Spin Again
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Skull className="h-5 w-5 text-red-400" />
                    Punishment History
                    <Badge variant="danger" className="ml-2">
                      {history.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {history.map((item, i) => (
                      <motion.div
                        key={`${item}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group"
                      >
                        <span className="text-xs font-mono text-white/20 w-6 text-right shrink-0 group-hover:text-white/40 transition-colors">
                          #{i + 1}
                        </span>
                        <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                          {item}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes punishment-confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
