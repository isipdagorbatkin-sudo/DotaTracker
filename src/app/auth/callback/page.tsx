"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Suspense } from "react"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const steamId = searchParams.get("steamId")
    const name = searchParams.get("name") || "Unknown"
    const avatar = searchParams.get("avatar") || ""

    if (!steamId) {
      setError("No Steam ID received")
      return
    }

    signIn("steam", {
      steamId,
      name,
      avatar,
      redirect: false,
    })
      .then((result) => {
        if (result?.error) {
          setError(result.error)
        } else {
          router.push("/dashboard")
        }
      })
      .catch(() => setError("Sign in failed"))
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" />
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
