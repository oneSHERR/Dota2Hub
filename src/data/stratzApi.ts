// ========== STRATZ API SERVICE ==========
// Подключение к STRATZ GraphQL API для получения актуальных данных
// ВАЖНО: вставьте свой STRATZ API токен в STRATZ_TOKEN ниже

const STRATZ_TOKEN = 'YOUR_STRATZ_TOKEN_HERE'; // ← ЗАМЕНИ НА СВОЙ ТОКЕН
const STRATZ_API = 'https://api.stratz.com/graphiql';

interface StratzHeroStat {
  heroId: number;
  winRate: number;
  pickRate: number;
  banRate: number;
  matchCount: number;
}

interface StratzAbility {
  id: number;
  name: string;
  language: {
    displayName: string;
    description: string;
  };
  uri: string;
}

// Fetch hero stats from STRATZ
export async function fetchStratzHeroStats(): Promise<StratzHeroStat[] | null> {
  const query = `{
    heroStats {
      winWeek(gameModeIds: [ALL_PICK_RANKED], bracketIds: [IMMORTAL, DIVINE, ANCIENT]) {
        heroId
        winCount
        matchCount
      }
    }
  }`;

  try {
    const res = await fetch(STRATZ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRATZ_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`STRATZ API: ${res.status}`);
    const data = await res.json();
    const stats = data?.data?.heroStats?.winWeek;
    if (!stats) return null;

    return stats.map((s: any) => ({
      heroId: s.heroId,
      winRate: s.matchCount > 0 ? Math.round((s.winCount / s.matchCount) * 1000) / 10 : 50,
      pickRate: 0, // Will be calculated from matchCount
      banRate: 0,
      matchCount: s.matchCount,
    }));
  } catch (err) {
    console.error('STRATZ fetch error:', err);
    return null;
  }
}

// Fetch hero abilities from STRATZ
export async function fetchStratzAbilities(heroId: number): Promise<any | null> {
  const query = `{
    constants {
      hero(id: ${heroId}) {
        id
        displayName
        abilities {
          ability {
            id
            name
            language {
              displayName
              description
            }
            stat {
              manaCost
              cooldown
            }
            uri
          }
        }
      }
    }
  }`;

  try {
    const res = await fetch(STRATZ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRATZ_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`STRATZ API: ${res.status}`);
    const data = await res.json();
    return data?.data?.constants?.hero || null;
  } catch (err) {
    console.error('STRATZ abilities error:', err);
    return null;
  }
}

// Check if STRATZ token is configured
export function isStratzConfigured(): boolean {
  return STRATZ_TOKEN !== 'YOUR_STRATZ_TOKEN_HERE' && STRATZ_TOKEN.length > 20;
}

// Cache helpers
const CACHE_KEY = 'stratz_hero_stats';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export function getCachedStats(): StratzHeroStat[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

export function setCachedStats(data: StratzHeroStat[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}
