import { NextResponse } from "next/server"
import { getMatchDetails } from "@/lib/steam-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get("matchId")

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 })
  }

  const details = await getMatchDetails(Number(matchId))
  if (!details) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 })
  }

  return NextResponse.json(details)
}
