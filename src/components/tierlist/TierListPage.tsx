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

async function fetchHeroStats(): Promise<OpenDotaHeroStat[]> {
  if (cachedStats) return cachedStats;

  const res = await fetch('https://api.opendota.com/api/heroStats');
  if (!res.ok) throw new Error(`OpenDota API error: ${res.status}`);

  const data: OpenDotaHeroStat[] = await res.json();
  cachedStats = data;
  return data;
}

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
  const [error, setError] = useState(false);
  const [attrFilter, setAttrFilter] = useState<AttrFilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('tier');
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState<RankFilter>('all');

  const loadData = () => {
    setLoading(true);
    setError(false);
    cachedStats = null; // сброс кеша при ручном обновлении
    fetchHeroStats()
      .then(data => {
        setRawStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHeroStats()
      .then(data => { setRawStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
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
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-body text-slate-500">
              Данные обновляются в реальном времени из OpenDota
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

        {/* Ошибка */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <p className="text-lg font-body text-red-400 mb-4">Не удалось загрузить данные из OpenDota</p>
            <button onClick={loadData} className="px-6 py-2.5 rounded-lg bg-red-500/20 text-red-400 font-body font-bold hover:bg-red-500/30 transition-colors">
              Попробовать снова
            </button>
          </div>
        )}

        {/* Контент */}
        {!loading && !error && (
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
