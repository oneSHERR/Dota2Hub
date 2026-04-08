import { useState, useMemo } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Search, X, Shield, Swords, Users, ChevronLeft, Zap } from 'lucide-react';

export function WikiPage() {
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);

  const filtered = useMemo(() => {
    return ALL_HEROES.filter(h => {
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter === 'all_attr' && h.primary_attr !== 'all') return false;
      if (attrFilter !== 'all' && attrFilter !== 'all_attr' && h.primary_attr !== attrFilter) return false;
      return true;
    }).sort((a, b) => a.localized_name.localeCompare(b.localized_name));
  }, [search, attrFilter]);

  if (selectedHero) {
    return <HeroDetail hero={selectedHero} onBack={() => setSelectedHero(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold gradient-text mb-2">Герои Dota 2</h1>
        <p className="font-body text-sm text-slate-400">Матчапы, контрпики и синергии для {ALL_HEROES.length} героев</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Найти героя..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-dota-card border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-accent/50 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {[
            { key: 'all', label: 'Все' },
            { key: 'str', label: 'Сила' },
            { key: 'agi', label: 'Ловкость' },
            { key: 'int', label: 'Интеллект' },
            { key: 'all_attr', label: 'Универсал' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setAttrFilter(key)}
              className={`px-4 py-2 rounded-lg text-xs font-body font-bold transition-all ${
                attrFilter === key
                  ? 'text-white shadow-lg'
                  : 'bg-dota-card text-slate-500 hover:text-slate-300'
              }`}
              style={attrFilter === key ? {
                backgroundColor: key === 'all' ? 'rgba(255,255,255,0.1)' : key === 'all_attr' ? 'rgba(200,200,200,0.15)' : getAttrColor(key) + '30',
                color: key === 'all' ? 'white' : key === 'all_attr' ? '#ccc' : getAttrColor(key),
              } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {filtered.map(hero => (
          <button
            key={hero.id}
            onClick={() => setSelectedHero(hero)}
            className="group hero-card rounded-xl overflow-hidden bg-dota-card border border-dota-border/50 hover:border-white/20"
          >
            <div className="relative aspect-[16/9]">
              <img
                src={hero.img}
                alt={hero.localized_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div
                className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-black/30"
                style={{ backgroundColor: getAttrColor(hero.primary_attr) }}
              />
            </div>
            <div className="p-1.5">
              <span className="text-[10px] sm:text-xs font-body font-medium text-white block truncate leading-tight">
                {hero.localized_name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="font-body text-slate-500">Герой не найден</span>
        </div>
      )}
    </div>
  );
}

// ========== HERO DETAIL ==========
function HeroDetail({ hero, onBack }: { hero: Hero; onBack: () => void }) {
  const [tab, setTab] = useState<'counters' | 'synergy'>('counters');

  // Calculate matchups against all heroes
  const matchups = useMemo(() => {
    return ALL_HEROES
      .filter(h => h.id !== hero.id)
      .map(h => ({
        hero: h,
        advantage: getHeroAdvantage(hero, h),
      }))
      .sort((a, b) => b.advantage - a.advantage);
  }, [hero]);

  const counters = matchups.filter(m => m.advantage >= 1.5);
  const counteredBy = matchups.filter(m => m.advantage <= -1.5).sort((a, b) => a.advantage - b.advantage);

  // Calculate synergies
  const synergies = useMemo(() => {
    return ALL_HEROES
      .filter(h => h.id !== hero.id)
      .map(h => ({
        hero: h,
        score: getHeroSynergy(hero, h),
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [hero]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-body text-slate-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Все герои
      </button>

      {/* Hero header */}
      <div className="rounded-2xl bg-dota-card border border-dota-border overflow-hidden mb-6">
        <div className="relative h-48 sm:h-64">
          <img src={hero.img} alt="" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-dota-card via-dota-card/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getAttrColor(hero.primary_attr) }}
              />
              <span className="text-xs font-body uppercase tracking-wider" style={{ color: getAttrColor(hero.primary_attr) }}>
                {getAttrLabel(hero.primary_attr)} · {hero.attack_type}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black text-white">{hero.localized_name}</h1>
          </div>
        </div>

        {/* Roles */}
        <div className="px-6 pb-5 flex flex-wrap gap-2">
          {hero.roles.map(role => (
            <span key={role} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-body text-slate-300">
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-dota-card border border-dota-border w-fit">
        <button
          onClick={() => setTab('counters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${
            tab === 'counters' ? 'bg-dota-accent/15 text-dota-accent' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Swords className="w-4 h-4" /> Матчапы
        </button>
        <button
          onClick={() => setTab('synergy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-medium transition-all ${
            tab === 'synergy' ? 'bg-green-500/15 text-green-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Синергии
        </button>
      </div>

      {tab === 'counters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Good against */}
          <div className="rounded-2xl bg-dota-card border border-green-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="font-display text-lg font-bold text-white">Хорош против</h3>
            </div>
            {counters.length > 0 ? (
              <div className="space-y-1.5">
                {counters.slice(0, 10).map(({ hero: h, advantage }) => (
                  <MatchupRow key={h.id} hero={h} score={advantage} positive />
                ))}
              </div>
            ) : (
              <p className="text-sm font-body text-slate-500">Нет явных контрпиков</p>
            )}
          </div>

          {/* Bad against */}
          <div className="rounded-2xl bg-dota-card border border-red-500/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-red-400" />
              <h3 className="font-display text-lg font-bold text-white">Слаб против</h3>
            </div>
            {counteredBy.length > 0 ? (
              <div className="space-y-1.5">
                {counteredBy.slice(0, 10).map(({ hero: h, advantage }) => (
                  <MatchupRow key={h.id} hero={h} score={Math.abs(advantage)} positive={false} />
                ))}
              </div>
            ) : (
              <p className="text-sm font-body text-slate-500">Нет явных контрпиков</p>
            )}
          </div>
        </div>
      )}

      {tab === 'synergy' && (
        <div className="rounded-2xl bg-dota-card border border-blue-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-display text-lg font-bold text-white">Лучшие союзники</h3>
          </div>
          {synergies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {synergies.slice(0, 12).map(({ hero: h, score }) => (
                <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-dota-bg/50 hover:bg-dota-bg transition-colors">
                  <img src={h.icon} alt="" className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-body font-medium text-white block truncate">{h.localized_name}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15">
                    <span className="text-xs font-mono font-bold text-blue-400">+{score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-body text-slate-500">Нет данных о синергиях</p>
          )}
        </div>
      )}
    </div>
  );
}

function MatchupRow({ hero, score, positive }: { hero: Hero; score: number; positive: boolean }) {
  const barWidth = Math.min(100, (score / 5) * 100);
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-dota-bg/50 hover:bg-dota-bg transition-colors">
      <img src={hero.icon} alt="" className="w-7 h-7 rounded-lg" />
      <span className="text-sm font-body text-white flex-1 truncate">{hero.localized_name}</span>
      <div className="w-20 h-1.5 rounded-full bg-dota-border/30 overflow-hidden">
        <div
          className={`h-full rounded-full ${positive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-8 text-right ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? '+' : '-'}{score.toFixed(1)}
      </span>
    </div>
  );
}
