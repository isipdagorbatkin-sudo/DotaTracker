import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "premium" | "outline"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-purple-500/20 text-purple-300 border border-purple-500/30": variant === "default",
          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30": variant === "success",
          "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30": variant === "warning",
          "bg-red-500/20 text-red-300 border border-red-500/30": variant === "danger",
          "bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-transparent bg-clip-text border border-purple-500/30": variant === "premium",
          "border border-white/10 text-white/70": variant === "outline",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
