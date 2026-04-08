import { useState, useMemo } from 'react';
import { ALL_HEROES, getHeroCropImage } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Search, X, Shield, Swords, Users, ChevronLeft, Zap } from 'lucide-react';

const ATTR_TABS = [
  { key: 'all', label: 'ВСЕ ГЕРОИ', color: '#fff' },
  { key: 'str', label: 'СИЛА', color: '#EC3D06', icon: '🔴' },
  { key: 'agi', label: 'ЛОВКОСТЬ', color: '#26E030', icon: '🟢' },
  { key: 'int', label: 'ИНТЕЛЛЕКТ', color: '#00B4F0', icon: '🔵' },
  { key: 'uni', label: 'УНИВЕРСАЛ', color: '#B8B8B8', icon: '⚪' },
];

export function WikiPage() {
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null);

  const filtered = useMemo(() => {
    return ALL_HEROES.filter(h => {
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter === 'uni') return h.primary_attr === 'all';
      if (attrFilter !== 'all' && h.primary_attr !== attrFilter) return false;
      return true;
    });
  }, [search, attrFilter]);

  // Group by attribute for "all" view
  const grouped = useMemo(() => {
    if (attrFilter !== 'all') return null;
    const groups: Record<string, Hero[]> = { str: [], agi: [], int: [], all: [] };
    filtered.forEach(h => {
      const key = h.primary_attr;
      if (groups[key]) groups[key].push(h);
    });
    // Sort each group alphabetically
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.localized_name.localeCompare(b.localized_name)));
    return groups;
  }, [filtered, attrFilter]);

  if (selectedHero) {
    return <HeroDetail hero={selectedHero} onBack={() => setSelectedHero(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header — dark cinematic like dota2.com */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
          <h1 className="font-display text-5xl font-black text-white tracking-tight mb-1">ГЕРОИ</h1>
          <p className="font-body text-slate-400 text-sm">{ALL_HEROES.length} героев · Патч 7.41b</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Attribute tabs — like dota2.com horizontal pills */}
        <div className="sticky top-0 z-20 bg-[#0a0e13]/95 backdrop-blur-md border-b border-white/5 -mx-4 px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1">
              {ATTR_TABS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setAttrFilter(key)}
                  className="relative px-4 py-2 rounded-lg text-xs font-body font-bold uppercase tracking-wider transition-all duration-200"
                  style={{
                    backgroundColor: attrFilter === key ? color + '18' : 'transparent',
                    color: attrFilter === key ? color : '#64748b',
                    borderBottom: attrFilter === key ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-slate-600 focus:border-white/20 focus:outline-none transition-colors"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-500" /></button>}
            </div>
          </div>
        </div>

        {/* Hero grid — grouped by attribute when "all" */}
        {grouped ? (
          <div className="space-y-10">
            {[
              { key: 'str', label: 'СИЛА', color: '#EC3D06' },
              { key: 'agi', label: 'ЛОВКОСТЬ', color: '#26E030' },
              { key: 'int', label: 'ИНТЕЛЛЕКТ', color: '#00B4F0' },
              { key: 'all', label: 'УНИВЕРСАЛ', color: '#B8B8B8' },
            ].map(({ key, label, color }) => (
              grouped[key]?.length > 0 && (
                <div key={key}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <h2 className="font-display text-lg font-bold tracking-wider" style={{ color }}>{label}</h2>
                    <span className="text-xs font-body text-slate-600">{grouped[key].length}</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}30, transparent)` }} />
                  </div>
                  <HeroGrid heroes={grouped[key]} onSelect={setSelectedHero} onHover={setHoveredHero} hoveredHero={hoveredHero} />
                </div>
              )
            ))}
          </div>
        ) : (
          <HeroGrid
            heroes={filtered.sort((a, b) => a.localized_name.localeCompare(b.localized_name))}
            onSelect={setSelectedHero}
            onHover={setHoveredHero}
            hoveredHero={hoveredHero}
          />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-slate-500 text-lg">Герой не найден</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== HERO GRID ==========
function HeroGrid({ heroes, onSelect, onHover, hoveredHero }: {
  heroes: Hero[];
  onSelect: (h: Hero) => void;
  onHover: (h: Hero | null) => void;
  hoveredHero: Hero | null;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
      {heroes.map(hero => (
        <button
          key={hero.id}
          onClick={() => onSelect(hero)}
          onMouseEnter={() => onHover(hero)}
          onMouseLeave={() => onHover(null)}
          className="group relative aspect-[7/9] rounded-md overflow-hidden transition-all duration-200 hover:z-10 hover:scale-110 hover:shadow-2xl hover:shadow-black/60"
          style={{
            opacity: hoveredHero && hoveredHero.id !== hero.id ? 0.4 : 1,
            transition: 'opacity 0.2s, transform 0.2s',
          }}
        >
          <img
            src={hero.img}
            alt={hero.localized_name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
          {/* Gradient overlay — always visible at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Attr indicator */}
          <div
            className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full opacity-80"
            style={{ backgroundColor: getAttrColor(hero.primary_attr) }}
          />

          {/* Name — always visible */}
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <span className="text-[9px] sm:text-[10px] font-body font-semibold text-white leading-tight block truncate text-center drop-shadow-lg">
              {hero.localized_name}
            </span>
          </div>

          {/* Hover glow border */}
          <div
            className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 2px ${getAttrColor(hero.primary_attr)}80`,
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ========== HERO DETAIL ==========
function HeroDetail({ hero, onBack }: { hero: Hero; onBack: () => void }) {
  const [tab, setTab] = useState<'counters' | 'synergy'>('counters');

  const matchups = useMemo(() => {
    return ALL_HEROES.filter(h => h.id !== hero.id)
      .map(h => ({ hero: h, advantage: getHeroAdvantage(hero, h) }))
      .sort((a, b) => b.advantage - a.advantage);
  }, [hero]);

  const counters = matchups.filter(m => m.advantage >= 1.5);
  const counteredBy = matchups.filter(m => m.advantage <= -1.5).sort((a, b) => a.advantage - b.advantage);

  const synergies = useMemo(() => {
    return ALL_HEROES.filter(h => h.id !== hero.id)
      .map(h => ({ hero: h, score: getHeroSynergy(hero, h) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [hero]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-body text-slate-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Все герои
      </button>

      {/* Hero header — cinematic */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="relative h-56 sm:h-72">
          <img src={hero.img} alt="" className="w-full h-full object-cover object-top scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-[#0a0e13]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e13]/80 via-transparent to-[#0a0e13]/80" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getAttrColor(hero.primary_attr) }} />
              <span className="text-xs font-body uppercase tracking-[0.2em] font-bold" style={{ color: getAttrColor(hero.primary_attr) }}>
                {getAttrLabel(hero.primary_attr)} · {hero.attack_type}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">{hero.localized_name}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {hero.roles.map(role => (
                <span key={role} className="px-3 py-1 rounded-full bg-white/8 border border-white/10 text-[11px] font-body text-slate-300 uppercase tracking-wider">{role}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[#111827] border border-white/5 w-fit">
        <button onClick={() => setTab('counters')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-bold transition-all ${tab === 'counters' ? 'bg-dota-accent/15 text-dota-accent' : 'text-slate-500 hover:text-white'}`}>
          <Swords className="w-4 h-4" /> Матчапы
        </button>
        <button onClick={() => setTab('synergy')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-bold transition-all ${tab === 'synergy' ? 'bg-green-500/15 text-green-400' : 'text-slate-500 hover:text-white'}`}>
          <Users className="w-4 h-4" /> Синергии
        </button>
      </div>

      {tab === 'counters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#111827] border border-green-500/15 p-5">
            <div className="flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-green-400" /><h3 className="font-display text-lg font-bold text-white">Хорош против</h3></div>
            {counters.length > 0 ? <div className="space-y-1">{counters.slice(0, 10).map(({ hero: h, advantage }) => <MatchupRow key={h.id} hero={h} score={advantage} positive />)}</div> : <p className="text-sm font-body text-slate-500">Нет явных контрпиков</p>}
          </div>
          <div className="rounded-2xl bg-[#111827] border border-red-500/15 p-5">
            <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-red-400" /><h3 className="font-display text-lg font-bold text-white">Слаб против</h3></div>
            {counteredBy.length > 0 ? <div className="space-y-1">{counteredBy.slice(0, 10).map(({ hero: h, advantage }) => <MatchupRow key={h.id} hero={h} score={Math.abs(advantage)} positive={false} />)}</div> : <p className="text-sm font-body text-slate-500">Нет явных контрпиков</p>}
          </div>
        </div>
      )}

      {tab === 'synergy' && (
        <div className="rounded-2xl bg-[#111827] border border-blue-500/15 p-5">
          <div className="flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-blue-400" /><h3 className="font-display text-lg font-bold text-white">Лучшие союзники</h3></div>
          {synergies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">{synergies.slice(0, 12).map(({ hero: h, score }) => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <img src={h.icon} alt="" className="w-8 h-8 rounded-lg" />
                <span className="text-sm font-body font-medium text-white flex-1 truncate">{h.localized_name}</span>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">+{score.toFixed(1)}</span>
              </div>
            ))}</div>
          ) : <p className="text-sm font-body text-slate-500">Нет данных о синергиях</p>}
        </div>
      )}
    </div>
  );
}

function MatchupRow({ hero, score, positive }: { hero: Hero; score: number; positive: boolean }) {
  const barWidth = Math.min(100, (score / 5) * 100);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
      <img src={hero.icon} alt="" className="w-7 h-7 rounded-lg" />
      <span className="text-sm font-body text-white flex-1 truncate">{hero.localized_name}</span>
      <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${positive ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${barWidth}%` }} />
      </div>
      <span className={`text-xs font-mono font-bold w-8 text-right ${positive ? 'text-green-400' : 'text-red-400'}`}>{positive ? '+' : '-'}{score.toFixed(1)}</span>
    </div>
  );
}
