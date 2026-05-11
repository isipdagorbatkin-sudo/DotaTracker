import { NextResponse } from "next/server"
import { getMatchHistory } from "@/lib/steam-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const steamId = searchParams.get("steamId")
  const count = Math.min(Number(searchParams.get("count")) || 50, 100)

  if (!steamId) {
    return NextResponse.json({ error: "steamId required" }, { status: 400 })
  }

  const matches = await getMatchHistory(steamId, count)
  return NextResponse.json({ matches })
}
