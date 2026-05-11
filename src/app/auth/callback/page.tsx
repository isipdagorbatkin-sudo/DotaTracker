"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const steamId = searchParams.get("steamId")
    const name = searchParams.get("name")
    const avatar = searchParams.get("avatar")

    if (!steamId) {
      router.replace("/?error=invalid_callback")
      return
    }

    signIn("steam", {
      steamId,
      name: name || "",
      avatar: avatar || "",
      redirect: false,
    }).then((result) => {
      if (result?.error) {
        setError(`Sign-in failed: ${result.error}`)
      } else {
        router.push("/dashboard")
      }
    })
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <a href="/" className="text-purple-400 hover:underline">Go back</a>
        </div>
      </div>
    )
  }

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