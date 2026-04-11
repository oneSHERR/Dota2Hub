import { useState, useMemo, useEffect } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Search, X, ChevronLeft, BookOpen, Swords, Users, Package, BarChart3 } from 'lucide-react';
import { HeroSkills } from './HeroSkills';
import { HeroBuilds } from './HeroBuilds';
import { HeroMatchups } from './HeroMatchups';
import { HeroStats } from './HeroStats';

const HERO_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes';
function heroCrop(name: string) { return `${HERO_CDN}/crops/${name}.png`; }
function heroImg(name: string) { return `${HERO_CDN}/${name}.png`; }

const ATTR_ICONS: Record<string, string> = {
  str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
  agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
  int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  all: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png',
};

function AttrIcon({ attr, size = 16 }: { attr: string; size?: number }) {
  return <img src={ATTR_ICONS[attr] || ATTR_ICONS.all} alt={getAttrLabel(attr)} className="inline-block" style={{ width: size, height: size }} />;
}

const ATTR_TABS = [
  { key: 'all', label: 'ВСЕ', color: '#fff', attr: '' },
  { key: 'str', label: 'СИЛА', color: '#EC3D06', attr: 'str' },
  { key: 'agi', label: 'ЛОВКОСТЬ', color: '#26E030', attr: 'agi' },
  { key: 'int', label: 'ИНТЕЛЛЕКТ', color: '#00B4F0', attr: 'int' },
  { key: 'uni', label: 'УНИВЕРСАЛ', color: '#B8B8B8', attr: 'all' },
];

// ========== WIKI PAGE ==========
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

  const grouped = useMemo(() => {
    if (attrFilter !== 'all') return null;
    const g: Record<string, Hero[]> = { str: [], agi: [], int: [], all: [] };
    filtered.forEach(h => { if (g[h.primary_attr]) g[h.primary_attr].push(h); });
    Object.values(g).forEach(arr => arr.sort((a, b) => a.localized_name.localeCompare(b.localized_name)));
    return g;
  }, [filtered, attrFilter]);

  if (selectedHero) {
    return <HeroDetail hero={selectedHero} onBack={() => setSelectedHero(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dota-card via-dota-bg to-dota-bg" />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-dota-accent/[0.03] rounded-full blur-[150px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight mb-2">ГЕРОИ</h1>
          <p className="font-body text-slate-400">{ALL_HEROES.length} героев · Патч 7.41b · Данные из OpenDota + STRATZ</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="sticky top-16 z-20 bg-dota-bg/95 backdrop-blur-xl border-b border-dota-border/20 -mx-4 px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1">
              {ATTR_TABS.map(({ key, label, color, attr }) => (
                <button key={key} onClick={() => setAttrFilter(key)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-body font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    backgroundColor: attrFilter === key ? color + '15' : 'transparent',
                    color: attrFilter === key ? color : '#475569',
                    borderBottom: attrFilter === key ? `2px solid ${color}` : '2px solid transparent',
                  }}>
                  {attr && <AttrIcon attr={attr} size={14} />}
                  {label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-dota-card/50 border border-dota-border/20 text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-gold/20 focus:outline-none transition-all duration-300" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
            </div>
          </div>
        </div>

        {/* Hero grid */}
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
                    <AttrIcon attr={key} size={20} />
                    <h2 className="font-display text-xl font-bold tracking-wider" style={{ color }}>{label}</h2>
                    <span className="text-sm font-body text-slate-600">{grouped[key].length}</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}25, transparent)` }} />
                  </div>
                  <HeroGrid heroes={grouped[key]} onSelect={setSelectedHero} onHover={setHoveredHero} hoveredHero={hoveredHero} />
                </div>
              )
            ))}
          </div>
        ) : (
          <HeroGrid heroes={filtered.sort((a, b) => a.localized_name.localeCompare(b.localized_name))} onSelect={setSelectedHero} onHover={setHoveredHero} hoveredHero={hoveredHero} />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-slate-500 text-xl">Герой не найден</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== HERO GRID ==========
function HeroGrid({ heroes, onSelect, onHover, hoveredHero }: { heroes: Hero[]; onSelect: (h: Hero) => void; onHover: (h: Hero | null) => void; hoveredHero: Hero | null; }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5">
      {heroes.map(hero => (
        <button key={hero.id} onClick={() => onSelect(hero)} onMouseEnter={() => onHover(hero)} onMouseLeave={() => onHover(null)}
          className="group relative aspect-[7/9] rounded-xl overflow-hidden transition-all duration-200 hover:z-10 hover:scale-110 hover:shadow-2xl hover:shadow-black/60"
          style={{ opacity: hoveredHero && hoveredHero.id !== hero.id ? 0.35 : 1, transition: 'opacity 0.2s, transform 0.2s' }}>
          <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full opacity-80" style={{ backgroundColor: getAttrColor(hero.primary_attr) }} />
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <span className="text-[10px] sm:text-[11px] font-body font-bold text-white block truncate text-center drop-shadow-lg">{hero.localized_name}</span>
          </div>
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ boxShadow: `inset 0 0 0 2px ${getAttrColor(hero.primary_attr)}80` }} />
        </button>
      ))}
    </div>
  );
}

// ========== HERO DETAIL ==========
type Tab = 'abilities' | 'builds' | 'counters' | 'stats';

function HeroDetail({ hero, onBack }: { hero: Hero; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('abilities');

  const TABS: { key: Tab; label: string; icon: typeof BookOpen; activeColor: string }[] = [
    { key: 'abilities', label: 'Способности', icon: BookOpen, activeColor: 'amber' },
    { key: 'builds', label: 'Билды', icon: Package, activeColor: 'emerald' },
    { key: 'counters', label: 'Матчапы', icon: Swords, activeColor: 'red' },
    { key: 'stats', label: 'Статистика', icon: BarChart3, activeColor: 'blue' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 font-body text-slate-400 hover:text-white mb-6 transition-all duration-300">
        <ChevronLeft className="w-5 h-5" /> Все герои
      </button>

      {/* Hero Header with crop image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-dota-card/40 border border-dota-border/20">
        {/* Background blur */}
        <div className="absolute inset-0">
          <img src={heroCrop(hero.name)} alt="" className="w-full h-full object-cover scale-110 blur-xl opacity-20"
            onError={e => { (e.target as HTMLImageElement).src = heroImg(hero.name); }} />
          <div className="absolute inset-0 bg-gradient-to-r from-dota-bg via-dota-bg/80 to-dota-bg/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dota-bg via-transparent to-dota-bg/60" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
          {/* Hero crop image */}
          <div className="w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border-2 border-dota-border/30 shadow-2xl shadow-black/50 flex-shrink-0 group">
            <img src={heroCrop(hero.name)} alt={hero.localized_name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              onError={e => { (e.target as HTMLImageElement).src = heroImg(hero.name); }} />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
              <AttrIcon attr={hero.primary_attr} size={22} />
              <span className="text-sm font-body uppercase tracking-[0.2em] font-bold" style={{ color: getAttrColor(hero.primary_attr) }}>
                {getAttrLabel(hero.primary_attr)} · {hero.attack_type}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
              {hero.localized_name}
            </h1>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {hero.roles.map(role => (
                <span key={role} className="px-3 py-1 rounded-full bg-white/[0.05] border border-dota-border/20 text-xs font-body text-slate-300 uppercase tracking-wider font-semibold">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-2xl bg-dota-card/30 border border-dota-border/15 w-fit overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon, activeColor }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-bold transition-all duration-300 whitespace-nowrap ${
              tab === key
                ? `bg-${activeColor}-500/15 text-${activeColor}-400`
                : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
            }`}
            style={tab === key ? {
              backgroundColor: activeColor === 'amber' ? 'rgba(245,158,11,0.12)' :
                activeColor === 'emerald' ? 'rgba(16,185,129,0.12)' :
                activeColor === 'red' ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
              color: activeColor === 'amber' ? '#f59e0b' :
                activeColor === 'emerald' ? '#10b981' :
                activeColor === 'red' ? '#ef4444' : '#3b82f6',
            } : {}}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'abilities' && <HeroSkills heroName={hero.name} />}
        {tab === 'builds' && <HeroBuilds heroId={hero.id} heroName={hero.name} />}
        {tab === 'counters' && <HeroMatchups hero={hero} />}
        {tab === 'stats' && <HeroStats heroId={hero.id} />}
      </div>
    </div>
  );
}
