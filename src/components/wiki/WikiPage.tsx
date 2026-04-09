import { useState, useMemo, useEffect, useCallback } from 'react';
import { ALL_HEROES, getHeroCropImage } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero, HeroAbility } from '@/types';
import { Search, X, Shield, Swords, Users, ChevronLeft, Zap, Loader2, BookOpen, Clock, Droplets, Info } from 'lucide-react';

const ATTR_TABS = [
  { key: 'all', label: 'ВСЕ', color: '#fff' },
  { key: 'str', label: 'СИЛА', color: '#EC3D06', icon: '🔴' },
  { key: 'agi', label: 'ЛОВКОСТЬ', color: '#26E030', icon: '🟢' },
  { key: 'int', label: 'ИНТЕЛЛЕКТ', color: '#00B4F0', icon: '🔵' },
  { key: 'uni', label: 'УНИВЕРСАЛ', color: '#B8B8B8', icon: '⚪' },
];

const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com';

// ========== КЕШ СПОСОБНОСТЕЙ ==========
const abilitiesCache: Record<number, { abilities: string[]; data: Record<string, HeroAbility> }> = {};
let heroAbilitiesMap: Record<number, string[]> | null = null;
let abilityDataMap: Record<string, HeroAbility> | null = null;

async function fetchAllAbilities(): Promise<{
  heroAbilities: Record<number, string[]>;
  abilities: Record<string, HeroAbility>;
}> {
  if (heroAbilitiesMap && abilityDataMap) {
    return { heroAbilities: heroAbilitiesMap, abilities: abilityDataMap };
  }

  const [heroAbRes, abRes] = await Promise.all([
    fetch('https://api.opendota.com/api/hero_abilities'),
    fetch('https://api.opendota.com/api/constants/abilities'),
  ]);

  const heroAbilities: Record<number, string[]> = {};
  const rawHeroAb = await heroAbRes.json();

  // OpenDota возвращает { npc_dota_hero_antimage: { abilities: [...], talents: [...] }, ... }
  // Нужно маппить npc_dota_hero_name → hero id
  for (const [npcName, data] of Object.entries(rawHeroAb)) {
    const heroName = npcName.replace('npc_dota_hero_', '');
    const hero = ALL_HEROES.find(h => h.name === heroName);
    if (hero && data && (data as any).abilities) {
      heroAbilities[hero.id] = (data as any).abilities.filter(
        (a: string) => a && !a.includes('generic_hidden') && !a.includes('empty')
      );
    }
  }

  const abilities = await abRes.json();
  heroAbilitiesMap = heroAbilities;
  abilityDataMap = abilities;

  return { heroAbilities, abilities };
}

async function getHeroAbilities(heroId: number): Promise<{
  abilityNames: string[];
  abilities: Record<string, HeroAbility>;
} | null> {
  try {
    const { heroAbilities, abilities } = await fetchAllAbilities();
    const abilityNames = heroAbilities[heroId];
    if (!abilityNames) return null;
    return { abilityNames, abilities };
  } catch (err) {
    console.error('Failed to load abilities:', err);
    return null;
  }
}

// ========== WIKI PAGE ==========
export function WikiPage() {
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null);

  // Предзагрузка всех скиллов при монтировании
  useEffect(() => {
    fetchAllAbilities().catch(() => {});
  }, []);

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
    const groups: Record<string, Hero[]> = { str: [], agi: [], int: [], all: [] };
    filtered.forEach(h => {
      const key = h.primary_attr;
      if (groups[key]) groups[key].push(h);
    });
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.localized_name.localeCompare(b.localized_name)));
    return groups;
  }, [filtered, attrFilter]);

  if (selectedHero) {
    return <HeroDetail hero={selectedHero} onBack={() => setSelectedHero(null)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-6">
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight mb-2">ГЕРОИ</h1>
          <p className="font-body text-slate-400 text-base sm:text-lg">{ALL_HEROES.length} героев · Патч 7.41b · Способности из OpenDota API</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Фильтры */}
        <div className="sticky top-0 z-20 bg-[#0a0e13]/95 backdrop-blur-md border-b border-white/5 -mx-4 px-4 py-3 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-1">
              {ATTR_TABS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setAttrFilter(key)}
                  className="relative px-4 py-2.5 rounded-lg text-sm font-body font-bold uppercase tracking-wider transition-all duration-200"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск героя..."
                className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-body text-base placeholder:text-slate-600 focus:border-white/20 focus:outline-none transition-colors"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
            </div>
          </div>
        </div>

        {/* Сетка героев */}
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
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                    <h2 className="font-display text-xl font-bold tracking-wider" style={{ color }}>{label}</h2>
                    <span className="text-sm font-body text-slate-600">{grouped[key].length}</span>
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
            <p className="font-body text-slate-500 text-xl">Герой не найден</p>
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
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1.5">
      {heroes.map(hero => (
        <button
          key={hero.id}
          onClick={() => onSelect(hero)}
          onMouseEnter={() => onHover(hero)}
          onMouseLeave={() => onHover(null)}
          className="group relative aspect-[7/9] rounded-lg overflow-hidden transition-all duration-200 hover:z-10 hover:scale-110 hover:shadow-2xl hover:shadow-black/60"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div
            className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full opacity-80"
            style={{ backgroundColor: getAttrColor(hero.primary_attr) }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-1.5">
            <span className="text-[10px] sm:text-[11px] font-body font-bold text-white leading-tight block truncate text-center drop-shadow-lg">
              {hero.localized_name}
            </span>
          </div>
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 2px ${getAttrColor(hero.primary_attr)}80` }}
          />
        </button>
      ))}
    </div>
  );
}

// ========== HERO DETAIL ==========
function HeroDetail({ hero, onBack }: { hero: Hero; onBack: () => void }) {
  const [tab, setTab] = useState<'abilities' | 'counters' | 'synergy'>('abilities');

  // Загрузка способностей
  const [abilities, setAbilities] = useState<{ names: string[]; data: Record<string, HeroAbility> } | null>(null);
  const [abilitiesLoading, setAbilitiesLoading] = useState(true);
  const [abilitiesError, setAbilitiesError] = useState(false);

  useEffect(() => {
    setAbilitiesLoading(true);
    setAbilitiesError(false);
    getHeroAbilities(hero.id).then(result => {
      if (result) {
        setAbilities({ names: result.abilityNames, data: result.abilities });
      } else {
        setAbilitiesError(true);
      }
      setAbilitiesLoading(false);
    });
  }, [hero.id]);

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

  // Фильтруем скиллы героя (убираем talents, generic, пустые)
  const heroAbilities = useMemo(() => {
    if (!abilities) return [];
    return abilities.names
      .filter(name => {
        if (!name || name.includes('empty') || name.includes('generic_hidden') || name.includes('talent')) return false;
        const data = abilities.data[name];
        if (!data || !data.dname) return false;
        return true;
      })
      .map(name => ({ key: name, ...abilities.data[name] }));
  }, [abilities]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-base font-body text-slate-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" /> Все герои
      </button>

      {/* Hero header */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="relative h-60 sm:h-80">
          <img src={hero.img} alt="" className="w-full h-full object-cover object-top scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-[#0a0e13]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e13]/80 via-transparent to-[#0a0e13]/80" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getAttrColor(hero.primary_attr) }} />
              <span className="text-sm font-body uppercase tracking-[0.2em] font-bold" style={{ color: getAttrColor(hero.primary_attr) }}>
                {getAttrLabel(hero.primary_attr)} · {hero.attack_type}
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight">{hero.localized_name}</h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {hero.roles.map(role => (
                <span key={role} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-xs font-body text-slate-300 uppercase tracking-wider font-semibold">{role}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[#111827] border border-white/5 w-fit">
        <button onClick={() => setTab('abilities')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-body font-bold transition-all ${tab === 'abilities' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-white'}`}>
          <BookOpen className="w-5 h-5" /> Способности
        </button>
        <button onClick={() => setTab('counters')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-body font-bold transition-all ${tab === 'counters' ? 'bg-dota-accent/15 text-dota-accent' : 'text-slate-500 hover:text-white'}`}>
          <Swords className="w-5 h-5" /> Матчапы
        </button>
        <button onClick={() => setTab('synergy')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-body font-bold transition-all ${tab === 'synergy' ? 'bg-green-500/15 text-green-400' : 'text-slate-500 hover:text-white'}`}>
          <Users className="w-5 h-5" /> Синергии
        </button>
      </div>

      {/* ===== ABILITIES TAB ===== */}
      {tab === 'abilities' && (
        <div>
          {abilitiesLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="text-base font-body text-slate-400">Загрузка способностей из OpenDota API...</span>
            </div>
          )}

          {abilitiesError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center">
              <p className="text-base font-body text-red-400">Не удалось загрузить способности. Проверьте подключение к интернету.</p>
            </div>
          )}

          {!abilitiesLoading && !abilitiesError && heroAbilities.length > 0 && (
            <div className="space-y-4">
              {heroAbilities.map((ability, i) => (
                <AbilityCard key={ability.key || i} ability={ability} index={i} />
              ))}
            </div>
          )}

          {!abilitiesLoading && !abilitiesError && heroAbilities.length === 0 && (
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-8 text-center">
              <p className="text-base font-body text-slate-500">Данные о способностях не найдены для этого героя.</p>
            </div>
          )}
        </div>
      )}

      {/* ===== COUNTERS TAB ===== */}
      {tab === 'counters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-[#111827] border border-green-500/15 p-6">
            <div className="flex items-center gap-2 mb-5"><Shield className="w-6 h-6 text-green-400" /><h3 className="font-display text-xl font-bold text-white">Хорош против</h3></div>
            {counters.length > 0 ? <div className="space-y-1.5">{counters.slice(0, 10).map(({ hero: h, advantage }) => <MatchupRow key={h.id} hero={h} score={advantage} positive />)}</div> : <p className="text-base font-body text-slate-500">Нет явных контрпиков</p>}
          </div>
          <div className="rounded-2xl bg-[#111827] border border-red-500/15 p-6">
            <div className="flex items-center gap-2 mb-5"><Zap className="w-6 h-6 text-red-400" /><h3 className="font-display text-xl font-bold text-white">Слаб против</h3></div>
            {counteredBy.length > 0 ? <div className="space-y-1.5">{counteredBy.slice(0, 10).map(({ hero: h, advantage }) => <MatchupRow key={h.id} hero={h} score={Math.abs(advantage)} positive={false} />)}</div> : <p className="text-base font-body text-slate-500">Нет явных контрпиков</p>}
          </div>
        </div>
      )}

      {/* ===== SYNERGY TAB ===== */}
      {tab === 'synergy' && (
        <div className="rounded-2xl bg-[#111827] border border-blue-500/15 p-6">
          <div className="flex items-center gap-2 mb-5"><Users className="w-6 h-6 text-blue-400" /><h3 className="font-display text-xl font-bold text-white">Лучшие союзники</h3></div>
          {synergies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{synergies.slice(0, 12).map(({ hero: h, score }) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <img src={h.icon} alt="" className="w-9 h-9 rounded-lg" />
                <span className="text-base font-body font-medium text-white flex-1 truncate">{h.localized_name}</span>
                <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">+{score.toFixed(1)}</span>
              </div>
            ))}</div>
          ) : <p className="text-base font-body text-slate-500">Нет данных о синергиях</p>}
        </div>
      )}
    </div>
  );
}

// ========== ABILITY CARD ==========
function AbilityCard({ ability, index }: { ability: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const imgUrl = ability.img
    ? `${ABILITY_CDN}${ability.img}`
    : '';

  const manaCost = Array.isArray(ability.mc) ? ability.mc.join(' / ') : '';
  const cooldown = Array.isArray(ability.cd) ? ability.cd.join(' / ') : '';

  const behavior = Array.isArray(ability.behavior) ? ability.behavior.join(', ') : ability.behavior || '';

  // Тип урона — цвет
  const dmgColor = ability.dmg_type === 'Magical' ? '#00B4F0'
    : ability.dmg_type === 'Physical' ? '#EC3D06'
    : ability.dmg_type === 'Pure' ? '#f0c040'
    : '#9ca3af';

  const dmgLabel = ability.dmg_type === 'Magical' ? 'Магический'
    : ability.dmg_type === 'Physical' ? 'Физический'
    : ability.dmg_type === 'Pure' ? 'Чистый'
    : '';

  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#0d1117] border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        {/* Иконка способности */}
        <div className="relative flex-shrink-0">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={ability.dname}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white/10 object-cover shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white/10 bg-white/5 flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-600" />
            </div>
          )}
          {/* Номер способности */}
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-black">{index + 1}</span>
          </div>
        </div>

        {/* Инфо */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 truncate">{ability.dname}</h3>
          <p className="text-sm font-body text-slate-400 line-clamp-2 leading-relaxed">{ability.desc}</p>
        </div>

        {/* Мана и КД */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          {manaCost && (
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-mono font-bold text-blue-300">{manaCost}</span>
            </div>
          )}
          {cooldown && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-mono font-bold text-amber-300">{cooldown}</span>
            </div>
          )}
        </div>

        <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? '-rotate-90' : ''}`} />
      </button>

      {/* Развёрнутая инфо */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
          {/* Мана/КД на мобиле */}
          <div className="flex sm:hidden items-center gap-4">
            {manaCost && (
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono font-bold text-blue-300">{manaCost}</span>
              </div>
            )}
            {cooldown && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono font-bold text-amber-300">{cooldown}</span>
              </div>
            )}
          </div>

          {/* Полное описание */}
          <p className="text-base font-body text-slate-300 leading-relaxed">{ability.desc}</p>

          {/* Теги */}
          <div className="flex flex-wrap gap-2">
            {behavior && (
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-body text-slate-400 uppercase tracking-wider">
                {behavior}
              </span>
            )}
            {dmgLabel && (
              <span className="px-3 py-1.5 rounded-full border text-xs font-body font-bold uppercase tracking-wider"
                style={{ borderColor: dmgColor + '40', color: dmgColor, backgroundColor: dmgColor + '10' }}>
                {dmgLabel} урон
              </span>
            )}
            {ability.bkbpierce === 'Yes' && (
              <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-body text-amber-400 font-bold uppercase tracking-wider">
                Пробивает BKB
              </span>
            )}
          </div>

          {/* Атрибуты */}
          {ability.attrib && ability.attrib.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ability.attrib.filter((a: any) => a.header && a.value).map((attr: any, j: number) => (
                <div key={j} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3">
                  <span className="text-sm font-body text-slate-500">{attr.header.replace(/:$/, '')}</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {Array.isArray(attr.value) ? attr.value.join(' / ') : attr.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Лор */}
          {ability.lore && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Info className="w-4 h-4 text-amber-500/60 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-body text-amber-200/60 italic leading-relaxed">{ability.lore}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== MATCHUP ROW ==========
function MatchupRow({ hero, score, positive }: { hero: Hero; score: number; positive: boolean }) {
  const barWidth = Math.min(100, (score / 5) * 100);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
      <img src={hero.icon} alt="" className="w-8 h-8 rounded-lg" />
      <span className="text-base font-body text-white flex-1 truncate">{hero.localized_name}</span>
      <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${positive ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${barWidth}%` }} />
      </div>
      <span className={`text-sm font-mono font-bold w-10 text-right ${positive ? 'text-green-400' : 'text-red-400'}`}>{positive ? '+' : '-'}{score.toFixed(1)}</span>
    </div>
  );
}
