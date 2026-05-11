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
      { signal: AbortSignal.timeout(5000), next: { revalidate: 300 } },
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.result) return data.result
    }
  } catch {
    // Steam API failed, try OpenDota below
  }

  try {
    const odRes = await fetch(
      `https://api.opendota.com/api/matches/${matchId}`,
      { signal: AbortSignal.timeout(8000), next: { revalidate: 300 } },
    )
    if (!odRes.ok) return null
    const odData = await odRes.json()
    if (!odData?.players) return null
    return {
      match_id: odData.match_id,
      match_seq_num: odData.match_seq_num || 0,
      start_time: odData.start_time,
      lobby_type: odData.lobby_type,
      game_mode: odData.game_mode,
      radiant_win: odData.radiant_win,
      duration: odData.duration,
      players: odData.players.map((p: any) => ({
        account_id: p.account_id || 0,
        player_slot: p.player_slot,
        hero_id: p.hero_id,
        kills: p.kills || 0,
        deaths: p.deaths || 0,
        assists: p.assists || 0,
        leaver_status: p.leaver_status || 0,
        last_hits: p.last_hits || 0,
        denies: p.denies || 0,
        gold_per_min: p.gold_per_min || 0,
        xp_per_min: p.xp_per_min || 0,
        level: p.level || 0,
        hero_damage: p.hero_damage || 0,
        tower_damage: p.tower_damage || 0,
        hero_healing: p.hero_healing || 0,
        gold: p.gold || 0,
        gold_spent: p.gold_spent || 0,
        rank_tier: p.rank_tier,
        item_0: p.item_0,
        item_1: p.item_1,
        item_2: p.item_2,
        item_3: p.item_3,
        item_4: p.item_4,
        item_5: p.item_5,
        backpack_0: p.backpack_0,
        backpack_1: p.backpack_1,
        backpack_2: p.backpack_2,
      })),
    }
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
