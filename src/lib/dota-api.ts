const OPEN_DOTA_BASE = "https://api.opendota.com/api"

const DOTA_PATCH = "7.41c"

const POSITION_ROLES = {
  pos1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124],
  pos2: [],
  pos3: [],
  pos4: [],
  pos5: [],
}

const HERO_ATTRIBUTES: Record<number, { primaryAttr: string; attackType: string; roles: string[] }> = {}

export interface DotaHero {
  id: number
  name: string
  localized_name: string
  primary_attr: string
  attack_type: string
  roles: string[]
  legs: number
  img?: string
  icon?: string
}

export interface HeroWinrate {
  hero_id: number
  win_rate: number
  pick_rate: number
  ban_rate: number
  match_count: number
}

export interface ItemBuild {
  items: string[]
  skills: string[]
  talents: string[]
  explanation: string
}

export interface DraftAnalysis {
  heroId: number
  heroName: string
  score: number
  reasons: string[]
  winrate: number
  synergyScore: number
  counterScore: number
}

let heroesCache: DotaHero[] | null = null

export async function fetchHeroes(): Promise<DotaHero[]> {
  if (heroesCache) return heroesCache

  const res = await fetch(`${OPEN_DOTA_BASE}/heroes`)
  if (!res.ok) throw new Error("Failed to fetch heroes")
  heroesCache = await res.json()
  return heroesCache!
}

export async function fetchHeroStats(): Promise<any[]> {
  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 20000)
  const res = await fetch(`${OPEN_DOTA_BASE}/heroStats`, { signal: ac.signal })
  clearTimeout(timeout)
  if (!res.ok) throw new Error("Failed to fetch hero stats")
  return res.json()
}

export async function fetchProMatches(): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/proMatches`)
  if (!res.ok) throw new Error("Failed to fetch pro matches")
  return res.json()
}

export async function fetchProPlayers(): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/proPlayers`)
  if (!res.ok) throw new Error("Failed to fetch pro players")
  return res.json()
}

export async function fetchPlayerMatches(steamId: string): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/players/${steamId}/matches?limit=100`)
  if (!res.ok) throw new Error("Failed to fetch player matches")
  return res.json()
}

export async function fetchPlayer(steamId: string): Promise<any> {
  const res = await fetch(`${OPEN_DOTA_BASE}/players/${steamId}`)
  if (!res.ok) throw new Error("Failed to fetch player data")
  return res.json()
}

export async function fetchPlayerWinLoss(steamId: string): Promise<any> {
  const res = await fetch(`${OPEN_DOTA_BASE}/players/${steamId}/wl`)
  if (!res.ok) throw new Error("Failed to fetch win/loss data")
  return res.json()
}

export async function fetchPlayerHeroes(steamId: string): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/players/${steamId}/heroes`)
  if (!res.ok) throw new Error("Failed to fetch player heroes")
  return res.json()
}

export async function fetchPlayerRecentMatches(steamId: string): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/players/${steamId}/recentMatches`)
  if (!res.ok) throw new Error("Failed to fetch recent matches")
  return res.json()
}

export async function fetchMatchDetails(matchId: number): Promise<any> {
  const res = await fetch(`${OPEN_DOTA_BASE}/matches/${matchId}`)
  if (!res.ok) throw new Error("Failed to fetch match details")
  return res.json()
}

export async function fetchHeroMatchups(heroId: number): Promise<any[]> {
  const res = await fetch(`${OPEN_DOTA_BASE}/heroes/${heroId}/matchups`)
  if (!res.ok) throw new Error("Failed to fetch hero matchups")
  return res.json()
}

export async function fetchHeroItemPopularity(heroId: number): Promise<any> {
  const res = await fetch(`${OPEN_DOTA_BASE}/heroes/${heroId}/itemPopularity`)
  if (!res.ok) throw new Error("Failed to fetch item popularity")
  return res.json()
}

export function getPositionForHero(hero: DotaHero): string[] {
  const positions: string[] = []
  if (hero.roles.includes("Carry") || hero.roles.includes("Escape")) positions.push("pos1")
  if (hero.roles.includes("Nuker") || hero.roles.includes("Disabler")) positions.push("pos2")
  if (hero.roles.includes("Initiator") || hero.roles.includes("Durable") || hero.roles.includes("Escape")) positions.push("pos3")
  if (hero.roles.includes("Support") || hero.roles.includes("Disabler")) positions.push("pos4")
  if (hero.roles.includes("Support") && !hero.roles.includes("Escape")) positions.push("pos5")

  if (positions.length === 0) {
    positions.push("pos3")
  }

  return positions
}

export function getItemsForPosition(heroId: number, position: string): string[] {
  const itemPools: Record<string, string[]> = {
    pos1: ["Power Treads", "Black King Bar", "Satanic", "Butterfly", "Monkey King Bar", "Daedalus", "Skull Basher", "Abyssal Blade", "Manta Style", "Battle Fury", "Armlet of Mordiggian", "Sange and Yasha", "Eye of Skadi", "Crystalys", "Desolator", "Mask of Madness", "Mjollnir", "Scythe of Vyse"],
    pos2: ["Power Treads", "Black King Bar", "Aghanim's Scepter", "Aghanim's Shard", "Blink Dagger", "Eul's Scepter of Divinity", "Scythe of Vyse", "Orchid Malevolence", "Bloodthorn", "Dagon", "Kaya and Sange", "Yasha and Kaya", "Linken's Sphere", "Ethereal Blade"],
    pos3: ["Phase Boots", "Black King Bar", "Blink Dagger", "Blade Mail", "Pipe of Insight", "Crimson Guard", "Assault Cuirass", "Shiva's Guard", "Heart of Tarrasque", "Vanguard", "Soul Ring", "Lotus Orb", "Overwhelming Blink"],
    pos4: ["Arcane Boots", "Aether Lens", "Blink Dagger", "Force Staff", "Glimmer Cape", "Aghanim's Scepter", "Aghanim's Shard", "Eul's Scepter of Divinity", "Scythe of Vyse", "Lotus Orb", "Spirit Vessel", "Solar Crest", "Guardian Greaves"],
    pos5: ["Arcane Boots", "Mekansm", "Force Staff", "Glimmer Cape", "Guardian Greaves", "Holy Locket", "Aeon Disk", "Ghost Scepter", "Eternal Shroud", "Lotus Orb", "Solar Crest", "Pipe of Insight"],
  }

  return itemPools[position] || itemPools.pos1
}

const memePunishments = [
  "Mask of Madness on Crystal Maiden",
  "Divine Rapier first item",
  "Battle Fury on Tidehunter",
  "Dagon on Wraith King",
  "Radiance on Pudge",
  "Shadow Blade on Bristleback",
  "Aghanim's Scepter on Ogre Magi (you already have it)",
  "Manta Style on Sven",
  "Monkey King Bar on Zeus",
  "Boots of Travel first item (no other items)",
  "Crimson Guard on Sniper",
  "Pipe of Insight on Anti-Mage",
  "Heart of Tarrasque on Pugna",
  "Ethereal Blade on Wraith King",
  "Orchid Malevolence on Tidehunter",
  "Satanic on Crystal Maiden",
  "Butterfly on Pudge",
  "Mjollnir on Techies",
  "Scythe of Vyse on Phantom Assassin",
  "Armlet of Mordiggian on Sniper",
  "Vanguard on Shadow Fiend",
  "Soul Booster on Wraith King (just the booster)",
  "Hand of Midas at minute 40",
  "Refresher Orb on Meepo",
  "Abyssal Blade on Zeus",
  "Blink Dagger on Spirit Breaker (you already have charge)",
  "Dust of Appearance (just dust, nothing else)",
  "Slippers of Agility (1 stack, no upgrade)",
  "Divine Rapier on Techies (go suicide)",
  "Aeon Disk on Phantom Assassin",
  "Veil of Discord on Juggernaut",
  "Meteor Hammer on Anti-Mage",
  "Battle Fury onTechies",
  "Yasha on Bristleback (no upgrade)",
  "Kaya on Wraith King",
  "Sange on Sniper",
  "Echo Sabre on Zeus",
  "Moon Shard on Crystal Maiden (consume it)",
  "Octarine Core on Phantom Assassin",
  "Assault Cuirass on Shadow Fiend",
  "Drum of Endurance on Medusa",
  "Bottle on Sniper",
  "Soul Ring on Anti-Mage",
  "Urn of Shadows on Phantom Assassin",
  "Headdress on Zeus",
  "Bracer (7 of them)",
  "Null Talisman (7 of them)",
  "Wraith Band (7 of them)",
  "Satanic on Techies",
  "Necronomicon (buy it and cry it's removed)",
  "Tranquil Boots on Anti-Mage",
  "Phase Boots on Crystal Maiden",
]

export function getRandomPunishment(): string {
  return memePunishments[Math.floor(Math.random() * memePunishments.length)]
}

export function getRandomBuild(position: string): ItemBuild {
  const skillBuilds: Record<string, string[]> = {
    pos1: ["1-3-1-3-1-4-1-3-3-2-4-2-2-2-4"],
    pos2: ["2-1-2-1-2-4-2-1-1-3-4-3-3-3-4"],
    pos3: ["3-2-3-1-3-4-3-2-2-1-4-1-1-2-4"],
    pos4: ["1-2-3-1-1-4-1-3-2-3-4-2-2-3-4"],
    pos5: ["1-3-2-1-1-4-1-2-2-3-4-3-3-2-4"],
  }

  const talents = [
    "+10 Strength / +10 Agility",
    "+15 Attack Speed / +15 Damage",
    "+20 Movement Speed / +20 Attack Speed",
    "+25 Damage / +25 Health Regen",
    "+30 Attack Speed / +30 Gold/Min",
    "+35 Damage / +35 Movement Speed",
    "+40 Health Regen / +40 Damage",
    "+50 Gold/Min / +50 Attack Speed",
    "+60 Damage / +60 Health Regen",
    "+70 Gold/Min / +70 Damage",
  ]

  const starterItems: Record<string, string[]> = {
    pos1: ["Quelling Blade", "Tango", "Healing Salve", "Slippers of Agility", "Branch"],
    pos2: ["Null Talisman", "Tango", "Healing Salve", "Clarity", "Branch"],
    pos3: ["Quelling Blade", "Tango", "Healing Salve", "Gauntlets of Strength", "Branch"],
    pos4: ["Observer Ward", "Sentry Ward", "Tango", "Clarity", "Blood Grenade", "Branch"],
    pos5: ["Observer Ward", "Sentry Ward", "Tango", "Healing Salve", "Clarity", "Blood Grenade"],
  }

  const neutralItems = [
    "Trusty Shovel", "Broom Handle", "Dragon Scale", "Fairy's Trinket",
    "Vambrace", "Grove Bow", "Elven Tunic", "Ceremonial Robe",
    "Paladin Sword", "Dandelion Amulet", "Telescope", "Fae-grenade",
    "Glimmering Amulet", "Psychic Band", "Dagger of Ristul", "Spider Legs",
    "Timeless Relic", "Mirror Shield", "Minotaur Horn", "Pig Pole",
  ]

  const coreItems = getItemsForPosition(123, position)
  const shuffledCore = [...coreItems].sort(() => Math.random() - 0.5)
  const randomNeutral = neutralItems[Math.floor(Math.random() * neutralItems.length)]

  return {
    items: [
      ...starterItems[position] || starterItems.pos1,
      shuffledCore.slice(0, 6).join(", "),
      `Neutral: ${randomNeutral}`,
    ],
    skills: (skillBuilds[position] || skillBuilds.pos1),
    talents: [talents[Math.floor(Math.random() * talents.length)]],
    explanation: `Optimized ${position} build based on current meta and item efficiency. Focus on early game dominance with smart itemization.`,
  }
}

export async function getHeroWinrate(heroId: number): Promise<number> {
  try {
    const stats = await fetchHeroStats()
    const hero = stats.find((h: any) => h.id === heroId)
    if (hero && hero.pro_win && hero.pro_pick) {
      return (hero.pro_win / hero.pro_pick) * 100
    }
    return 50
  } catch {
    return 50
  }
}

export async function analyzeDraft(
  role: string,
  allyHeroes: number[],
  enemyHeroes: number[]
): Promise<DraftAnalysis[]> {
  try {
    const heroes = await fetchHeroes()
    const allHeroes = await fetchHeroStats()

    const usedHeroes = new Set([...allyHeroes, ...enemyHeroes])
    const available = heroes.filter((h: DotaHero) => !usedHeroes.has(h.id))

    const analyzed = await Promise.all(
      available.slice(0, 30).map(async (hero: DotaHero) => {
        let score = 50
        const reasons: string[] = []
        let synergyScore = 0
        let counterScore = 0

        const heroStats = allHeroes.find((h: any) => h.id === hero.id)
        const winrate = heroStats ? ((heroStats.pro_win || 0) / Math.max(heroStats.pro_pick || 1, 1)) * 100 : 50

        try {
          const matchups = await fetchHeroMatchups(hero.id)

          for (const enemyId of enemyHeroes) {
            const vsMatchup = matchups.find((m: any) => m.hero_id === enemyId)
            if (vsMatchup) {
              const vsWinrate = vsMatchup.wins / Math.max(vsMatchup.games_played, 1) * 100
              if (vsWinrate > 50) {
                counterScore += 10
                const enemyHero = heroes.find((h: DotaHero) => h.id === enemyId)
                reasons.push(`Strong against ${enemyHero?.localized_name || `Hero ${enemyId}`} (${vsWinrate.toFixed(0)}% WR)`)
              }
            }
          }

          for (const allyId of allyHeroes) {
            const vsAlly = matchups.find((m: any) => m.hero_id === allyId)
            if (vsAlly) {
              const allyWinrate = vsAlly.wins / Math.max(vsAlly.games_played, 1) * 100
              if (allyWinrate > 50) {
                synergyScore += 10
                const allyHero = heroes.find((h: DotaHero) => h.id === allyId)
                reasons.push(`Great synergy with ${allyHero?.localized_name || `Hero ${allyId}`}`)
              }
            }
          }
        } catch {
          // fallback analysis without matchup data
        }

        const roleCheck = getPositionForRole(hero, role)
        if (roleCheck) {
          score += 20
          reasons.push(roleCheck)
        }

        if (hero.roles.includes("Disabler")) {
          const enemyDisablers = enemyHeroes.filter(id => {
            const h = heroes.find((hh: DotaHero) => hh.id === id)
            return h?.roles.includes("Disabler")
          }).length
          if (enemyDisablers < 2) {
            score += 10
            reasons.push("Fills missing disables in your draft")
          }
        }

        if (hero.roles.includes("Initiator")) {
          score += 5
          reasons.push("Strong initiation potential")
        }

        if (winrate > 52) {
          score += 10
          reasons.push(`High winrate hero (${winrate.toFixed(0)}%)`)
        }

        const totalScore = Math.round(score + (counterScore - synergyScore) * 0.5)

        return {
          heroId: hero.id,
          heroName: hero.localized_name,
          score: Math.max(0, Math.min(100, totalScore)),
          reasons: reasons.slice(0, 4),
          winrate,
          synergyScore,
          counterScore,
        }
      })
    )

    return analyzed.sort((a, b) => b.score - a.score).slice(0, 10)
  } catch (error) {
    console.error("Draft analysis error:", error)
    return []
  }
}

function getPositionForRole(hero: DotaHero, role: string): string | null {
  switch (role) {
    case "pos1":
      if (hero.roles.includes("Carry")) return "Excellent carry potential"
      break
    case "pos2":
      if (hero.roles.includes("Nuker")) return "Strong mid presence"
      break
    case "pos3":
      if (hero.roles.includes("Durable") || hero.roles.includes("Initiator")) return "Great offlane candidate"
      break
    case "pos4":
      if (hero.roles.includes("Support") && hero.roles.includes("Disabler")) return "Perfect soft support with control"
      break
    case "pos5":
      if (hero.roles.includes("Support")) return "Reliable hard support"
      break
  }
  return null
}

export function getCurrentPatch(): string {
  return DOTA_PATCH
}
