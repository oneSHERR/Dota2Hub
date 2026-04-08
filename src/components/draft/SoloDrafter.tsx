import { useState, useMemo, useEffect, useRef } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { analyzeDraft, getHeroAdvantage } from '@/data/matchups';
import { getAttrColor } from '@/lib/utils';
import type { Hero, Position, DraftSlot, DraftAnalysis } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Search, X, Ban, Shield, Swords, Brain, ArrowLeft, Timer, Zap, RotateCcw } from 'lucide-react';
import { SoloBattleAnimation } from './SoloBattleAnimation';
import { DraftResult } from './DraftResult';

type SoloPhase = 'setup' | 'ban' | 'pick' | 'battle' | 'result';
type Turn = 'player' | 'ai';

interface AIState {
  bans: Hero[];
  slots: DraftSlot[];
}

function createEmptySlots(): DraftSlot[] {
  return [1, 2, 3, 4, 5].map(p => ({ position: p as Position, hero: null }));
}

// AI logic for picking heroes
function aiPickHero(
  aiSlots: DraftSlot[],
  playerSlots: DraftSlot[],
  usedHeroIds: Set<number>,
  position: Position
): Hero | null {
  const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
  if (available.length === 0) return null;

  // Score each hero based on countering player's picks and role fit
  const playerHeroes = playerSlots.filter(s => s.hero).map(s => s.hero!);
  const scored = available.map(hero => {
    let score = 0;

    // Role fit for position
    const posRoles: Record<number, string[]> = {
      1: ['Carry'],
      2: ['Nuker', 'Escape'],
      3: ['Initiator', 'Durable', 'Disabler'],
      4: ['Support', 'Initiator', 'Disabler'],
      5: ['Support'],
    };
    const wantedRoles = posRoles[position] || [];
    for (const role of hero.roles) {
      if (wantedRoles.includes(role)) score += 2;
    }

    // Counter player heroes
    for (const ph of playerHeroes) {
      const adv = getHeroAdvantage(hero, ph);
      score += adv * 1.5;
    }

    // Small random factor
    score += Math.random() * 2;
    return { hero, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.hero || null;
}

function aiBanHero(playerSlots: DraftSlot[], usedIds: Set<number>): Hero | null {
  // Ban strong meta heroes or random good heroes
  const metaHeroes = ['faceless_void', 'spectre', 'invoker', 'axe', 'spirit_breaker', 'crystal_maiden', 'storm_spirit', 'earthshaker'];
  const available = ALL_HEROES.filter(h => !usedIds.has(h.id));
  const metaPick = available.find(h => metaHeroes.includes(h.name));
  if (metaPick) return metaPick;
  return available[Math.floor(Math.random() * Math.min(20, available.length))] || null;
}

export function SoloDrafter({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<SoloPhase>('setup');
  const [playerSlots, setPlayerSlots] = useState<DraftSlot[]>(createEmptySlots());
  const [playerBans, setPlayerBans] = useState<Hero[]>([]);
  const [aiState, setAiState] = useState<AIState>({ bans: [], slots: createEmptySlots() });
  const [turn, setTurn] = useState<Turn>('player');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [timer, setTimer] = useState(30);
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [banPhaseStep, setBanPhaseStep] = useState(0); // 0-3 = 4 bans total (2 each)
  const [pickPhaseStep, setPickPhaseStep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  // All used hero ids
  const usedHeroIds = useMemo(() => {
    const ids = new Set<number>();
    playerBans.forEach(h => ids.add(h.id));
    aiState.bans.forEach(h => ids.add(h.id));
    playerSlots.forEach(s => { if (s.hero) ids.add(s.hero.id); });
    aiState.slots.forEach(s => { if (s.hero) ids.add(s.hero.id); });
    return ids;
  }, [playerBans, aiState, playerSlots]);

  // Timer
  useEffect(() => {
    if ((phase === 'ban' || phase === 'pick') && turn === 'player') {
      setTimer(30);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Auto-action on timeout
            if (phase === 'ban') handleRandomBan();
            else handleRandomPick();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, turn, banPhaseStep, pickPhaseStep]);

  const handleRandomBan = () => {
    const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      processBan(random);
    }
  };

  const handleRandomPick = () => {
    const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
    if (available.length > 0) {
      const emptySlot = playerSlots.find(s => !s.hero);
      if (emptySlot) {
        const random = available[Math.floor(Math.random() * available.length)];
        processPlayerPick(random, emptySlot.position);
      }
    }
  };

  // Start game
  const startGame = () => {
    setPhase('ban');
    setTurn('player');
    setBanPhaseStep(0);
  };

  // BAN logic
  const processBan = (hero: Hero) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newBans = [...playerBans, hero];
    setPlayerBans(newBans);
    setBanPhaseStep(prev => prev + 1);
    setTurn('ai');

    // AI bans after short delay
    setTimeout(() => {
      const newUsedIds = new Set(usedHeroIds);
      newUsedIds.add(hero.id);
      const aiBan = aiBanHero(playerSlots, newUsedIds);
      if (aiBan) {
        setAiState(prev => ({ ...prev, bans: [...prev.bans, aiBan] }));
      }

      const nextStep = banPhaseStep + 2; // +1 for player, +1 for AI
      if (nextStep >= 4) {
        // Move to pick phase
        setPhase('pick');
        setTurn('player');
        setPickPhaseStep(0);
      } else {
        setBanPhaseStep(nextStep);
        setTurn('player');
      }
    }, 1000);
  };

  // PICK logic
  const processPlayerPick = (hero: Hero, position: Position) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newSlots = playerSlots.map(s =>
      s.position === position ? { ...s, hero } : s
    );
    setPlayerSlots(newSlots);
    setSelectedPosition(null);
    setTurn('ai');

    // AI picks after delay
    setTimeout(() => {
      const emptyAiSlots = aiState.slots.filter(s => !s.hero);
      if (emptyAiSlots.length > 0) {
        const aiPos = emptyAiSlots[0].position;
        const newUsedIds = new Set(usedHeroIds);
        newUsedIds.add(hero.id);
        const aiHero = aiPickHero(aiState.slots, newSlots, newUsedIds, aiPos);
        if (aiHero) {
          setAiState(prev => ({
            ...prev,
            slots: prev.slots.map(s => s.position === aiPos ? { ...s, hero: aiHero } : s),
          }));
        }
      }

      const playerPicks = newSlots.filter(s => s.hero).length;
      const aiPicks = aiState.slots.filter(s => s.hero).length + 1;
      if (playerPicks >= 5 && aiPicks >= 5) {
        setTimeout(() => {
          setPhase('battle');
        }, 500);
      } else {
        setTurn('player');
        setPickPhaseStep(prev => prev + 1);
      }
    }, 1200);
  };

  const handleHeroClick = (hero: Hero) => {
    if (turn !== 'player') return;
    if (phase === 'ban') {
      processBan(hero);
    } else if (phase === 'pick' && selectedPosition !== null) {
      processPlayerPick(hero, selectedPosition);
    }
  };

  // Battle complete → go to result
  const handleBattleComplete = (analysisResult: DraftAnalysis) => {
    setAnalysis(analysisResult);
    setResultData({
      player1: { name: 'Ты', slots: playerSlots, bans: playerBans },
      player2: { name: 'AI Drafter', slots: aiState.slots, bans: aiState.bans },
      analysis: analysisResult,
      winner: analysisResult.predictedWinner,
    });
    setPhase('result');
  };

  // Reset
  const handleNewGame = () => {
    setPhase('setup');
    setPlayerSlots(createEmptySlots());
    setPlayerBans([]);
    setAiState({ bans: [], slots: createEmptySlots() });
    setTurn('player');
    setSelectedPosition(null);
    setSearch('');
    setTimer(30);
    setAnalysis(null);
    setBanPhaseStep(0);
    setPickPhaseStep(0);
    setResultData(null);
  };

  // Filtered heroes
  const filteredHeroes = useMemo(() => {
    const order: Record<string, number> = { str: 0, agi: 1, int: 2, all: 3 };
    return ALL_HEROES
      .filter(h => {
        if (usedHeroIds.has(h.id)) return false;
        if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (attrFilter === 'all') return true;
        if (attrFilter === 'uni') return h.primary_attr === 'all';
        return h.primary_attr === attrFilter;
      })
      .sort((a, b) => {
        const ao = order[a.primary_attr] ?? 4;
        const bo = order[b.primary_attr] ?? 4;
        return ao !== bo ? ao - bo : a.localized_name.localeCompare(b.localized_name);
      });
  }, [search, attrFilter, usedHeroIds]);

  // ===== SETUP SCREEN =====
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-body text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-5xl font-black gradient-text mb-3">SOLO DRAFTER</h1>
          <p className="text-sm font-body text-slate-400 max-w-md mx-auto">
            Драфти против AI. Забань 2 героя, выбери 5 героев по позициям.
            AI ответит своим драфтом, и система определит победителя.
          </p>
        </div>

        <div className="rounded-2xl bg-[#111827] border border-white/8 p-8 mb-6">
          <h3 className="font-display text-lg font-bold text-white mb-4">Правила</h3>
          <div className="space-y-3">
            {[
              { icon: '🚫', text: 'Фаза банов: ты и AI по очереди банят по 2 героя' },
              { icon: '⚔️', text: 'Фаза пиков: выбирай героя на каждую позицию (1-5)' },
              { icon: '⏱️', text: '30 секунд на каждый ход — не задерживайся!' },
              { icon: '🤖', text: 'AI подбирает контрпики и синергии под твой драфт' },
              { icon: '📊', text: 'Результат: детальный анализ с оценкой S/A/B/C/D' },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-body text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-body font-bold text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-transform"
        >
          <Swords className="w-5 h-5 inline mr-2" />
          Начать драфт
        </button>
      </div>
    );
  }

  // ===== BATTLE ANIMATION =====
  if (phase === 'battle') {
    return (
      <SoloBattleAnimation
        playerSlots={playerSlots}
        aiSlots={aiState.slots}
        playerName="Ты"
        aiName="AI Drafter"
        onComplete={handleBattleComplete}
      />
    );
  }

  // ===== RESULT =====
  if (phase === 'result' && resultData) {
    return <DraftResult data={resultData} onNewGame={handleNewGame} />;
  }

  // ===== BAN / PICK PHASE =====
  const allBans = [...playerBans, ...aiState.bans];
  const playerPicks = playerSlots.filter(s => s.hero).length;
  const aiPicks = aiState.slots.filter(s => s.hero).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Phase header with timer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg font-body text-sm font-bold flex items-center gap-2 ${phase === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {phase === 'ban' ? <><Ban className="w-4 h-4" /> БАНЫ ({allBans.length}/4)</> : <><Shield className="w-4 h-4" /> ПИКИ ({playerPicks + aiPicks}/10)</>}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-body font-bold ${turn === 'player' ? 'bg-dota-gold/15 text-dota-gold animate-pulse' : 'bg-purple-500/15 text-purple-400'}`}>
            {turn === 'player' ? '⚡ Твой ход!' : '🤖 AI думает...'}
          </div>
        </div>

        {/* Timer */}
        {turn === 'player' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timer <= 10 ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-white/5 text-slate-300'}`}>
            <Timer className="w-4 h-4" />
            {timer}с
          </div>
        )}

        <button onClick={onBack} className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-400 text-xs font-body hover:bg-slate-700 transition-colors">
          Выйти
        </button>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] gap-3">
        {/* Player team */}
        <div className="rounded-xl bg-[#111827] border border-emerald-500/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-body text-xs font-bold text-white uppercase tracking-wider">Ты</span>
            <span className="text-[9px] font-body text-slate-600 ml-auto">player</span>
          </div>
          <div className="space-y-1.5">
            {([1, 2, 3, 4, 5] as Position[]).map(pos => {
              const slot = playerSlots.find(s => s.position === pos);
              const hero = slot?.hero;
              const isSelected = selectedPosition === pos;
              const canSelect = phase === 'pick' && turn === 'player' && !hero;
              return (
                <button key={pos} onClick={() => canSelect && setSelectedPosition(pos)} disabled={!canSelect}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all text-left ${
                    hero ? 'bg-white/5' : isSelected ? 'bg-dota-gold/10 ring-1 ring-dota-gold/40' : canSelect ? 'bg-white/2 hover:bg-white/5 cursor-pointer border border-dashed border-white/10' : 'bg-white/2 border border-white/5'
                  }`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hero ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'}`}>{pos}</div>
                  {hero ? (
                    <><img src={hero.icon} alt="" className="w-7 h-7 rounded" /><div className="min-w-0"><div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div><div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div></div></>
                  ) : (
                    <div><div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>{isSelected && <div className="text-[9px] text-dota-gold mt-0.5">← выбери героя</div>}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <Swords className="w-5 h-5 text-dota-gold" />
          </div>
        </div>

        {/* AI team */}
        <div className="rounded-xl bg-[#111827] border border-purple-500/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="font-body text-xs font-bold text-white uppercase tracking-wider">AI Drafter</span>
            <Brain className="w-3 h-3 text-purple-400 ml-auto" />
          </div>
          <div className="space-y-1.5">
            {([1, 2, 3, 4, 5] as Position[]).map(pos => {
              const slot = aiState.slots.find(s => s.position === pos);
              const hero = slot?.hero;
              return (
                <div key={pos} className={`w-full flex items-center gap-2.5 p-2 rounded-lg ${hero ? 'bg-white/5' : 'bg-white/2 border border-white/5'}`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hero ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'}`}>{pos}</div>
                  {hero ? (
                    <><img src={hero.icon} alt="" className="w-7 h-7 rounded" /><div className="min-w-0"><div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div><div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div></div></>
                  ) : (
                    <div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bans */}
      {allBans.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {allBans.map((h, i) => (
              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10">
                <img src={h.icon} alt="" className="w-4 h-4 rounded" />
                <span className="text-[10px] font-body text-red-400 line-through">{h.localized_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick instruction */}
      {phase === 'pick' && turn === 'player' && selectedPosition === null && (
        <div className="p-3 rounded-xl bg-dota-gold/8 border border-dota-gold/15 text-center">
          <span className="text-sm font-body text-dota-gold">👆 Нажми на позицию слева, потом выбери героя</span>
        </div>
      )}

      {/* Hero pool */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/8 text-white font-body text-sm placeholder:text-slate-600 focus:border-white/15 focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-500" /></button>}
          </div>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'ВСЕ', color: '#fff' },
              { key: 'str', label: 'СИЛ', color: '#EC3D06' },
              { key: 'agi', label: 'ЛОВ', color: '#26E030' },
              { key: 'int', label: 'ИНТ', color: '#00B4F0' },
              { key: 'uni', label: 'УНИ', color: '#B8B8B8' },
            ].map(({ key, label, color }) => (
              <button key={key} onClick={() => setAttrFilter(key)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-body font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: attrFilter === key ? color + '18' : 'transparent',
                  color: attrFilter === key ? color : '#475569',
                  border: attrFilter === key ? `1px solid ${color}30` : '1px solid transparent',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 lg:grid-cols-13 gap-1 max-h-[350px] overflow-y-auto">
          {filteredHeroes.map(hero => {
            const canClick = turn === 'player' && (phase === 'ban' || (phase === 'pick' && selectedPosition !== null));
            return (
              <button key={hero.id} onClick={() => handleHeroClick(hero)} disabled={!canClick}
                className={`group relative aspect-[16/9] rounded overflow-hidden transition-all duration-150 ${canClick ? 'hover:scale-110 hover:z-10 hover:shadow-xl cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                title={hero.localized_name}>
                <img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 left-0 right-0 text-[8px] font-body text-white text-center p-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">{hero.localized_name}</span>
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hero.primary_attr === 'all' ? '#B8B8B8' : getAttrColor(hero.primary_attr) }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
