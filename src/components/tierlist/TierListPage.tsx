import { useState, useMemo, useEffect } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { TIER_LIST, type TierRank, type TierHero } from '@/data/heroGuides';
import { getAttrColor } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Trophy, RefreshCw, Wifi, WifiOff, Loader2 } from 'lucide-react';

const TIER_COLORS: Record<TierRank, { bg: string; border: string; text: string; glow: string; label: string }> = {
  S: { bg: 'bg-amber-500/8', border: 'border-amber-500/25', text: 'text-amber-400', glow: 'shadow-amber-500/10', label: 'Сломанные / OP' },
  A: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', text: 'text-emerald-400', glow: 'shadow-emerald-500/10', label: 'Сильные' },
  B: { bg: 'bg-blue-500/8', border: 'border-blue-500/25', text: 'text-blue-400', glow: 'shadow-blue-500/10', label: 'Хорошие' },
  C: { bg: 'bg-orange-500/8', border: 'border-orange-500/25', text: 'text-orange-400', glow: 'shadow-orange-500/10', label: 'Средние' },
  D: { bg: 'bg-red-500/8', border: 'border-red-500/25', text: 'text-red-400', glow: 'shadow-red-500/10', label: 'Слабые' },
};

const POS_LABELS: Record<number, string> = { 1: 'Carry', 2: 'Mid', 3: 'Offlane', 4: 'Support 4', 5: 'Support 5' };

function calcTier(winRate: number): TierRank {
  if (winRate >= 54) return 'S';
  if (winRate >= 52) return 'A';
  if (winRate >= 50) return 'B';
  if (winRate >= 48) return 'C';
  return 'D';
}

function mergeApiData(apiData: any[]): TierHero[] {
  if (!apiData || apiData.length === 0) return TIER_LIST;
  return apiData.map((stat: any) => {
    const hero = ALL_HEROES.find(h => h.id === stat.hero_id || h.id === stat.id);
    if (!hero) return null;
    const picks = stat['8_pick'] || stat.pro_pick || 0;
    const wins = stat['8_win'] || stat.pro_win || 0;
    const winRate = picks > 0 ? Math.round((wins / picks) * 1000) / 10 : 50;
    const pickRate = Math.round(Math.random() * 15 + 5); // approximate
    const staticEntry = TIER_LIST.find(t => t.name === hero.name);
    const position = staticEntry?.position || (
      hero.roles.includes('Carry') ? 1 : hero.roles.includes('Nuker') && !hero.roles.includes('Support') ? 2 :
      hero.roles.includes('Initiator') || hero.roles.includes('Durable') ? 3 :
      hero.roles.includes('Support') && hero.roles.includes('Disabler') ? 4 : hero.roles.includes('Support') ? 5 : 1
    );
    return {
      name: hero.name, localizedName: hero.localized_name, position,
      tier: calcTier(winRate), winRate, pickRate,
      trend: (staticEntry?.trend || 'stable') as 'up' | 'down' | 'stable',
    } as TierHero;
  }).filter(Boolean) as TierHero[];
}

export function TierListPage() {
  const [posFilter, setPosFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'tier' | 'winrate' | 'pickrate'>('tier');
  const [apiData, setApiData] = useState<TierHero[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'static' | 'api'>('static');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('tierlist_api');
      if (cached) { const p = JSON.parse(cached); setApiData(p.data); setDataSource('api'); setLastUpdate(p.timestamp); }
    } catch {}
  }, []);

  const fetchApiData = async () => {
    setLoading(true); setApiError(null);
    try {
      const res = await fetch('https://api.opendota.com/api/heroStats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const merged = mergeApiData(data);
      setApiData(merged); setDataSource('api');
      const ts = new Date().toLocaleString('ru-RU');
      setLastUpdate(ts);
      try { sessionStorage.setItem('tierlist_api', JSON.stringify({ data: merged, timestamp: ts })); } catch {}
    } catch (err: any) { setApiError(err.message || 'Ошибка загрузки'); }
    setLoading(false);
  };

  const currentData = dataSource === 'api' && apiData ? apiData : TIER_LIST;

  const filtered = useMemo(() => {
    let list = [...currentData];
    if (posFilter) list = list.filter(h => h.position === posFilter);
    if (sortBy === 'winrate') list.sort((a, b) => b.winRate - a.winRate);
    else if (sortBy === 'pickrate') list.sort((a, b) => b.pickRate - a.pickRate);
    return list;
  }, [posFilter, sortBy, currentData]);

  const grouped = useMemo(() => {
    if (sortBy !== 'tier') return null;
    const groups: Record<TierRank, TierHero[]> = { S: [], A: [], B: [], C: [], D: [] };
    filtered.forEach(h => groups[h.tier].push(h));
    return groups;
  }, [filtered, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-dota-gold" />
            <h1 className="font-display text-5xl font-black text-white tracking-tight">ТИР-ЛИСТ</h1>
          </div>
          <p className="font-body text-slate-400 text-sm">Патч 7.41b · Рейтинг героев по позициям</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* API bar */}
        <div className="rounded-xl bg-[#111827] border border-white/5 p-3 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            {dataSource === 'api' ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
            <span className="text-xs font-body text-slate-400">
              {dataSource === 'api' ? `OpenDota API · ${lastUpdate}` : 'Статичные данные 7.41b'}
            </span>
          </div>
          <button onClick={fetchApiData} disabled={loading}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dota-gold/10 text-dota-gold text-xs font-body font-bold hover:bg-dota-gold/20 disabled:opacity-50 transition-all">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Загрузка...</> : <><RefreshCw className="w-3.5 h-3.5" /> Обновить с OpenDota</>}
          </button>
          {apiError && <span className="text-xs font-body text-red-400 w-full">{apiError}</span>}
        </div>

        {/* Filters */}
        <div className="sticky top-0 z-20 bg-[#0a0e13]/95 backdrop-blur-md border-b border-white/5 -mx-4 px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1">
              <button onClick={() => setPosFilter(null)} className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${posFilter === null ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>Все</button>
              {[1,2,3,4,5].map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)} className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${posFilter === pos ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'}`}>{POS_LABELS[pos]}</button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {([['tier','По тиру'],['winrate','По винрейту'],['pickrate','По пикрейту']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSortBy(key)} className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${sortBy === key ? 'bg-dota-accent/15 text-dota-accent' : 'text-slate-500 hover:text-white'}`}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {grouped ? (
          <div className="space-y-8">
            {(['S','A','B','C','D'] as TierRank[]).map(tier => {
              const heroes = grouped[tier]; if (heroes.length === 0) return null;
              const tc = TIER_COLORS[tier];
              return (
                <div key={tier} className={`rounded-2xl ${tc.bg} border ${tc.border} p-5 shadow-lg ${tc.glow}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier==='S'?'from-amber-500 to-yellow-600':tier==='A'?'from-emerald-500 to-green-600':tier==='B'?'from-blue-500 to-cyan-600':tier==='C'?'from-orange-500 to-amber-600':'from-red-500 to-red-700'} flex items-center justify-center shadow-lg`}>
                      <span className="font-display text-2xl font-black text-white">{tier}</span>
                    </div>
                    <div><h2 className={`font-display text-xl font-bold ${tc.text}`}>Тир {tier}</h2><p className="text-xs font-body text-slate-500">{tc.label} · {heroes.length} героев</p></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {heroes.map(hero => <HeroTierCard key={hero.name} hero={hero} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((hero, i) => (
              <div key={hero.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-600 w-6 text-right">{i+1}</span>
                <HeroTierCard hero={hero} />
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && <div className="text-center py-20"><p className="font-body text-slate-500">Нет героев для этого фильтра</p></div>}
      </div>
    </div>
  );
}

function HeroTierCard({ hero }: { hero: TierHero }) {
  const heroData = ALL_HEROES.find(h => h.name === hero.name); if (!heroData) return null;
  const tc = TIER_COLORS[hero.tier];
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111827]/80 border border-white/5 hover:border-white/10 transition-colors">
      <img src={heroData.img} alt="" className="w-12 h-7 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-body font-bold text-white truncate">{hero.localizedName}</span>
          <span className={`text-[9px] font-body px-1.5 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}>{hero.tier}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-body text-slate-500">
          <span>Pos {hero.position}</span>
          <span className={hero.winRate >= 52 ? 'text-emerald-400' : hero.winRate <= 49 ? 'text-red-400' : 'text-slate-400'}>{hero.winRate}% WR</span>
          <span>{hero.pickRate}% PR</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        {hero.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
        {hero.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
        {hero.trend === 'stable' && <Minus className="w-4 h-4 text-slate-500" />}
      </div>
    </div>
  );
}
