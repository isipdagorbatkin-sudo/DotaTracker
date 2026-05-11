import { NextResponse } from "next/server"
import { getPlayerSummary, resolveVanityUrl } from "@/lib/steam-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let steamId = searchParams.get("steamId")
  const vanity = searchParams.get("vanity")

  if (!steamId && vanity) {
    steamId = await resolveVanityUrl(vanity)
  }

  if (!steamId) {
    return NextResponse.json({ error: "steamId or vanity required" }, { status: 400 })
  }

  const player = await getPlayerSummary(steamId)
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 })
  }

  return NextResponse.json(player)
}
