import { useState, useMemo } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Calculator, Search, X, Plus, Trash2, Zap, Shield, Users, Target, ChevronRight, ArrowRight, Star } from 'lucide-react';

interface Recommendation {
  hero: Hero;
  counterScore: number;
  synergyScore: number;
  totalScore: number;
  reasons: string[];
}

const POS_ROLES: Record<number, { label: string; roles: string[]; color: string }> = {
  1: { label: 'Carry', roles: ['Carry'], color: 'text-dota-gold' },
  2: { label: 'Mid', roles: ['Nuker', 'Escape', 'Carry'], color: 'text-blue-400' },
  3: { label: 'Offlane', roles: ['Initiator', 'Durable', 'Disabler'], color: 'text-red-400' },
  4: { label: 'Support 4', roles: ['Support', 'Initiator', 'Disabler'], color: 'text-purple-400' },
  5: { label: 'Support 5', roles: ['Support'], color: 'text-emerald-400' },
};

function getRecommendations(
  enemies: Hero[],
  allies: Hero[],
  position: number | null
): Recommendation[] {
  const usedIds = new Set([...enemies.map(h => h.id), ...allies.map(h => h.id)]);
  const available = ALL_HEROES.filter(h => !usedIds.has(h.id));

  return available.map(hero => {
    // Counter score: how well this hero counters all enemies
    let counterScore = 0;
    const reasons: string[] = [];

    for (const enemy of enemies) {
      const adv = getHeroAdvantage(hero, enemy);
      counterScore += adv;
      if (adv >= 2.5) reasons.push(`Контрит ${enemy.localized_name} (+${adv.toFixed(1)})`);
      if (adv <= -2.5) reasons.push(`Слаб против ${enemy.localized_name} (${adv.toFixed(1)})`);
    }

    // Synergy with allies
    let synergyScore = 0;
    for (const ally of allies) {
      const syn = getHeroSynergy(hero, ally);
      synergyScore += syn;
      if (syn >= 2) reasons.push(`Синергия с ${ally.localized_name} (+${syn.toFixed(1)})`);
    }

    // Position fit bonus
    let posFit = 0;
    if (position) {
      const wantedRoles = POS_ROLES[position]?.roles || [];
      for (const role of hero.roles) {
        if (wantedRoles.includes(role)) posFit += 1.5;
      }
    }

    const totalScore = counterScore * 2 + synergyScore * 1.5 + posFit;

    return { hero, counterScore, synergyScore, totalScore, reasons };
  })
  .sort((a, b) => b.totalScore - a.totalScore);
}

export function DraftCalculatorPage() {
  const [enemies, setEnemies] = useState<Hero[]>([]);
  const [allies, setAllies] = useState<Hero[]>([]);
  const [search, setSearch] = useState('');
  const [selectingFor, setSelectingFor] = useState<'enemy' | 'ally' | null>(null);
  const [posFilter, setPosFilter] = useState<number | null>(null);
  const [attrFilter, setAttrFilter] = useState('all');

  // Used hero IDs
  const usedIds = useMemo(() => {
    return new Set([...enemies.map(h => h.id), ...allies.map(h => h.id)]);
  }, [enemies, allies]);

  // Recommendations
  const recommendations = useMemo(() => {
    if (enemies.length === 0) return [];
    return getRecommendations(enemies, allies, posFilter);
  }, [enemies, allies, posFilter]);

  // Filtered heroes for selection
  const filteredHeroes = useMemo(() => {
    return ALL_HEROES
      .filter(h => {
        if (usedIds.has(h.id)) return false;
        if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (attrFilter !== 'all') {
          if (attrFilter === 'uni') return h.primary_attr === 'all';
          return h.primary_attr === attrFilter;
        }
        return true;
      })
      .sort((a, b) => a.localized_name.localeCompare(b.localized_name));
  }, [search, attrFilter, usedIds]);

  const addHero = (hero: Hero) => {
    if (selectingFor === 'enemy' && enemies.length < 5) {
      setEnemies(prev => [...prev, hero]);
    } else if (selectingFor === 'ally' && allies.length < 4) {
      setAllies(prev => [...prev, hero]);
    }
    setSelectingFor(null);
    setSearch('');
  };

  const removeEnemy = (index: number) => setEnemies(prev => prev.filter((_, i) => i !== index));
  const removeAlly = (index: number) => setAllies(prev => prev.filter((_, i) => i !== index));

  const reset = () => {
    setEnemies([]);
    setAllies([]);
    setPosFilter(null);
    setSearch('');
    setSelectingFor(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-dota-gold" />
            <h1 className="font-display text-5xl font-black text-white tracking-tight">КАЛЬКУЛЯТОР</h1>
          </div>
          <p className="font-body text-slate-400 text-sm">Введи вражеский драфт — получи лучшие контрпики</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* LEFT: Input */}
          <div className="space-y-4">
            {/* Enemy team */}
            <div className="rounded-2xl bg-[#111827] border border-red-500/15 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <h3 className="font-display text-base font-bold text-white">Враги</h3>
                  <span className="text-xs font-body text-slate-500">{enemies.length}/5</span>
                </div>
                {enemies.length > 0 && (
                  <button onClick={reset} className="text-xs font-body text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />Сброс
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {[0, 1, 2, 3, 4].map(i => {
                  const hero = enemies[i];
                  return hero ? (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <img src={hero.icon} alt="" className="w-7 h-7 rounded" />
                      <span className="text-sm font-body font-bold text-white flex-1">{hero.localized_name}</span>
                      <button onClick={() => removeEnemy(i)} className="text-slate-500 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setSelectingFor('enemy')}
                      className="w-full flex items-center gap-2 p-2 rounded-lg border border-dashed border-red-500/15 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left"
                    >
                      <Plus className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-body text-slate-500">Добавить врага</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ally team (optional) */}
            <div className="rounded-2xl bg-[#111827] border border-emerald-500/15 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="font-display text-base font-bold text-white">Союзники</h3>
                <span className="text-xs font-body text-slate-500">{allies.length}/4 · необязательно</span>
              </div>

              <div className="space-y-1.5">
                {allies.map((hero, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <img src={hero.icon} alt="" className="w-7 h-7 rounded" />
                    <span className="text-sm font-body font-bold text-white flex-1">{hero.localized_name}</span>
                    <button onClick={() => removeAlly(i)} className="text-slate-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {allies.length < 4 && (
                  <button onClick={() => setSelectingFor('ally')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg border border-dashed border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-body text-slate-500">Добавить союзника</span>
                  </button>
                )}
              </div>
            </div>

            {/* Position filter */}
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
              <span className="text-xs font-body text-slate-500 block mb-2">Фильтр по позиции</span>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setPosFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${
                    posFilter === null ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                  }`}>Все</button>
                {[1, 2, 3, 4, 5].map(pos => (
                  <button key={pos} onClick={() => setPosFilter(pos)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-bold transition-all ${
                      posFilter === pos ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'
                    }`}>
                    {POS_ROLES[pos].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Recommendations */}
          <div>
            {enemies.length === 0 ? (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-12 text-center">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-white mb-2">Добавь вражеских героев</h3>
                <p className="text-sm font-body text-slate-400">Нажми "Добавить врага" слева, чтобы получить рекомендации контрпиков</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-dota-gold" />
                  <h3 className="font-display text-lg font-bold text-white">Лучшие пики</h3>
                  <span className="text-xs font-body text-slate-500">топ-15 рекомендаций</span>
                </div>

                {recommendations.slice(0, 15).map((rec, i) => (
                  <div key={rec.hero.id}
                    className={`rounded-xl bg-[#111827] border p-4 transition-all hover:border-white/15 ${
                      i < 3 ? 'border-dota-gold/20' : 'border-white/5'
                    }`}>
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-700/20 text-orange-400' :
                        'bg-white/5 text-slate-500'
                      }`}>
                        {i + 1}
                      </div>

                      {/* Hero */}
                      <img src={rec.hero.img} alt="" className="w-14 h-9 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-body font-bold text-white">{rec.hero.localized_name}</span>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getAttrColor(rec.hero.primary_attr) }} />
                        </div>
                        <span className="text-[10px] font-body text-slate-500">{rec.hero.roles.slice(0, 3).join(' · ')}</span>
                      </div>

                      {/* Scores */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <div className={`text-xs font-mono font-bold ${rec.counterScore > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {rec.counterScore > 0 ? '+' : ''}{rec.counterScore.toFixed(1)}
                          </div>
                          <div className="text-[8px] font-body text-slate-600">контр</div>
                        </div>
                        {rec.synergyScore > 0 && (
                          <div className="text-center">
                            <div className="text-xs font-mono font-bold text-blue-400">+{rec.synergyScore.toFixed(1)}</div>
                            <div className="text-[8px] font-body text-slate-600">син</div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className={`text-sm font-mono font-bold ${
                            rec.totalScore >= 15 ? 'text-amber-400' :
                            rec.totalScore >= 8 ? 'text-emerald-400' :
                            rec.totalScore >= 0 ? 'text-white' : 'text-red-400'
                          }`}>
                            {rec.totalScore.toFixed(0)}
                          </div>
                          <div className="text-[8px] font-body text-slate-600">всего</div>
                        </div>
                      </div>
                    </div>

                    {/* Reasons */}
                    {rec.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-11">
                        {rec.reasons.slice(0, 3).map((reason, j) => (
                          <span key={j} className={`text-[10px] font-body px-2 py-0.5 rounded-full ${
                            reason.includes('Контрит') ? 'bg-emerald-500/10 text-emerald-400' :
                            reason.includes('Синергия') ? 'bg-blue-500/10 text-blue-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>{reason}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero selection modal */}
        {selectingFor && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setSelectingFor(null)}>
            <div className="w-full max-w-2xl max-h-[80vh] bg-[#111827] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-bold text-white">
                    {selectingFor === 'enemy' ? '🔴 Выбери вражеского героя' : '🟢 Выбери союзника'}
                  </h3>
                  <button onClick={() => setSelectingFor(null)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." autoFocus
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-slate-600 focus:border-white/20 focus:outline-none" />
                  </div>
                  <div className="flex gap-0.5">
                    {[
                      { key: 'all', label: 'Все', color: '#fff' },
                      { key: 'str', label: 'С', color: '#EC3D06' },
                      { key: 'agi', label: 'Л', color: '#26E030' },
                      { key: 'int', label: 'И', color: '#00B4F0' },
                    ].map(({ key, label, color }) => (
                      <button key={key} onClick={() => setAttrFilter(key)}
                        className="w-8 h-8 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center"
                        style={{
                          backgroundColor: attrFilter === key ? color + '20' : 'transparent',
                          color: attrFilter === key ? color : '#475569',
                        }}>{label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
                  {filteredHeroes.map(hero => (
                    <button key={hero.id} onClick={() => addHero(hero)}
                      className="group relative aspect-[16/9] rounded-lg overflow-hidden hover:scale-110 hover:z-10 hover:shadow-xl transition-all cursor-pointer"
                      title={hero.localized_name}>
                      <img src={hero.img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="absolute bottom-0 left-0 right-0 text-[7px] font-body text-white text-center p-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                        {hero.localized_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
