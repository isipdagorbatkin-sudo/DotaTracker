import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMMR(mmr: number): string {
  const sign = mmr >= 0 ? "+" : ""
  return `${sign}${mmr.toLocaleString()}`
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function getKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return `${kills}/${deaths}/${assists} (PERFECT)`
  const ratio = ((kills + assists) / deaths).toFixed(2)
  return `${kills}/${deaths}/${assists} (${ratio})`
}

export function getWinRateColor(rate: number): string {
  if (rate >= 60) return "text-emerald-400"
  if (rate >= 50) return "text-yellow-400"
  return "text-red-400"
}

export function getWinRateBg(rate: number): string {
  if (rate >= 60) return "bg-emerald-500/20 border-emerald-500/30"
  if (rate >= 50) return "bg-yellow-500/20 border-yellow-500/30"
  return "bg-red-500/20 border-red-500/30"
}
