import { NextResponse } from "next/server"
import { fetchHeroes, analyzeDraft } from "@/lib/dota-api"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, allyHeroes, enemyHeroes } = body as {
      role: string
      allyHeroes: number[]
      enemyHeroes: number[]
    }

    if (!role || !allyHeroes || !enemyHeroes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const results = await analyzeDraft(role, allyHeroes, enemyHeroes)
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze draft" }, { status: 500 })
  }
}
