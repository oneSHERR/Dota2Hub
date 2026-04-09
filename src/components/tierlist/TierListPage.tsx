import { useState, useEffect, useMemo } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero, TierRank } from '@/types';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Crown, Search, X, RefreshCw } from 'lucide-react';

// ========== VALVE CDN ATTR ICONS ==========
const ATTR_ICONS: Record<string, string> = {
  str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
  agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
  int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  all: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png',
};

function AttrIcon({ attr, size = 16 }: { attr: string; size?: number }) {
  const src = ATTR_ICONS[attr] || ATTR_ICONS.all;
  return <img src={src} alt={getAttrLabel(attr)} className="inline-block" style={{ width: size, height: size }} />;
}

// ========== OpenDota API ==========
interface OpenDotaHeroStat {
  id: number;
  localized_name: string;
  pro_win?: number;
  pro_pick?: number;
  pro_ban?: number;
  '1_win': number;
  '1_pick': number;
  '2_win': number;
  '2_pick': number;
  '3_win': number;
  '3_pick': number;
  '4_win': number;
  '4_pick': number;
  '5_win': number;
  '5_pick': number;
  '6_win': number;
  '6_pick': number;
  '7_win': number;
  '7_pick': number;
  '8_win': number;
  '8_pick': number;
}

// Кеш чтобы не дёргать API при каждом переключении табов
let cachedStats: OpenDotaHeroStat[] | null = null;

// Фолбэк данные меты 7.41b (фиксированные, не рандомные)
function getFallbackStats(): OpenDotaHeroStat[] {
  const fallback: Record<string, { wr: number; picks: number }> = {
    '1': { wr: 0.498, picks: 180000 }, '2': { wr: 0.530, picks: 290000 }, '3': { wr: 0.505, picks: 200000 },
    '4': { wr: 0.520, picks: 300000 }, '5': { wr: 0.530, picks: 300000 }, '6': { wr: 0.518, picks: 250000 },
    '7': { wr: 0.535, picks: 250000 }, '8': { wr: 0.525, picks: 310000 }, '9': { wr: 0.510, picks: 200000 },
    '10': { wr: 0.508, picks: 190000 }, '11': { wr: 0.510, picks: 280000 }, '12': { wr: 0.512, picks: 200000 },
    '13': { wr: 0.515, picks: 200000 }, '14': { wr: 0.500, picks: 450000 }, '15': { wr: 0.505, picks: 180000 },
    '16': { wr: 0.535, picks: 200000 }, '17': { wr: 0.505, picks: 230000 }, '18': { wr: 0.518, picks: 220000 },
    '19': { wr: 0.515, picks: 220000 }, '20': { wr: 0.512, picks: 190000 }, '21': { wr: 0.520, picks: 210000 },
    '22': { wr: 0.510, picks: 250000 }, '23': { wr: 0.515, picks: 200000 }, '25': { wr: 0.518, picks: 280000 },
    '26': { wr: 0.518, picks: 320000 }, '27': { wr: 0.525, picks: 200000 }, '28': { wr: 0.510, picks: 180000 },
    '29': { wr: 0.540, picks: 180000 }, '30': { wr: 0.520, picks: 220000 }, '31': { wr: 0.540, picks: 220000 },
    '32': { wr: 0.508, picks: 190000 }, '33': { wr: 0.505, picks: 150000 }, '34': { wr: 0.468, picks: 120000 },
    '35': { wr: 0.502, picks: 270000 }, '36': { wr: 0.528, picks: 185000 }, '37': { wr: 0.515, picks: 160000 },
    '38': { wr: 0.528, picks: 180000 }, '39': { wr: 0.515, picks: 190000 }, '40': { wr: 0.510, picks: 170000 },
    '41': { wr: 0.512, picks: 240000 }, '42': { wr: 0.533, picks: 240000 }, '43': { wr: 0.508, picks: 180000 },
    '44': { wr: 0.520, picks: 350000 }, '45': { wr: 0.502, picks: 140000 }, '46': { wr: 0.508, picks: 170000 },
    '47': { wr: 0.510, picks: 200000 }, '48': { wr: 0.515, picks: 210000 }, '49': { wr: 0.518, picks: 200000 },
    '50': { wr: 0.512, picks: 160000 }, '51': { wr: 0.515, picks: 170000 }, '52': { wr: 0.510, picks: 180000 },
    '53': { wr: 0.505, picks: 160000 }, '54': { wr: 0.538, picks: 250000 }, '55': { wr: 0.495, picks: 140000 },
    '56': { wr: 0.505, picks: 170000 }, '57': { wr: 0.542, picks: 160000 }, '58': { wr: 0.512, picks: 130000 },
    '59': { wr: 0.510, picks: 180000 }, '60': { wr: 0.515, picks: 190000 }, '61': { wr: 0.470, picks: 50000 },
    '62': { wr: 0.508, picks: 170000 }, '63': { wr: 0.510, picks: 180000 }, '64': { wr: 0.535, picks: 180000 },
    '65': { wr: 0.505, picks: 160000 }, '66': { wr: 0.465, picks: 40000 }, '67': { wr: 0.508, picks: 220000 },
    '68': { wr: 0.505, picks: 180000 }, '69': { wr: 0.512, picks: 200000 }, '70': { wr: 0.545, picks: 280000 },
    '71': { wr: 0.545, picks: 260000 }, '72': { wr: 0.510, picks: 190000 }, '73': { wr: 0.508, picks: 200000 },
    '74': { wr: 0.490, picks: 350000 }, '75': { wr: 0.510, picks: 180000 }, '76': { wr: 0.498, picks: 160000 },
    '77': { wr: 0.512, picks: 150000 }, '78': { wr: 0.505, picks: 140000 }, '79': { wr: 0.502, picks: 150000 },
    '80': { wr: 0.472, picks: 55000 }, '81': { wr: 0.518, picks: 200000 }, '82': { wr: 0.475, picks: 60000 },
    '83': { wr: 0.530, picks: 140000 }, '84': { wr: 0.535, picks: 210000 }, '85': { wr: 0.538, picks: 180000 },
    '86': { wr: 0.480, picks: 250000 }, '87': { wr: 0.510, picks: 170000 }, '88': { wr: 0.512, picks: 160000 },
    '89': { wr: 0.508, picks: 170000 }, '90': { wr: 0.505, picks: 150000 }, '91': { wr: 0.498, picks: 130000 },
    '92': { wr: 0.510, picks: 180000 }, '93': { wr: 0.488, picks: 150000 }, '94': { wr: 0.515, picks: 160000 },
    '95': { wr: 0.502, picks: 140000 }, '96': { wr: 0.508, picks: 160000 }, '97': { wr: 0.505, picks: 140000 },
    '98': { wr: 0.502, picks: 200000 }, '99': { wr: 0.522, picks: 210000 }, '100': { wr: 0.515, picks: 170000 },
    '101': { wr: 0.508, picks: 160000 }, '102': { wr: 0.512, picks: 190000 }, '103': { wr: 0.505, picks: 170000 },
    '104': { wr: 0.502, picks: 200000 }, '105': { wr: 0.508, picks: 180000 }, '106': { wr: 0.528, picks: 170000 },
    '107': { wr: 0.512, picks: 190000 }, '108': { wr: 0.536, picks: 150000 }, '109': { wr: 0.532, picks: 160000 },
    '110': { wr: 0.518, picks: 170000 }, '111': { wr: 0.505, picks: 160000 }, '112': { wr: 0.510, picks: 170000 },
    '113': { wr: 0.478, picks: 80000 }, '114': { wr: 0.508, picks: 200000 }, '119': { wr: 0.505, picks: 170000 },
    '120': { wr: 0.510, picks: 190000 }, '121': { wr: 0.502, picks: 160000 }, '123': { wr: 0.520, picks: 190000 },
    '126': { wr: 0.535, picks: 200000 }, '128': { wr: 0.510, picks: 180000 }, '129': { wr: 0.518, picks: 250000 },
    '131': { wr: 0.505, picks: 140000 }, '135': { wr: 0.528, picks: 170000 }, '136': { wr: 0.522, picks: 200000 },
    '137': { wr: 0.515, picks: 190000 }, '138': { wr: 0.508, picks: 175000 }, '145': { wr: 0.505, picks: 150000 },
    '155': { wr: 0.510, picks: 130000 },
  };

  return Object.entries(fallback).map(([id, data]) => {
    const heroId = parseInt(id);
    const stat: any = { id: heroId, localized_name: '' };
    // Распределяем по рангам равномерно
    for (const r of [1,2,3,4,5,6,7,8]) {
      const rPicks = Math.round(data.picks / 8);
      stat[`${r}_pick`] = rPicks;
      stat[`${r}_win`] = Math.round(rPicks * data.wr);
    }
    return stat as OpenDotaHeroStat;
  });
}

async function fetchWithRetry(url: string, retries: number = 2, delay: number = 3000): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429 && i < retries) {
        // Rate limited — ждём и пробуем снова
        await new Promise(r => setTimeout(r, delay * (i + 1)));
        continue;
      }
      throw new Error(`API ${res.status}`);
    } catch (e) {
      if (i < retries) {
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw new Error('All retries failed');
}

async function fetchHeroStats(): Promise<OpenDotaHeroStat[]> {
  if (cachedStats) return cachedStats;

  try {
    const res = await fetchWithRetry('https://api.opendota.com/api/heroStats');
    const data: OpenDotaHeroStat[] = await res.json();
    cachedStats = data;
    return data;
  } catch (e) {
    console.warn('OpenDota API failed, using fallback data:', e);
    const fallback = getFallbackStats();
    cachedStats = fallback;
    return fallback;
  }
}
  return data;

// ========== ТИР-ЛИСТ ЛОГИКА ==========
interface TierHero {
  hero: Hero;
  winRate: number;
  pickRate: number;
  totalWins: number;
  totalPicks: number;
  tier: TierRank;
  score: number;
}

type RankFilter = 'all' | 'high' | 'low';

function aggregateStats(raw: OpenDotaHeroStat, rankFilter: RankFilter): { wins: number; picks: number } {
  let wins = 0;
  let picks = 0;

  // Ранги OpenDota: 1=Herald, 2=Guardian, 3=Crusader, 4=Archon, 5=Legend, 6=Ancient, 7=Divine, 8=Immortal
  if (rankFilter === 'high') {
    // Divine + Immortal (7, 8)
    for (const r of [7, 8]) {
      wins += (raw as any)[`${r}_win`] || 0;
      picks += (raw as any)[`${r}_pick`] || 0;
    }
  } else if (rankFilter === 'low') {
    // Herald — Archon (1-4)
    for (const r of [1, 2, 3, 4]) {
      wins += (raw as any)[`${r}_win`] || 0;
      picks += (raw as any)[`${r}_pick`] || 0;
    }
  } else {
    // Все ранги (1-8)
    for (const r of [1, 2, 3, 4, 5, 6, 7, 8]) {
      wins += (raw as any)[`${r}_win`] || 0;
      picks += (raw as any)[`${r}_pick`] || 0;
    }
  }

  return { wins, picks };
}

function calculateTiers(stats: OpenDotaHeroStat[], rankFilter: RankFilter): TierHero[] {
  const processed: TierHero[] = [];
  let totalPicksAll = 0;

  // Первый проход — собираем данные
  const heroData: { hero: Hero; wins: number; picks: number }[] = [];

  for (const raw of stats) {
    const hero = ALL_HEROES.find(h => h.id === raw.id);
    if (!hero) continue;

    const { wins, picks } = aggregateStats(raw, rankFilter);
    if (picks < 10) continue;

    totalPicksAll += picks;
    heroData.push({ hero, wins, picks });
  }

  // Второй проход — считаем рейты и скоры
  const avgPickRate = totalPicksAll / heroData.length;

  for (const { hero, wins, picks } of heroData) {
    const winRate = wins / picks;
    const pickRate = picks / avgPickRate; // нормализованный пикрейт (1.0 = средний)

    // Composite score: winrate вес 70%, pickrate вес 30%
    const score = winRate * 0.7 + Math.min(pickRate, 2) * 0.15;

    processed.push({
      hero,
      winRate,
      pickRate: picks / totalPicksAll * 100,
      totalWins: wins,
      totalPicks: picks,
      tier: 'C',
      score,
    });
  }

  // Сортируем по score
  processed.sort((a, b) => b.score - a.score);

  // Назначаем тиры
  const total = processed.length;
  processed.forEach((h, i) => {
    const pct = i / total;
    if (pct < 0.08) h.tier = 'S';
    else if (pct < 0.25) h.tier = 'A';
    else if (pct < 0.55) h.tier = 'B';
    else if (pct < 0.80) h.tier = 'C';
    else h.tier = 'D';
  });

  return processed;
}

// ========== TIER COLORS ==========
const TIER_CONFIG: Record<TierRank, { label: string; color: string; bg: string; border: string; glow: string; desc: string }> = {
  S: { label: 'S-ТИРА', color: '#f0c040', bg: 'rgba(240,192,64,0.08)', border: 'rgba(240,192,64,0.25)', glow: '0 0 30px rgba(240,192,64,0.15)', desc: 'Лучшие герои патча. Доминируют в мете.' },
  A: { label: 'A-ТИРА', color: '#e63946', bg: 'rgba(230,57,70,0.06)', border: 'rgba(230,57,70,0.20)', glow: '0 0 20px rgba(230,57,70,0.10)', desc: 'Очень сильные пики. Почти всегда хороший выбор.' },
  B: { label: 'B-ТИРА', color: '#00B4F0', bg: 'rgba(0,180,240,0.05)', border: 'rgba(0,180,240,0.15)', glow: 'none', desc: 'Сбалансированные герои. Хороши в правильных условиях.' },
  C: { label: 'C-ТИРА', color: '#9ca3af', bg: 'rgba(156,163,175,0.04)', border: 'rgba(156,163,175,0.10)', glow: 'none', desc: 'Ниже среднего. Требуют опыта и правильного пика.' },
  D: { label: 'D-ТИРА', color: '#6b7280', bg: 'rgba(107,114,128,0.04)', border: 'rgba(107,114,128,0.08)', glow: 'none', desc: 'Самые слабые герои патча. Не рекомендуются.' },
};

// ========== FILTERS ==========
type AttrFilterType = 'all' | 'str' | 'agi' | 'int' | 'uni';
type SortType = 'tier' | 'winrate' | 'pickrate';

// ========== TIER LIST PAGE ==========
export function TierListPage() {
  const [rawStats, setRawStats] = useState<OpenDotaHeroStat[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [attrFilter, setAttrFilter] = useState<AttrFilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('tier');
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState<RankFilter>('all');

  const loadData = () => {
    setLoading(true);
    setIsFallback(false);
    cachedStats = null;
    fetchHeroStats()
      .then(data => {
        // Проверяем — если данные из фолбэка (нет localized_name)
        const isReal = data.length > 0 && data[0].localized_name !== '';
        setIsFallback(!isReal);
        setRawStats(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHeroStats()
      .then(data => {
        const isReal = data.length > 0 && data[0].localized_name !== '';
        setIsFallback(!isReal);
        setRawStats(data);
        setLoading(false);
      });
  }, []);

  // Пересчёт тиров при смене фильтра ранга
  const tierHeroes = useMemo(() => {
    if (!rawStats) return [];
    return calculateTiers(rawStats, rankFilter);
  }, [rawStats, rankFilter]);

  const filtered = useMemo(() => {
    let list = tierHeroes;

    if (search) {
      list = list.filter(h => h.hero.localized_name.toLowerCase().includes(search.toLowerCase()));
    }

    if (attrFilter !== 'all') {
      const attrKey = attrFilter === 'uni' ? 'all' : attrFilter;
      list = list.filter(h => h.hero.primary_attr === attrKey);
    }

    if (sortBy === 'winrate') {
      list = [...list].sort((a, b) => b.winRate - a.winRate);
    } else if (sortBy === 'pickrate') {
      list = [...list].sort((a, b) => b.pickRate - a.pickRate);
    }

    return list;
  }, [tierHeroes, attrFilter, sortBy, search]);

  // Группировка по тирам
  const grouped = useMemo(() => {
    if (sortBy !== 'tier') return null;
    const groups: Record<TierRank, TierHero[]> = { S: [], A: [], B: [], C: [], D: [] };
    filtered.forEach(h => groups[h.tier].push(h));
    return groups;
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1520] via-[#0d1117] to-[#0a0e13]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-7 h-7 text-dota-gold" />
            <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">ТИР-ЛИСТ</h1>
          </div>
          <p className="font-body text-slate-400 text-base sm:text-lg">
            Реальные данные OpenDota API · Винрейт и пикрейт
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isFallback ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-sm font-body text-slate-500">
              {isFallback ? 'Фолбэк данные (патч 7.41b) — OpenDota временно недоступен' : 'Реальные данные OpenDota API'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Фильтры */}
        <div className="sticky top-0 z-20 bg-[#0a0e13]/95 backdrop-blur-md border-b border-white/5 -mx-4 px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Attr filter */}
            <div className="flex gap-1">
              {[
                { key: 'all' as const, label: 'ВСЕ', color: '#fff', attr: '' },
                { key: 'str' as const, label: '', color: '#EC3D06', attr: 'str' },
                { key: 'agi' as const, label: '', color: '#26E030', attr: 'agi' },
                { key: 'int' as const, label: '', color: '#00B4F0', attr: 'int' },
                { key: 'uni' as const, label: '', color: '#B8B8B8', attr: 'all' },
              ].map(({ key, label, color, attr }) => (
                <button
                  key={key}
                  onClick={() => setAttrFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-body font-bold uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: attrFilter === key ? color + '18' : 'transparent',
                    color: attrFilter === key ? color : '#64748b',
                    borderBottom: attrFilter === key ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  {attr ? <AttrIcon attr={attr} size={16} /> : label}
                </button>
              ))}
            </div>

            {/* Rank filter */}
            <div className="flex gap-1 border border-white/5 rounded-lg p-0.5">
              {[
                { key: 'all' as const, label: 'Все ранги' },
                { key: 'high' as const, label: 'Divine+' },
                { key: 'low' as const, label: 'Herald—Archon' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRankFilter(key)}
                  className={`px-3 py-2 rounded-md text-sm font-body font-bold transition-all ${rankFilter === key ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-1 border border-white/5 rounded-lg p-0.5">
              {[
                { key: 'tier' as const, label: 'Тир', icon: Crown },
                { key: 'winrate' as const, label: 'WR', icon: TrendingUp },
                { key: 'pickrate' as const, label: 'PR', icon: BarChart3 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-body font-bold transition-all ${sortBy === key ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-body text-base placeholder:text-slate-600 focus:border-white/20 focus:outline-none transition-colors"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
            </div>

            {/* Refresh */}
            <button onClick={loadData} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Обновить данные">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Загрузка */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 text-dota-gold animate-spin" />
            <span className="text-lg font-body text-slate-400">Загрузка данных из OpenDota...</span>
          </div>
        )}

        {/* Контент */}
        {!loading && (
          <>
            {/* Группировка по тирам */}
            {grouped ? (
              <div className="space-y-8">
                {(['S', 'A', 'B', 'C', 'D'] as TierRank[]).map(tier => {
                  const heroes = grouped[tier];
                  if (heroes.length === 0) return null;
                  const cfg = TIER_CONFIG[tier];
                  return (
                    <div key={tier}>
                      {/* Заголовок тира */}
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center font-display text-2xl font-black"
                          style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}`, color: cfg.color, boxShadow: cfg.glow }}
                        >
                          {tier}
                        </div>
                        <div>
                          <h2 className="font-display text-xl font-bold" style={{ color: cfg.color }}>{cfg.label}</h2>
                          <p className="text-sm font-body text-slate-500">{cfg.desc}</p>
                        </div>
                        <span className="text-sm font-body text-slate-600 ml-auto">{heroes.length} героев</span>
                      </div>

                      {/* Герои в тире */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {heroes.map(h => (
                          <TierHeroCard key={h.hero.id} data={h} tierColor={cfg.color} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Таблица при сортировке */
              <div className="space-y-1.5">
                {filtered.map((h, i) => (
                  <TierListRow key={h.hero.id} data={h} rank={i + 1} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="font-body text-slate-500 text-xl">Герой не найден</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ========== TIER HERO CARD ==========
function TierHeroCard({ data, tierColor }: { data: TierHero; tierColor: string }) {
  const wrPercent = (data.winRate * 100).toFixed(1);
  const prPercent = data.pickRate.toFixed(2);
  const isGoodWr = data.winRate >= 0.52;
  const isBadWr = data.winRate < 0.48;

  return (
    <div
      className="group relative rounded-xl bg-gradient-to-br from-[#111827] to-[#0d1117] border overflow-hidden hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
      style={{ borderColor: tierColor + '20' }}
    >
      {/* Изображение */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={data.hero.img}
          alt={data.hero.localized_name}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />

        {/* Тир бейдж */}
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center font-display text-sm font-black"
          style={{ backgroundColor: tierColor + '30', color: tierColor, border: `1px solid ${tierColor}50` }}
        >
          {data.tier}
        </div>

        {/* Attr icon */}
        <div className="absolute top-2 left-2">
          <AttrIcon attr={data.hero.primary_attr} size={14} />
        </div>
      </div>

      {/* Инфо */}
      <div className="p-3">
        <h3 className="font-body text-base font-bold text-white truncate mb-2">{data.hero.localized_name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {isGoodWr ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : isBadWr ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : null}
            <span className={`text-sm font-mono font-bold ${isGoodWr ? 'text-green-400' : isBadWr ? 'text-red-400' : 'text-slate-300'}`}>
              {wrPercent}%
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">{data.totalPicks.toLocaleString()} игр</span>
        </div>
      </div>
    </div>
  );
}

// ========== TIER LIST ROW (table mode) ==========
function TierListRow({ data, rank }: { data: TierHero; rank: number }) {
  const wrPercent = (data.winRate * 100).toFixed(1);
  const isGoodWr = data.winRate >= 0.52;
  const isBadWr = data.winRate < 0.48;
  const cfg = TIER_CONFIG[data.tier];

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#111827]/60 border border-white/3 hover:bg-[#111827] hover:border-white/8 transition-all">
      {/* Rank */}
      <span className="w-8 text-right text-sm font-mono font-bold text-slate-600">#{rank}</span>

      {/* Hero */}
      <img src={data.hero.icon} alt="" className="w-10 h-10 rounded-lg" loading="lazy" />
      <span className="text-base font-body font-bold text-white flex-1 truncate">{data.hero.localized_name}</span>

      {/* Attr */}
      <div className="hidden sm:block"><AttrIcon attr={data.hero.primary_attr} size={16} /></div>

      {/* Tier */}
      <span
        className="w-8 text-center font-display text-base font-black"
        style={{ color: cfg.color }}
      >
        {data.tier}
      </span>

      {/* Winrate */}
      <div className="w-20 text-right flex items-center justify-end gap-1">
        {isGoodWr ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : isBadWr ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> : null}
        <span className={`text-sm font-mono font-bold ${isGoodWr ? 'text-green-400' : isBadWr ? 'text-red-400' : 'text-slate-300'}`}>
          {wrPercent}%
        </span>
      </div>

      {/* Games */}
      <div className="w-24 text-right hidden sm:block">
        <span className="text-sm font-mono text-slate-500">{data.totalPicks.toLocaleString()}</span>
      </div>

      {/* Bar */}
      <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden hidden md:block">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${data.winRate * 100}%`,
            backgroundColor: isGoodWr ? '#22c55e' : isBadWr ? '#ef4444' : '#64748b',
          }}
        />
      </div>
    </div>
  );
}
