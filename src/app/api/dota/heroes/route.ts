import { NextResponse } from "next/server"
import { fetchHeroes } from "@/lib/dota-api"

export const revalidate = 3600

export async function GET() {
  try {
    const heroes = await fetchHeroes()
    return NextResponse.json(heroes)
  } catch {
    return NextResponse.json({ error: "Failed to fetch heroes" }, { status: 500 })
  }
}
