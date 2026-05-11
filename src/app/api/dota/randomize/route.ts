import { NextResponse } from "next/server"
import { fetchHeroes, getPositionForHero, getRandomBuild, getHeroWinrate } from "@/lib/dota-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get("position") || "pos1"

  try {
    const heroes = await fetchHeroes()
    const filtered = heroes.filter((h) => getPositionForHero(h).includes(position))

    if (filtered.length === 0) {
      return NextResponse.json({ error: "No heroes found for this position" }, { status: 404 })
    }

    const hero = filtered[Math.floor(Math.random() * filtered.length)]
    const winrate = await getHeroWinrate(hero.id)
    const build = getRandomBuild(position)

    const itemsByPosition: Record<string, string[]> = {
      pos1: ["Power Treads", "Black King Bar", "Satanic", "Butterfly", "Daedalus", "Abyssal Blade"],
      pos2: ["Power Treads", "Black King Bar", "Aghanim's Scepter", "Blink Dagger", "Scythe of Vyse", "Orchid Malevolence"],
      pos3: ["Phase Boots", "Black King Bar", "Blink Dagger", "Blade Mail", "Pipe of Insight", "Assault Cuirass"],
      pos4: ["Arcane Boots", "Aether Lens", "Blink Dagger", "Force Staff", "Glimmer Cape", "Aghanim's Scepter"],
      pos5: ["Arcane Boots", "Mekansm", "Force Staff", "Glimmer Cape", "Guardian Greaves", "Holy Locket"],
    }

    return NextResponse.json({
      hero,
      winrate: Math.round(winrate * 10) / 10,
      build: build || { items: itemsByPosition[position] || itemsByPosition.pos1 },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to randomize" }, { status: 500 })
  }
}
