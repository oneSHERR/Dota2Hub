import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero } from '@/types';
import { Calculator, Search, X, Plus, Trash2, Zap, Shield, Users, Target, ChevronRight, ArrowRight, Star, AlertTriangle, Ban, Map, Share2, History, RotateCcw, TrendingUp } from 'lucide-react';

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

// ========== WINRATE CACHE (OpenDota) ==========
let winrateCache: Record<number, number> | null = null;

async function fetchWinrates(): Promise<Record<number, number>> {
  if (winrateCache) return winrateCache;
  try {
    const res = await fetch('https://api.opendota.com/api/heroStats');
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<number, number> = {};
    for (const h of data) {
      let wins = 0, picks = 0;
      for (const r of [1,2,3,4,5,6,7,8]) {
        wins += h[`${r}_win`] || 0;
        picks += h[`${r}_pick`] || 0;
      }
      if (picks > 0) map[h.id] = wins / picks;
    }
    winrateCache = map;
    return map;
  } catch { return {}; }
}

// ========== TYPES ==========
interface Recommendation {
  hero: Hero;
  counterScore: number;
  synergyScore: number;
  totalScore: number;
  reasons: string[];
  winRate?: number;
}

interface DraftHistory {
  enemies: number[];
  allies: number[];
  timestamp: number;
}

// ========== POSITIONS ==========
const POS_ROLES: Record<number, { label: string; roles: string[]; color: string }> = {
  1: { label: 'Carry', roles: ['Carry'], color: 'text-dota-gold' },
  2: { label: 'Mid', roles: ['Nuker', 'Escape', 'Carry'], color: 'text-blue-400' },
  3: { label: 'Offlane', roles: ['Initiator', 'Durable', 'Disabler'], color: 'text-red-400' },
  4: { label: 'Support 4', roles: ['Support', 'Initiator', 'Disabler'], color: 'text-purple-400' },
  5: { label: 'Support 5', roles: ['Support'], color: 'text-emerald-400' },
};

// ========== LANE ANALYSIS ==========
interface LaneResult {
  lane: string;
  allyHeroes: Hero[];
  enemyHeroes: Hero[];
  advantage: number;
  winner: 'ally' | 'enemy' | 'even';
}

function analyzeLanes(enemies: Hero[], allies: Hero[]): LaneResult[] {
  if (enemies.length === 0) return [];
  
  const laneAssign = (h: Hero): string => {
    if (h.roles.includes('Carry') && !h.roles.includes('Support')) return 'Safe Lane';
    if (h.roles.includes('Nuker') && h.roles.includes('Escape')) return 'Mid Lane';
    if (h.roles.includes('Initiator') || h.roles.includes('Durable')) return 'Off Lane';
    if (h.roles.includes('Support')) return 'Safe Lane';
    return 'Mid Lane';
  };

  const lanes = ['Safe Lane', 'Mid Lane', 'Off Lane'];
  return lanes.map(lane => {
    const allyHeroes = allies.filter(h => laneAssign(h) === lane);
    const enemyHeroes = enemies.filter(h => {
      const eLane = laneAssign(h);
      if (lane === 'Safe Lane') return eLane === 'Off Lane' || eLane === 'Safe Lane';
      if (lane === 'Off Lane') return eLane === 'Safe Lane' || eLane === 'Off Lane';
      return eLane === lane;
    }).slice(0, 2);

    let advantage = 0;
    for (const a of allyHeroes) {
      for (const e of enemyHeroes) {
        advantage += getHeroAdvantage(a, e);
      }
    }

    return {
      lane,
      allyHeroes,
      enemyHeroes,
      advantage,
      winner: advantage > 1 ? 'ally' as const : advantage < -1 ? 'enemy' as const : 'even' as const,
    };
  });
}

// ========== DRAFT DANGERS ==========
interface DraftDanger {
  type: 'warning' | 'danger';
  message: string;
}

function analyzeDangers(enemies: Hero[]): DraftDanger[] {
  const dangers: DraftDanger[] = [];
  const allRoles = enemies.flatMap(h => h.roles);

  if (!allRoles.includes('Disabler')) dangers.push({ type: 'warning', message: 'У врага нет дизейблов — агрессивные герои сильны' });
  if (!allRoles.includes('Pusher')) dangers.push({ type: 'warning', message: 'У врага нет пуша — можно играть в лейт' });
  if (!allRoles.includes('Initiator')) dangers.push({ type: 'warning', message: 'У врага нет инициации — сплит-пуш эффективен' });
  if (allRoles.filter(r => r === 'Carry').length >= 3) dangers.push({ type: 'danger', message: 'У врага 3+ керри — давите ранний темп!' });
  if (!allRoles.includes('Support')) dangers.push({ type: 'warning', message: 'У врага нет саппорта — ранняя агрессия эффективна' });

  const rangedCount = enemies.filter(h => h.attack_type === 'Ranged').length;
  if (rangedCount >= 4) dangers.push({ type: 'warning', message: 'Много рэнж героев — берите инициаторов с гэпклозом' });

  const meleeCount = enemies.filter(h => h.attack_type === 'Melee').length;
  if (meleeCount >= 4) dangers.push({ type: 'warning', message: 'Много мили героев — AOE и кайт эффективны' });

  return dangers;
}

// ========== BAN RECOMMENDATIONS ==========
function getBanRecommendations(enemies: Hero[], allies: Hero[]): { hero: Hero; reason: string; score: number }[] {
  const usedIds = new Set([...enemies.map(h => h.id), ...allies.map(h => h.id)]);
  
  return ALL_HEROES
    .filter(h => !usedIds.has(h.id))
    .map(hero => {
      let score = 0;
      const reasons: string[] = [];

      // Кто контрит наших союзников?
      for (const ally of allies) {
        const adv = getHeroAdvantage(hero, ally);
        if (adv >= 2) {
          score += adv * 2;
          reasons.push(`Контрит ${ally.localized_name}`);
        }
      }

      // Кто хорошо сочетается с врагами?
      for (const enemy of enemies) {
        const syn = getHeroSynergy(hero, enemy);
        if (syn >= 1.5) {
          score += syn;
          reasons.push(`Синергия с ${enemy.localized_name}`);
        }
      }

      return { hero, reason: reasons[0] || 'Потенциально опасен', score };
    })
    .filter(b => b.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ========== RECOMMENDATIONS ==========
function getRecommendations(enemies: Hero[], allies: Hero[], position: number | null, winrates: Record<number, number>): Recommendation[] {
  const usedIds = new Set([...enemies.map(h => h.id), ...allies.map(h => h.id)]);
  const available = ALL_HEROES.filter(h => !usedIds.has(h.id));

  return available.map(hero => {
    let counterScore = 0;
    const reasons: string[] = [];

    for (const enemy of enemies) {
      const adv = getHeroAdvantage(hero, enemy);
      counterScore += adv;
      if (adv >= 2.5) reasons.push(`Контрит ${enemy.localized_name} (+${adv.toFixed(1)})`);
      if (adv <= -2.5) reasons.push(`Слаб против ${enemy.localized_name} (${adv.toFixed(1)})`);
    }

    let synergyScore = 0;
    for (const ally of allies) {
      const syn = getHeroSynergy(hero, ally);
      synergyScore += syn;
      if (syn >= 2) reasons.push(`Синергия с ${ally.localized_name} (+${syn.toFixed(1)})`);
    }

    let posFit = 0;
    if (position) {
      const wantedRoles = POS_ROLES[position]?.roles || [];
      for (const role of hero.roles) {
        if (wantedRoles.includes(role)) posFit += 1.5;
      }
    }

    const totalScore = counterScore * 2 + synergyScore * 1.5 + posFit;
    const winRate = winrates[hero.id];

    return { hero, counterScore, synergyScore, totalScore, reasons, winRate };
  })
  .sort((a, b) => b.totalScore - a.totalScore);
}

// ========== HEAT COLOR ==========
function heatColor(score: number, max: number = 20): string {
  const pct = Math.max(0, Math.min(1, (score + max) / (max * 2)));
  if (pct > 0.6) return `hsl(${Math.round((pct - 0.5) * 240)}, 80%, 55%)`;
  if (pct < 0.4) return `hsl(0, 80%, ${40 + pct * 30}%)`;
  return '#64748b';
}

// ========== DRAFT HISTORY ==========
function loadHistory(): DraftHistory[] {
  try { return JSON.parse(localStorage.getItem('dota_calc_history') || '[]'); } catch { return []; }
}
function saveHistory(h: DraftHistory[]) {
  try { localStorage.setItem('dota_calc_history', JSON.stringify(h.slice(0, 5))); } catch {}
}

// ========== MAIN COMPONENT ==========
export function DraftCalculatorPage() {
  const [enemies, setEnemies] = useState<Hero[]>([]);
  const [allies, setAllies] = useState<Hero[]>([]);
  const [search, setSearch] = useState('');
  const [selectingFor, setSelectingFor] = useState<'enemy' | 'ally' | null>(null);
  const [posFilter, setPosFilter] = useState<number | null>(null);
  const [attrFilter, setAttrFilter] = useState('all');
  const [winrates, setWinrates] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'picks' | 'bans' | 'lanes' | 'dangers'>('picks');
  const [history, setHistory] = useState<DraftHistory[]>(loadHistory());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Загрузка винрейтов
  useEffect(() => { fetchWinrates().then(setWinrates); }, []);

  // Чтение драфта из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('e');
    const a = params.get('a');
    if (e) {
      const ids = e.split(',').map(Number);
      setEnemies(ids.map(id => ALL_HEROES.find(h => h.id === id)).filter(Boolean) as Hero[]);
    }
    if (a) {
      const ids = a.split(',').map(Number);
      setAllies(ids.map(id => ALL_HEROES.find(h => h.id === id)).filter(Boolean) as Hero[]);
    }
  }, []);

  const usedIds = useMemo(() => new Set([...enemies.map(h => h.id), ...allies.map(h => h.id)]), [enemies, allies]);
  const recommendations = useMemo(() => enemies.length === 0 ? [] : getRecommendations(enemies, allies, posFilter, winrates), [enemies, allies, posFilter, winrates]);
  const banRecs = useMemo(() => getBanRecommendations(enemies, allies), [enemies, allies]);
  const lanes = useMemo(() => analyzeLanes(enemies, allies), [enemies, allies]);
  const dangers = useMemo(() => analyzeDangers(enemies), [enemies]);

  const filteredHeroes = useMemo(() => {
    return ALL_HEROES.filter(h => {
      if (usedIds.has(h.id)) return false;
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter !== 'all') {
        if (attrFilter === 'uni') return h.primary_attr === 'all';
        return h.primary_attr === attrFilter;
      }
      return true;
    }).sort((a, b) => a.localized_name.localeCompare(b.localized_name));
  }, [search, attrFilter, usedIds]);

  const addHero = useCallback((hero: Hero) => {
    if (selectingFor === 'enemy' && enemies.length < 5) setEnemies(prev => [...prev, hero]);
    else if (selectingFor === 'ally' && allies.length < 5) setAllies(prev => [...prev, hero]);
    setSelectingFor(null);
    setSearch('');
  }, [selectingFor, enemies.length, allies.length]);

  // Quick Enter: первый герой из фильтра
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredHeroes.length > 0) {
      addHero(filteredHeroes[0]);
    }
  };

  const removeEnemy = (i: number) => setEnemies(prev => prev.filter((_, idx) => idx !== i));
  const removeAlly = (i: number) => setAllies(prev => prev.filter((_, idx) => idx !== i));

  const reset = () => { setEnemies([]); setAllies([]); setPosFilter(null); setSearch(''); setSelectingFor(null); };

  // Сохранение в историю
  const saveDraft = () => {
    if (enemies.length === 0) return;
    const entry: DraftHistory = { enemies: enemies.map(h => h.id), allies: allies.map(h => h.id), timestamp: Date.now() };
    const updated = [entry, ...history.filter(h => JSON.stringify(h.enemies) !== JSON.stringify(entry.enemies))].slice(0, 5);
    setHistory(updated);
    saveHistory(updated);
  };

  const loadDraft = (h: DraftHistory) => {
    setEnemies(h.enemies.map(id => ALL_HEROES.find(x => x.id === id)).filter(Boolean) as Hero[]);
    setAllies(h.allies.map(id => ALL_HEROES.find(x => x.id === id)).filter(Boolean) as Hero[]);
  };

  // Шаринг
  const shareDraft = () => {
    const params = new URLSearchParams();
    if (enemies.length) params.set('e', enemies.map(h => h.id).join(','));
    if (allies.length) params.set('a', allies.map(h => h.id).join(','));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard?.writeText(url);
    alert('Ссылка скопирована!');
  };

  // Auto-save on enemy change
  useEffect(() => { if (enemies.length >= 3) saveDraft(); }, [enemies]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-dota-gold" />
            <h1 className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">КАЛЬКУЛЯТОР</h1>
          </div>
          <p className="font-body text-slate-400 text-base">Введи вражеский драфт — получи контрпики, баны, анализ линий и опасности</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
          {/* ===== LEFT: INPUT ===== */}
          <div className="space-y-4">
            {/* Enemy team */}
            <div className="rounded-2xl bg-[#111827] border border-red-500/15 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <h3 className="font-display text-lg font-bold text-white">Враги</h3>
                  <span className="text-sm font-body text-slate-500">{enemies.length}/5</span>
                </div>
                <div className="flex gap-2">
                  {enemies.length > 0 && (
                    <>
                      <button onClick={shareDraft} className="text-xs font-body text-slate-500 hover:text-blue-400 transition-colors" title="Поделиться">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={reset} className="text-xs font-body text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />Сброс
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                {[0,1,2,3,4].map(i => {
                  const hero = enemies[i];
                  return hero ? (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                      <img src={hero.icon} alt="" className="w-8 h-8 rounded" />
                      <AttrIcon attr={hero.primary_attr} size={14} />
                      <span className="text-sm font-body font-bold text-white flex-1">{hero.localized_name}</span>
                      {winrates[hero.id] && <span className="text-xs font-mono text-slate-500">{(winrates[hero.id]*100).toFixed(1)}%</span>}
                      <button onClick={() => removeEnemy(i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button key={i} onClick={() => setSelectingFor('enemy')}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-red-500/15 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-left">
                      <Plus className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-body text-slate-500">Добавить врага</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ally team */}
            <div className="rounded-2xl bg-[#111827] border border-emerald-500/15 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="font-display text-lg font-bold text-white">Союзники</h3>
                <span className="text-sm font-body text-slate-500">{allies.length}/5 · необязательно</span>
              </div>
              <div className="space-y-1.5">
                {allies.map((hero, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <img src={hero.icon} alt="" className="w-8 h-8 rounded" />
                    <AttrIcon attr={hero.primary_attr} size={14} />
                    <span className="text-sm font-body font-bold text-white flex-1">{hero.localized_name}</span>
                    <button onClick={() => removeAlly(i)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                {allies.length < 5 && (
                  <button onClick={() => setSelectingFor('ally')}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-body text-slate-500">Добавить союзника</span>
                  </button>
                )}
              </div>
            </div>

            {/* Position filter */}
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
              <span className="text-sm font-body text-slate-500 block mb-2">Фильтр по позиции</span>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setPosFilter(null)} className={`px-3 py-2 rounded-lg text-sm font-body font-bold transition-all ${posFilter === null ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>Все</button>
                {[1,2,3,4,5].map(pos => (
                  <button key={pos} onClick={() => setPosFilter(pos)}
                    className={`px-3 py-2 rounded-lg text-sm font-body font-bold transition-all ${posFilter === pos ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'}`}>
                    {POS_ROLES[pos].label}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-body text-slate-500">Последние драфты</span>
                </div>
                <div className="space-y-1.5">
                  {history.map((h, i) => (
                    <button key={i} onClick={() => loadDraft(h)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/3 hover:bg-white/6 transition-colors text-left">
                      <div className="flex -space-x-1.5">
                        {h.enemies.slice(0, 5).map(id => {
                          const hero = ALL_HEROES.find(x => x.id === id);
                          return hero ? <img key={id} src={hero.icon} alt="" className="w-6 h-6 rounded border border-[#111827]" /> : null;
                        })}
                      </div>
                      <span className="text-xs font-body text-slate-500 ml-auto">{new Date(h.timestamp).toLocaleDateString('ru')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT: RESULTS ===== */}
          <div>
            {enemies.length === 0 ? (
              <div className="rounded-2xl bg-[#111827] border border-white/5 p-12 text-center">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-white mb-2">Добавь вражеских героев</h3>
                <p className="text-base font-body text-slate-400">Нажми «Добавить врага» слева, чтобы получить анализ</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[#111827] border border-white/5 w-fit">
                  {[
                    { key: 'picks' as const, label: 'Пики', icon: Target, count: recommendations.length > 15 ? '15' : '' },
                    { key: 'bans' as const, label: 'Баны', icon: Ban, count: banRecs.length ? String(banRecs.length) : '' },
                    { key: 'lanes' as const, label: 'Линии', icon: Map, count: '' },
                    { key: 'dangers' as const, label: 'Опасности', icon: AlertTriangle, count: dangers.length ? String(dangers.length) : '' },
                  ].map(({ key, label, icon: Icon, count }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-body font-bold transition-all ${activeTab === key ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'}`}>
                      <Icon className="w-4 h-4" /> {label}
                      {count && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{count}</span>}
                    </button>
                  ))}
                </div>

                {/* ===== PICKS TAB ===== */}
                {activeTab === 'picks' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-dota-gold" />
                      <h3 className="font-display text-xl font-bold text-white">Лучшие пики</h3>
                    </div>

                    {recommendations.slice(0, 15).map((rec, i) => {
                      const wr = rec.winRate ? (rec.winRate * 100).toFixed(1) : null;
                      return (
                        <div key={rec.hero.id}
                          className={`rounded-xl bg-[#111827] border p-4 transition-all hover:border-white/15 ${i < 3 ? 'border-dota-gold/20' : 'border-white/5'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold ${
                              i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-white/5 text-slate-500'
                            }`}>{i + 1}</div>

                            <img src={rec.hero.img} alt="" className="w-14 h-9 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-body font-bold text-white">{rec.hero.localized_name}</span>
                                <AttrIcon attr={rec.hero.primary_attr} size={14} />
                              </div>
                              <span className="text-xs font-body text-slate-500">{rec.hero.roles.slice(0, 3).join(' · ')}</span>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              {wr && (
                                <div className="text-center">
                                  <div className={`text-xs font-mono font-bold ${parseFloat(wr) >= 52 ? 'text-green-400' : parseFloat(wr) < 48 ? 'text-red-400' : 'text-slate-300'}`}>
                                    {wr}%
                                  </div>
                                  <div className="text-[8px] font-body text-slate-600">WR</div>
                                </div>
                              )}
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
                              <div className="w-3 h-8 rounded-full overflow-hidden bg-white/5">
                                <div className="w-full rounded-full transition-all" style={{
                                  height: `${Math.min(100, Math.max(10, (rec.totalScore / 30) * 100))}%`,
                                  backgroundColor: heatColor(rec.totalScore, 25),
                                  marginTop: 'auto',
                                }} />
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-mono font-bold" style={{ color: heatColor(rec.totalScore, 25) }}>
                                  {rec.totalScore.toFixed(0)}
                                </div>
                                <div className="text-[8px] font-body text-slate-600">скор</div>
                              </div>
                            </div>
                          </div>

                          {rec.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 ml-11">
                              {rec.reasons.slice(0, 3).map((reason, j) => (
                                <span key={j} className={`text-xs font-body px-2 py-0.5 rounded-full ${
                                  reason.includes('Контрит') ? 'bg-emerald-500/10 text-emerald-400' :
                                  reason.includes('Синергия') ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}>{reason}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* ===== PICKS BY POSITION ===== */}
                    <div className="mt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-blue-400" />
                        <h3 className="font-display text-xl font-bold text-white">Лучшие пики по позициям</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3,4,5].map(pos => {
                          const posRecs = getRecommendations(enemies, allies, pos, winrates).slice(0, 3);
                          const cfg = POS_ROLES[pos];
                          return (
                            <div key={pos} className="rounded-xl bg-[#111827] border border-white/5 p-4">
                              <div className={`text-sm font-body font-bold ${cfg.color} uppercase tracking-wider mb-3`}>
                                Pos {pos} — {cfg.label}
                              </div>
                              <div className="space-y-2">
                                {posRecs.map((rec, i) => {
                                  const wr = rec.winRate ? (rec.winRate * 100).toFixed(1) : null;
                                  return (
                                    <div key={rec.hero.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                                        i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'
                                      }`}>{i + 1}</span>
                                      <img src={rec.hero.icon} alt="" className="w-8 h-8 rounded-lg" />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-body font-bold text-white truncate">{rec.hero.localized_name}</span>
                                          <AttrIcon attr={rec.hero.primary_attr} size={12} />
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {wr && <span className={`text-xs font-mono font-bold ${parseFloat(wr) >= 52 ? 'text-green-400' : parseFloat(wr) < 48 ? 'text-red-400' : 'text-slate-400'}`}>{wr}%</span>}
                                        <span className={`text-xs font-mono font-bold ${rec.counterScore > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {rec.counterScore > 0 ? '+' : ''}{rec.counterScore.toFixed(1)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== BANS TAB ===== */}
                {activeTab === 'bans' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Ban className="w-5 h-5 text-red-400" />
                      <h3 className="font-display text-xl font-bold text-white">Рекомендации по банам</h3>
                    </div>
                    <p className="text-sm font-body text-slate-500 mb-4">Эти герои опасны для вашего драфта — рекомендуется забанить</p>

                    {banRecs.length > 0 ? banRecs.map((ban, i) => (
                      <div key={ban.hero.id} className="flex items-center gap-3 p-4 rounded-xl bg-[#111827] border border-red-500/10 hover:border-red-500/20 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-sm font-mono font-bold text-red-400">{i + 1}</div>
                        <img src={ban.hero.icon} alt="" className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-body font-bold text-white">{ban.hero.localized_name}</span>
                            <AttrIcon attr={ban.hero.primary_attr} size={14} />
                          </div>
                          <span className="text-xs font-body text-red-400/70">{ban.reason}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-red-400">⚠ {ban.score.toFixed(1)}</span>
                      </div>
                    )) : <p className="text-base font-body text-slate-500">Добавьте союзников для рекомендаций по банам</p>}
                  </div>
                )}

                {/* ===== LANES TAB ===== */}
                {activeTab === 'lanes' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="w-5 h-5 text-blue-400" />
                      <h3 className="font-display text-xl font-bold text-white">Анализ линий</h3>
                    </div>

                    {allies.length === 0 ? (
                      <p className="text-base font-body text-slate-500">Добавьте союзников для анализа линий</p>
                    ) : lanes.map(lane => (
                      <div key={lane.lane} className={`rounded-xl bg-[#111827] border p-4 ${
                        lane.winner === 'ally' ? 'border-emerald-500/20' : lane.winner === 'enemy' ? 'border-red-500/20' : 'border-white/5'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-display text-base font-bold text-white">{lane.lane}</h4>
                          <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${
                            lane.winner === 'ally' ? 'bg-emerald-500/15 text-emerald-400' :
                            lane.winner === 'enemy' ? 'bg-red-500/15 text-red-400' :
                            'bg-white/5 text-slate-400'
                          }`}>
                            {lane.winner === 'ally' ? `+${lane.advantage.toFixed(1)} Преимущество` :
                             lane.winner === 'enemy' ? `${lane.advantage.toFixed(1)} Проигрыш` : 'Равенство'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs font-body text-emerald-400 mb-1.5 block">Наши</span>
                            <div className="flex gap-1.5">{lane.allyHeroes.map(h => (
                              <div key={h.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5">
                                <img src={h.icon} alt="" className="w-6 h-6 rounded" />
                                <span className="text-xs font-body text-white">{h.localized_name}</span>
                              </div>
                            ))}{lane.allyHeroes.length === 0 && <span className="text-xs text-slate-600">—</span>}</div>
                          </div>
                          <div>
                            <span className="text-xs font-body text-red-400 mb-1.5 block">Враги</span>
                            <div className="flex gap-1.5">{lane.enemyHeroes.map(h => (
                              <div key={h.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/5">
                                <img src={h.icon} alt="" className="w-6 h-6 rounded" />
                                <span className="text-xs font-body text-white">{h.localized_name}</span>
                              </div>
                            ))}{lane.enemyHeroes.length === 0 && <span className="text-xs text-slate-600">—</span>}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== DANGERS TAB ===== */}
                {activeTab === 'dangers' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <h3 className="font-display text-xl font-bold text-white">Опасности драфта</h3>
                    </div>

                    {dangers.length > 0 ? dangers.map((d, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${
                        d.type === 'danger' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/15'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${d.type === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
                        <span className="text-base font-body text-slate-300">{d.message}</span>
                      </div>
                    )) : (
                      <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span className="text-base font-body text-emerald-400">Явных слабостей в драфте врага не обнаружено</span>
                      </div>
                    )}

                    {/* Matchup graph */}
                    {enemies.length >= 2 && allies.length >= 1 && (
                      <div className="rounded-xl bg-[#111827] border border-white/5 p-5 mt-4">
                        <h4 className="font-display text-base font-bold text-white mb-4">Граф матчапов</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {allies.map(ally => (
                            <div key={ally.id} className="flex items-center gap-2">
                              <img src={ally.icon} alt="" className="w-7 h-7 rounded flex-shrink-0" />
                              <span className="text-xs font-body text-emerald-400 w-24 truncate">{ally.localized_name}</span>
                              <div className="flex-1 flex gap-1">
                                {enemies.map(enemy => {
                                  const adv = getHeroAdvantage(ally, enemy);
                                  return (
                                    <div key={enemy.id} className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ backgroundColor: heatColor(adv, 5) + '20' }}>
                                      <img src={enemy.icon} alt="" className="w-5 h-5 rounded" />
                                      <span className="text-[10px] font-mono font-bold" style={{ color: heatColor(adv, 5) }}>
                                        {adv > 0 ? '+' : ''}{adv.toFixed(1)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ===== HERO SELECTION MODAL ===== */}
        {selectingFor && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setSelectingFor(null)}>
            <div className="w-full max-w-4xl max-h-[85vh] bg-[#111827] border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold text-white">
                    {selectingFor === 'enemy' ? '🔴 Выбери вражеского героя' : '🟢 Выбери союзника'}
                  </h3>
                  <button onClick={() => setSelectingFor(null)}>
                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input ref={searchInputRef} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKeyDown}
                      placeholder="Поиск... (Enter = выбрать первого)" autoFocus
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-body text-base placeholder:text-slate-600 focus:border-white/20 focus:outline-none" />
                  </div>
                  <div className="flex gap-1">
                    {[
                      { key: 'all', label: 'Все' },
                      { key: 'str', attr: 'str' },
                      { key: 'agi', attr: 'agi' },
                      { key: 'int', attr: 'int' },
                      { key: 'uni', attr: 'all' },
                    ].map(({ key, label, attr }) => (
                      <button key={key} onClick={() => setAttrFilter(key)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${attrFilter === key ? 'bg-white/15 ring-2 ring-white/20' : 'hover:bg-white/5'}`}
                        title={key === 'all' ? 'Все' : key === 'uni' ? 'Универсал' : key === 'str' ? 'Сила' : key === 'agi' ? 'Ловкость' : 'Интеллект'}>
                        {label ? <span className="text-sm font-bold text-white">{label}</span> : <AttrIcon attr={attr!} size={22} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {filteredHeroes.map(hero => (
                    <button key={hero.id} onClick={() => addHero(hero)}
                      className="group relative rounded-xl overflow-hidden hover:scale-105 hover:z-10 hover:shadow-xl hover:shadow-black/40 transition-all cursor-pointer border border-transparent hover:border-white/20"
                      title={hero.localized_name}>
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={hero.img} alt="" className="w-full h-full object-cover object-center" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute top-1 left-1">
                        <AttrIcon attr={hero.primary_attr} size={14} />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <span className="text-[10px] font-body font-bold text-white text-center block truncate drop-shadow-lg">
                          {hero.localized_name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {filteredHeroes.length === 0 && <p className="text-center text-base font-body text-slate-500 py-8">Герой не найден</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
