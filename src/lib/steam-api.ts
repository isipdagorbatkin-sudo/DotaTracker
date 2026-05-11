const STEAM_BASE = "https://api.steampowered.com"
const DOTA2_APP_ID = 570

function getKey(): string {
  const key = process.env.STEAM_API_KEY
  if (!key) throw new Error("STEAM_API_KEY not set")
  return key
}

export interface SteamPlayerSummary {
  steamid: string
  personaname: string
  avatarfull: string
  avatarmedium: string
  profileurl: string
  loccountrycode?: string
}

export interface SteamMatchPlayer {
  account_id: number
  player_slot: number
  hero_id: number
  kills: number
  deaths: number
  assists: number
  leaver_status: number
  last_hits: number
  denies: number
  gold_per_min: number
  xp_per_min: number
  level: number
  hero_damage: number
  tower_damage: number
  hero_healing: number
  gold: number
  gold_spent: number
  scaled_hero_damage?: number
  scaled_tower_damage?: number
  scaled_hero_healing?: number
  rank_tier?: number
  item_0?: number
  item_1?: number
  item_2?: number
  item_3?: number
  item_4?: number
  item_5?: number
  backpack_0?: number
  backpack_1?: number
  backpack_2?: number
}

export interface SteamMatch {
  match_id: number
  match_seq_num: number
  start_time: number
  lobby_type: number
  game_mode: number
  radiant_win: boolean
  duration: number
  players: SteamMatchPlayer[]
}

export interface SteamMatchHistoryItem {
  match_id: number
  match_seq_num: number
  start_time: number
  lobby_type: number
  game_mode?: number
  radiant_win?: boolean
  duration?: number
  players?: {
    account_id: number
    player_slot: number
    hero_id: number
    kills: number
    deaths: number
    assists: number
    leaver_status: number
    last_hits: number
    denies: number
    gold_per_min: number
    xp_per_min: number
    level: number
    hero_damage: number
    tower_damage: number
    hero_healing: number
  }[]
}

export function formatRankTier(rankTier: number): { label: string; star: number; number: number } {
  if (!rankTier || rankTier === 0) return { label: "Uncalibrated", star: 0, number: 0 }
  const tier = Math.floor(rankTier / 10)
  const star = rankTier % 10
  const medals = ["", "Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"]
  const label = tier >= 1 && tier <= 8 ? medals[tier] : "Unknown"
  return { label, star, number: rankTier }
}

export function getPlayerSlot(accountId: number, playerSlot: number): "radiant" | "dire" {
  return playerSlot < 128 ? "radiant" : "dire"
}

export function getTeamPlayers(players: SteamMatchPlayer[], targetAccountId: number): SteamMatchPlayer {
  return players.find(p => p.account_id === targetAccountId)!
}

export function didPlayerWin(match: SteamMatch, accountId: number): boolean {
  const player = getTeamPlayers(match.players, accountId)
  if (!player) return false
  const isRadiant = player.player_slot < 128
  return isRadiant ? match.radiant_win : !match.radiant_win
}

export async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${STEAM_BASE}/ISteamUser/ResolveVanityURL/v1/?key=${getKey()}&vanityurl=${encodeURIComponent(vanityUrl)}`,
      { next: { revalidate: 300 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.response?.success === 1 ? data.response.steamid : null
  } catch {
    return null
  }
}

export async function getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
  try {
    const res = await fetch(
      `${STEAM_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${getKey()}&steamids=${steamId}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.response?.players?.[0] || null
  } catch {
    return null
  }
}

export async function getMatchHistory(steamId: string, count = 50): Promise<SteamMatchHistoryItem[]> {
  const accountId = convertSteamIdToAccountId(steamId)
  try {
    const res = await fetch(
      `${STEAM_BASE}/IDOTA2Match_570/GetMatchHistory/v1/?key=${getKey()}&account_id=${accountId}&matches_requested=${count}`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.result?.matches || []
  } catch {
    return []
  }
}

export async function getMatchDetails(matchId: number): Promise<SteamMatch | null> {
  try {
    const res = await fetch(
      `${STEAM_BASE}/IDOTA2Match_570/GetMatchDetails/v1/?key=${getKey()}&match_id=${matchId}`,
      { next: { revalidate: 300 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.result || null
  } catch {
    return null
  }
}

export function convertSteamIdToAccountId(steamId: string): number {
  // STEAM_0:0:123456 or 76561197960265728 format
  if (steamId.startsWith("7656")) {
    return Number((BigInt(steamId) - BigInt("76561197960265728")) & BigInt("0xFFFFFFFF"))
  }
  return Number(steamId)
}

export function convertAccountIdToSteamId(accountId: number): string {
  return String(BigInt(accountId) + BigInt("76561197960265728"))
}
