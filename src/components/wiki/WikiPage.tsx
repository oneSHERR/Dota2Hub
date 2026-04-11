import { useState, useMemo } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Search, X, ChevronLeft, BookOpen, Swords, Package, BarChart3 } from 'lucide-react';
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
  { key: 'all', label: 'Все', color: '#fff', attr: '' },
  { key: 'str', label: 'Сила', color: '#EC3D06', attr: 'str' },
  { key: 'agi', label: 'Ловкость', color: '#26E030', attr: 'agi' },
  { key: 'int', label: 'Интеллект', color: '#00B4F0', attr: 'int' },
  { key: 'uni', label: 'Универсал', color: '#B8B8B8', attr: 'all' },
];

// ========== WIKI PAGE ==========
export function WikiPage() {
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

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
      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1520] via-dota-bg to-dota-bg" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-dota-accent/[0.03] rounded-full blur-[180px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[250px] bg-dota-gold/[0.02] rounded-full blur-[150px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-8">
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            ГЕРОИ
          </h1>
          <p className="font-body text-slate-500 text-base">{ALL_HEROES.length} героев · Патч 7.41b · OpenDota + STRATZ</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* ===== FILTERS ===== */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 mb-8 bg-dota-bg/90 backdrop-blur-xl border-b border-dota-border/15">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1 bg-dota-card/40 rounded-xl p-1 border border-dota-border/10">
              {ATTR_TABS.map(({ key, label, color, attr }) => {
                const active = attrFilter === key;
                return (
                  <button key={key} onClick={() => setAttrFilter(key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-body font-bold transition-all duration-200"
                    style={{
                      backgroundColor: active ? color + '12' : 'transparent',
                      color: active ? color : '#475569',
                      boxShadow: active ? `0 0 12px ${color}15` : 'none',
                    }}>
                    {attr && <AttrIcon attr={attr} size={14} />}
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="relative flex-1 max-w-xs ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-dota-card/40 border border-dota-border/15 text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-gold/20 focus:outline-none transition-all duration-300" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
            </div>
          </div>
        </div>

        {/* ===== HERO GRID ===== */}
        {grouped ? (
          <div className="space-y-12">
            {[
              { key: 'str', label: 'СИЛА', color: '#EC3D06' },
              { key: 'agi', label: 'ЛОВКОСТЬ', color: '#26E030' },
              { key: 'int', label: 'ИНТЕЛЛЕКТ', color: '#00B4F0' },
              { key: 'all', label: 'УНИВЕРСАЛ', color: '#B8B8B8' },
            ].map(({ key, label, color }) => (
              grouped[key]?.length > 0 && (
                <div key={key}>
                  <div className="flex items-center gap-3 mb-5">
                    <AttrIcon attr={key} size={22} />
                    <h2 className="font-display text-xl font-bold tracking-wider" style={{ color }}>{label}</h2>
                    <span className="text-sm font-body text-slate-600">{grouped[key].length}</span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}20, transparent)` }} />
                  </div>
                  <HeroGrid heroes={grouped[key]} onSelect={setSelectedHero} attrColor={color} />
                </div>
              )
            ))}
          </div>
        ) : (
          <HeroGrid heroes={filtered.sort((a, b) => a.localized_name.localeCompare(b.localized_name))} onSelect={setSelectedHero} />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-body text-slate-500 text-xl">Герой не найден</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== HERO GRID — Dota 2 client style ==========
function HeroGrid({ heroes, onSelect, attrColor }: { heroes: Hero[]; onSelect: (h: Hero) => void; attrColor?: string }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-13 gap-[3px]">
      {heroes.map(hero => {
        const color = attrColor || getAttrColor(hero.primary_attr);
        return (
          <button key={hero.id} onClick={() => onSelect(hero)}
            className="group relative overflow-hidden transition-all duration-300 hover:z-10 hover:-translate-y-1 focus:outline-none"
            aria-label={hero.localized_name}>
            {/* Card — 16:9 horizontal like Dota 2 client */}
            <div className="relative aspect-[16/9] rounded-md overflow-hidden border border-transparent group-hover:border-opacity-60 transition-all duration-300"
              style={{
                borderColor: 'transparent',
                boxShadow: 'none',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = color + '70';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${color}25, 0 8px 25px rgba(0,0,0,0.4)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
              <img src={heroImg(hero.name)} alt={hero.localized_name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy" />
              {/* Dark gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {/* Name below card */}
            <p className="text-[10px] font-body text-slate-500 text-center mt-1.5 truncate group-hover:text-white transition-colors duration-200 px-0.5">
              {hero.localized_name}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ========== HERO DETAIL ==========
type Tab = 'abilities' | 'builds' | 'counters' | 'stats';

function HeroDetail({ hero, onBack }: { hero: Hero; onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('abilities');
  const attrColor = getAttrColor(hero.primary_attr);

  const TABS: { key: Tab; label: string; icon: typeof BookOpen; color: string }[] = [
    { key: 'abilities', label: 'Способности', icon: BookOpen, color: '#f59e0b' },
    { key: 'builds', label: 'Билды', icon: Package, color: '#10b981' },
    { key: 'counters', label: 'Матчапы', icon: Swords, color: '#ef4444' },
    { key: 'stats', label: 'Статистика', icon: BarChart3, color: '#3b82f6' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 font-body text-slate-500 hover:text-white mb-8 transition-all duration-200 group">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Все герои
      </button>

      {/* ===== HERO HEADER with crop ===== */}
      <div className="relative rounded-2xl overflow-hidden mb-10">
        {/* Background — blurred crop */}
        <div className="absolute inset-0">
          <img src={heroCrop(hero.name)} alt="" className="w-full h-full object-cover scale-125 blur-2xl opacity-15"
            onError={e => { (e.target as HTMLImageElement).src = heroImg(hero.name); }} />
          <div className="absolute inset-0 bg-gradient-to-r from-dota-bg via-dota-bg/70 to-dota-bg/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dota-bg via-transparent to-dota-bg/50" />
        </div>

        {/* Attribute accent glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[120px] opacity-10"
          style={{ background: attrColor }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
          {/* Hero crop — tall portrait */}
          <div className="w-44 h-60 sm:w-52 sm:h-72 rounded-xl overflow-hidden flex-shrink-0 group"
            style={{
              border: `2px solid ${attrColor}30`,
              boxShadow: `0 0 30px ${attrColor}10, 0 20px 60px rgba(0,0,0,0.5)`,
            }}>
            <img src={heroCrop(hero.name)} alt={hero.localized_name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              onError={e => { (e.target as HTMLImageElement).src = heroImg(hero.name); }} />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            {/* Attribute badge */}
            <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
              <AttrIcon attr={hero.primary_attr} size={22} />
              <span className="text-sm font-body uppercase tracking-[0.2em] font-bold"
                style={{ color: attrColor }}>
                {getAttrLabel(hero.primary_attr)} · {hero.attack_type}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-5"
              style={{ textShadow: `0 0 40px ${attrColor}15` }}>
              {hero.localized_name}
            </h1>

            {/* Roles */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {hero.roles.map(role => (
                <span key={role} className="px-3 py-1 rounded-lg text-xs font-body text-slate-400 uppercase tracking-wider font-semibold"
                  style={{ background: `${attrColor}08`, border: `1px solid ${attrColor}15` }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-dota-card/30 border border-dota-border/10 w-fit overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon, color }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-bold transition-all duration-200 whitespace-nowrap"
              style={{
                backgroundColor: active ? color + '12' : 'transparent',
                color: active ? color : '#64748b',
                boxShadow: active ? `0 0 10px ${color}10` : 'none',
              }}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          );
        })}
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="page-enter" key={tab}>
        {tab === 'abilities' && <HeroSkills heroName={hero.name} />}
        {tab === 'builds' && <HeroBuilds heroId={hero.id} heroName={hero.name} />}
        {tab === 'counters' && <HeroMatchups hero={hero} />}
        {tab === 'stats' && <HeroStats heroId={hero.id} />}
      </div>
    </div>
  );
}
