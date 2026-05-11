"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const steamId = searchParams.get("steamId")
    const name = searchParams.get("name")
    const avatar = searchParams.get("avatar")

    if (!steamId) {
      router.replace("/?error=invalid_callback")
      return
    }

    signIn("credentials", {
      steamId,
      name: name || "",
      avatar: avatar || "",
      redirectTo: "/dashboard",
    })
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}