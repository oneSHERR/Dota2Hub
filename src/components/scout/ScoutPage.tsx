import { useState, useMemo } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Search, Loader2, User, Trophy, Swords, TrendingUp, TrendingDown, Clock, Target, ChevronRight, X, Eye, Shield, Star, BarChart3, ArrowLeft } from 'lucide-react';

// ========== VALVE ATTR ICONS ==========
const ATTR_ICONS: Record<string, string> = {
  str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
  agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
  int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  all: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png',
};
function AttrIcon({ attr, size = 16 }: { attr: string; size?: number }) {
  return <img src={ATTR_ICONS[attr] || ATTR_ICONS.all} alt="" className="inline-block" style={{ width: size, height: size }} />;
}

// ========== RANK ICONS ==========
const RANK_NAMES: Record<number, string> = {
  10: 'Herald', 11: 'Herald', 12: 'Herald', 13: 'Herald', 14: 'Herald', 15: 'Herald',
  20: 'Guardian', 21: 'Guardian', 22: 'Guardian', 23: 'Guardian', 24: 'Guardian', 25: 'Guardian',
  30: 'Crusader', 31: 'Crusader', 32: 'Crusader', 33: 'Crusader', 34: 'Crusader', 35: 'Crusader',
  40: 'Archon', 41: 'Archon', 42: 'Archon', 43: 'Archon', 44: 'Archon', 45: 'Archon',
  50: 'Legend', 51: 'Legend', 52: 'Legend', 53: 'Legend', 54: 'Legend', 55: 'Legend',
  60: 'Ancient', 61: 'Ancient', 62: 'Ancient', 63: 'Ancient', 64: 'Ancient', 65: 'Ancient',
  70: 'Divine', 71: 'Divine', 72: 'Divine', 73: 'Divine', 74: 'Divine', 75: 'Divine',
  80: 'Immortal',
};

function getRankName(tier: number | null): string {
  if (!tier) return 'Неизвестно';
  return RANK_NAMES[tier] || `Rank ${tier}`;
}

function getRankColor(tier: number | null): string {
  if (!tier) return '#64748b';
  const base = Math.floor(tier / 10) * 10;
  const colors: Record<number, string> = {
    10: '#8B8B8B', 20: '#B4C4D9', 30: '#D4A83B', 40: '#45A047',
    50: '#4A90D9', 60: '#9B59B6', 70: '#E74C3C', 80: '#F0C040',
  };
  return colors[base] || '#64748b';
}

// ========== TYPES ==========
interface PlayerProfile {
  account_id: number;
  personaname: string;
  avatarfull: string;
  rank_tier: number | null;
  leaderboard_rank: number | null;
  profile: {
    account_id: number;
    personaname: string;
    avatarfull: string;
    steamid?: string;
  };
  competitive_rank?: number;
  solo_competitive_rank?: number;
  mmr_estimate?: { estimate: number };
}

interface PlayerHeroStat {
  hero_id: number;
  last_played: number;
  games: number;
  win: number;
  with_games: number;
  with_win: number;
  against_games: number;
  against_win: number;
}

interface RecentMatch {
  match_id: number;
  hero_id: number;
  player_slot: number;
  radiant_win: boolean;
  duration: number;
  game_mode: number;
  kills: number;
  deaths: number;
  assists: number;
  start_time: number;
}

interface WinLoss {
  win: number;
  lose: number;
}

interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
  last_match_time?: string;
  similarity?: number;
}

// ========== API ==========
async function searchPlayers(query: string): Promise<SearchResult[]> {
  const res = await fetch(`https://api.opendota.com/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function getProfile(accountId: number): Promise<PlayerProfile> {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}`);
  if (!res.ok) throw new Error('Profile not found');
  return res.json();
}

async function getHeroStats(accountId: number): Promise<PlayerHeroStat[]> {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/heroes`);
  if (!res.ok) throw new Error('Hero stats failed');
  return res.json();
}

async function getRecentMatches(accountId: number): Promise<RecentMatch[]> {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/recentMatches`);
  if (!res.ok) throw new Error('Recent matches failed');
  return res.json();
}

async function getWinLoss(accountId: number): Promise<WinLoss> {
  const res = await fetch(`https://api.opendota.com/api/players/${accountId}/wl`);
  if (!res.ok) throw new Error('WL failed');
  return res.json();
}

// ========== HELPERS ==========
function getHeroById(id: number): Hero | undefined {
  return ALL_HEROES.find(h => h.id === id);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}м назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч назад`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}д назад`;
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU');
}

// ========== COMPONENT ==========
type ViewTab = 'heroes' | 'recent' | 'signature';

export function ScoutPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Player data
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [heroStats, setHeroStats] = useState<PlayerHeroStat[]>([]);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [winLoss, setWinLoss] = useState<WinLoss | null>(null);
  const [tab, setTab] = useState<ViewTab>('heroes');

  // Search
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setSearchResults([]);

    try {
      // Если ввели число — это Steam ID
      const isNumeric = /^\d+$/.test(query.trim());
      if (isNumeric) {
        await loadPlayer(parseInt(query.trim()));
      } else {
        const results = await searchPlayers(query.trim());
        if (results.length === 0) {
          setError('Игрок не найден');
        } else if (results.length === 1) {
          await loadPlayer(results[0].account_id);
        } else {
          setSearchResults(results.slice(0, 10));
        }
      }
    } catch {
      setError('Ошибка поиска. Проверьте подключение.');
    }
    setSearching(false);
  };

  const loadPlayer = async (accountId: number) => {
    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const [prof, heroes, recent, wl] = await Promise.all([
        getProfile(accountId),
        getHeroStats(accountId),
        getRecentMatches(accountId),
        getWinLoss(accountId),
      ]);

      if (!prof.profile?.personaname) {
        setError('Профиль скрыт или не найден');
        setLoading(false);
        return;
      }

      setProfile(prof);
      setHeroStats(heroes);
      setRecentMatches(recent);
      setWinLoss(wl);
      setTab('heroes');
    } catch {
      setError('Не удалось загрузить профиль. Возможно он закрыт.');
    }
    setLoading(false);
  };

  const resetSearch = () => {
    setProfile(null);
    setHeroStats([]);
    setRecentMatches([]);
    setWinLoss(null);
    setSearchResults([]);
    setQuery('');
    setError('');
  };

  // Top heroes (all time)
  const topHeroes = useMemo(() => {
    return heroStats
      .filter(h => h.games >= 3)
      .sort((a, b) => b.games - a.games)
      .slice(0, 20)
      .map(h => {
        const hero = getHeroById(h.hero_id);
        return { ...h, hero, winRate: h.games > 0 ? h.win / h.games : 0 };
      })
      .filter(h => h.hero);
  }, [heroStats]);

  // Signature heroes (последние 100 игр — кого чаще всего пикает)
  const signatureHeroes = useMemo(() => {
    const last100 = recentMatches.slice(0, 100);
    const heroCount: Record<number, { games: number; wins: number }> = {};

    for (const match of last100) {
      if (!heroCount[match.hero_id]) heroCount[match.hero_id] = { games: 0, wins: 0 };
      heroCount[match.hero_id].games++;
      const isRadiant = match.player_slot < 128;
      const won = (isRadiant && match.radiant_win) || (!isRadiant && !match.radiant_win);
      if (won) heroCount[match.hero_id].wins++;
    }

    return Object.entries(heroCount)
      .map(([id, data]) => {
        const hero = getHeroById(parseInt(id));
        return { heroId: parseInt(id), hero, ...data, winRate: data.games > 0 ? data.wins / data.games : 0 };
      })
      .filter(h => h.hero)
      .sort((a, b) => b.games - a.games)
      .slice(0, 15);
  }, [recentMatches]);

  // Recent matches enriched
  const enrichedRecent = useMemo(() => {
    return recentMatches.slice(0, 20).map(m => {
      const hero = getHeroById(m.hero_id);
      const isRadiant = m.player_slot < 128;
      const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win);
      return { ...m, hero, won };
    });
  }, [recentMatches]);

  const totalWr = winLoss ? (winLoss.win / (winLoss.win + winLoss.lose) * 100) : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1923] via-[#0d1117] to-[#0a0e13]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[200px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-7 h-7 text-dota-gold" />
            <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">РАЗВЕДКА</h1>
          </div>
          <p className="font-body text-slate-400 text-base sm:text-lg">Найди игрока по нику или Steam ID · Статистика героев и матчей из OpenDota</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Search bar */}
        <div className="sticky top-0 z-20 bg-dota-bg/95 backdrop-blur-md py-4 -mx-4 px-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Ник игрока или Steam ID..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-dota-card/60 border border-dota-border/30 text-white font-body text-base placeholder:text-slate-600 focus:border-dota-gold/30 focus:outline-none transition-all duration-300"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-dota-gold/80 to-amber-600 text-white font-body font-bold text-base hover:scale-[1.02] disabled:opacity-40 transition-all duration-300 shadow-lg shadow-dota-gold/10"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Найти'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center mb-6">
            <p className="text-base font-body text-red-400">{error}</p>
          </div>
        )}

        {/* Search results list */}
        {searchResults.length > 0 && !profile && (
          <div className="rounded-2xl bg-dota-card/60 border border-dota-border/20 p-5 mb-6">
            <h3 className="font-display text-xl font-bold text-white mb-4">Найдено {searchResults.length} игроков</h3>
            <div className="space-y-2">
              {searchResults.map(r => (
                <button key={r.account_id} onClick={() => loadPlayer(r.account_id)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/6 transition-all duration-300 text-left">
                  <img src={r.avatarfull} alt="" className="w-12 h-12 rounded-2xl border border-dota-border/30" />
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-body font-bold text-white block truncate">{r.personaname}</span>
                    <span className="text-xs font-mono text-slate-500">ID: {r.account_id}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 text-dota-gold animate-spin" />
            <span className="text-lg font-body text-slate-400">Загрузка профиля...</span>
          </div>
        )}

        {/* Player profile */}
        {profile && !loading && (
          <>
            {/* Profile card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#0d1117] border border-dota-border/20 p-6 mb-6">
              <div className="flex items-center gap-5">
                <img src={profile.profile.avatarfull} alt="" className="w-20 h-20 rounded-2xl border-2 border-dota-border/30 shadow-xl" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-3xl font-black text-white truncate">{profile.profile.personaname}</h2>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-sm font-mono text-slate-500">ID: {profile.profile.account_id}</span>
                    <span className="text-sm font-body font-bold px-3 py-1 rounded-full" style={{
                      backgroundColor: getRankColor(profile.rank_tier) + '20',
                      color: getRankColor(profile.rank_tier),
                      border: `1px solid ${getRankColor(profile.rank_tier)}40`,
                    }}>
                      {getRankName(profile.rank_tier)}
                      {profile.leaderboard_rank ? ` #${profile.leaderboard_rank}` : ''}
                    </span>
                    {profile.mmr_estimate?.estimate && (
                      <span className="text-sm font-mono text-slate-400">~{profile.mmr_estimate.estimate} MMR</span>
                    )}
                  </div>
                </div>
                <button onClick={resetSearch} className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Win/Loss stats */}
              {winLoss && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                    <div className="font-display text-2xl font-bold text-emerald-400">{winLoss.win}</div>
                    <div className="text-xs font-body text-slate-500">Побед</div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                    <div className="font-display text-2xl font-bold text-red-400">{winLoss.lose}</div>
                    <div className="text-xs font-body text-slate-500">Поражений</div>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
                    <div className={`font-display text-2xl font-bold ${totalWr >= 52 ? 'text-emerald-400' : totalWr < 48 ? 'text-red-400' : 'text-dota-gold'}`}>
                      {totalWr.toFixed(1)}%
                    </div>
                    <div className="text-xs font-body text-slate-500">Винрейт</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-dota-card/60 border border-dota-border/20 w-fit">
              {[
                { key: 'heroes' as ViewTab, label: 'Все герои', icon: BarChart3 },
                { key: 'signature' as ViewTab, label: 'Последние 100 игр', icon: Star },
                { key: 'recent' as ViewTab, label: 'Матчи', icon: Clock },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-body font-bold transition-all duration-300 ${
                    tab === key ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'
                  }`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* ===== ALL HEROES TAB ===== */}
            {tab === 'heroes' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-dota-gold" />
                  <h3 className="font-display text-xl font-bold text-white">Топ героев (все время)</h3>
                </div>
                {topHeroes.map((h, i) => (
                  <div key={h.hero_id} className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] ${
                    i < 3 ? 'bg-dota-card/60 border border-dota-gold/15' : 'bg-dota-card/60/60 border border-white/3'
                  }`}>
                    <span className={`w-8 text-center font-mono text-sm font-bold ${
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'
                    }`}>#{i + 1}</span>
                    <img src={h.hero!.img} alt="" className="w-16 h-10 rounded-xl object-cover border border-dota-border/30" />
                    <AttrIcon attr={h.hero!.primary_attr} size={16} />
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-body font-bold text-white">{h.hero!.localized_name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-base font-mono font-bold text-white">{h.games}</div>
                        <div className="text-[10px] font-body text-slate-600">игр</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-base font-mono font-bold ${h.winRate >= 0.55 ? 'text-emerald-400' : h.winRate < 0.45 ? 'text-red-400' : 'text-slate-300'}`}>
                          {(h.winRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] font-body text-slate-600">WR</div>
                      </div>
                      <div className="w-20 h-2 rounded-full bg-white/[0.04] overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{
                          width: `${h.winRate * 100}%`,
                          backgroundColor: h.winRate >= 0.55 ? '#22c55e' : h.winRate < 0.45 ? '#ef4444' : '#64748b',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== SIGNATURE HEROES (last 100) ===== */}
            {tab === 'signature' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-xl font-bold text-white">Самые пикаемые за последние 100 игр</h3>
                </div>
                <p className="text-sm font-body text-slate-500 mb-4">Кого игрок чаще всего выбирает в последнее время</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {signatureHeroes.map((h, i) => (
                    <div key={h.heroId} className={`rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] ${
                      i < 3 ? 'border-dota-gold/20' : 'border-dota-border/20'
                    }`}>
                      {/* Hero image */}
                      <div className="relative h-20 overflow-hidden">
                        <img src={h.hero!.img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 flex items-center gap-2">
                          <AttrIcon attr={h.hero!.primary_attr} size={14} />
                          <span className="font-body text-sm font-bold text-white drop-shadow-lg">{h.hero!.localized_name}</span>
                        </div>
                        {i < 3 && (
                          <div className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-dota-gold/80 flex items-center justify-center">
                            <span className="text-xs font-mono font-black text-black">#{i + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="bg-dota-card/60 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-lg font-mono font-bold text-white">{h.games}</div>
                              <div className="text-[10px] font-body text-slate-500">игр</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-mono font-bold text-emerald-400">{h.wins}</div>
                              <div className="text-[10px] font-body text-slate-500">побед</div>
                            </div>
                          </div>
                          <div className={`text-lg font-mono font-bold px-3 py-1 rounded-xl ${
                            h.winRate >= 0.6 ? 'bg-emerald-500/15 text-emerald-400' :
                            h.winRate >= 0.5 ? 'bg-dota-gold/15 text-dota-gold' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {(h.winRate * 100).toFixed(0)}%
                          </div>
                        </div>
                        {/* Frequency bar */}
                        <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-dota-gold to-amber-500" style={{ width: `${(h.games / Math.max(1, signatureHeroes[0]?.games || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {signatureHeroes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-base font-body text-slate-500">Нет данных о последних матчах</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== RECENT MATCHES ===== */}
            {tab === 'recent' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-display text-xl font-bold text-white">Последние матчи</h3>
                </div>
                {enrichedRecent.map(m => (
                  <div key={m.match_id} className={`flex items-center gap-4 p-3 rounded-2xl border ${
                    m.won ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'
                  }`}>
                    {/* Win/Loss */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                      m.won ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {m.won ? 'W' : 'L'}
                    </div>

                    {/* Hero */}
                    {m.hero && (
                      <>
                        <img src={m.hero.img} alt="" className="w-14 h-9 rounded-xl object-cover border border-dota-border/30" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-body font-bold text-white">{m.hero.localized_name}</span>
                            <AttrIcon attr={m.hero.primary_attr} size={12} />
                          </div>
                          <span className="text-xs font-body text-slate-500">{timeAgo(m.start_time)}</span>
                        </div>
                      </>
                    )}

                    {/* KDA */}
                    <div className="flex items-center gap-1 text-sm font-mono">
                      <span className="text-emerald-400 font-bold">{m.kills}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-red-400 font-bold">{m.deaths}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-blue-400 font-bold">{m.assists}</span>
                    </div>

                    {/* Duration */}
                    <span className="text-xs font-mono text-slate-500 hidden sm:block">{formatDuration(m.duration)}</span>

                    {/* Match link */}
                    <a href={`https://www.opendota.com/matches/${m.match_id}`} target="_blank" rel="noopener"
                      className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/6 transition-all duration-300">
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!profile && !loading && !error && searchResults.length === 0 && (
          <div className="rounded-2xl bg-dota-card/60 border border-dota-border/20 p-16 text-center">
            <Eye className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <h3 className="font-display text-2xl font-bold text-white mb-3">Разведка игрока</h3>
            <p className="text-base font-body text-slate-400 max-w-md mx-auto mb-6">
              Введи ник или Steam ID чтобы увидеть статистику героев, последние матчи и самые пикаемые герои
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm font-body text-slate-500">
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.03]">🔍 Поиск по нику</span>
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.03]">🆔 Steam ID</span>
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.03]">📊 Топ героев</span>
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.03]">🎯 Последние 100 игр</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
