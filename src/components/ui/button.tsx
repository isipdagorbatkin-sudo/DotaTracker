import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium"
    size?: "default" | "sm" | "lg" | "icon"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        {
          "bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]": variant === "default",
          "bg-red-500/90 text-white hover:bg-red-500 active:scale-[0.98]": variant === "destructive",
          "border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 active:scale-[0.98]": variant === "outline",
          "bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]": variant === "secondary",
          "text-white/70 hover:text-white hover:bg-white/5 active:scale-[0.98]": variant === "ghost",
          "text-purple-400 underline-offset-4 hover:underline": variant === "link",
          "bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] border-0": variant === "premium",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-md px-3 text-xs": size === "sm",
          "h-12 px-8 text-base": size === "lg",
          "h-10 w-10": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
