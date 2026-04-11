import { useState, useMemo, useEffect, useRef } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { analyzeDraft, getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero, Position, DraftSlot, DraftAnalysis } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Search, X, Ban, Shield, Swords, Brain, ArrowLeft, Timer, Zap, RotateCcw } from 'lucide-react';
import { SoloBattleAnimation } from './SoloBattleAnimation';
import { DraftResult } from './DraftResult';

// ========== VALVE ATTR ICONS ==========
const ATTR_ICONS: Record<string, string> = {
  str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
  agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
  int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  all: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png',
};
function AttrIcon({ attr, size = 16 }: { attr: string; size?: number }) {
  return <img src={ATTR_ICONS[attr] || ATTR_ICONS.all} alt="" className="inline-block" style={{ width: size, height: size }} />;
}

type SoloPhase = 'setup' | 'ban' | 'pick' | 'battle' | 'result';
type Turn = 'player' | 'ai';

interface AIState {
  bans: Hero[];
  slots: DraftSlot[];
  strategy: AIStrategy;
}

// ========== AI СТРАТЕГИИ ==========
type AIStrategy = 'teamfight' | 'push' | 'pickoff' | 'lategame' | 'balanced';

const AI_STRATEGIES: Record<AIStrategy, {
  name: string;
  positionPriority: Record<number, string[]>; // какие роли AI предпочитает на каждой позиции
  bonusRoles: string[];  // роли которые стратегия предпочитает
}> = {
  teamfight: {
    name: 'Teamfight',
    positionPriority: {
      1: ['Carry', 'Durable'],
      2: ['Nuker', 'Disabler'],
      3: ['Initiator', 'Durable', 'Disabler'],
      4: ['Initiator', 'Disabler', 'Support'],
      5: ['Support', 'Disabler'],
    },
    bonusRoles: ['Initiator', 'Disabler', 'Nuker'],
  },
  push: {
    name: 'Push',
    positionPriority: {
      1: ['Carry', 'Pusher'],
      2: ['Nuker', 'Pusher'],
      3: ['Pusher', 'Durable'],
      4: ['Support', 'Pusher'],
      5: ['Support', 'Pusher'],
    },
    bonusRoles: ['Pusher', 'Durable'],
  },
  pickoff: {
    name: 'Pickoff',
    positionPriority: {
      1: ['Carry', 'Escape'],
      2: ['Nuker', 'Escape', 'Carry'],
      3: ['Initiator', 'Disabler'],
      4: ['Support', 'Disabler', 'Initiator'],
      5: ['Support', 'Disabler'],
    },
    bonusRoles: ['Escape', 'Disabler', 'Nuker'],
  },
  lategame: {
    name: 'Late Game',
    positionPriority: {
      1: ['Carry'],
      2: ['Carry', 'Nuker'],
      3: ['Durable', 'Initiator'],
      4: ['Support', 'Disabler'],
      5: ['Support'],
    },
    bonusRoles: ['Carry', 'Durable'],
  },
  balanced: {
    name: 'Balanced',
    positionPriority: {
      1: ['Carry'],
      2: ['Nuker', 'Escape', 'Carry'],
      3: ['Initiator', 'Durable', 'Disabler'],
      4: ['Support', 'Initiator', 'Disabler'],
      5: ['Support'],
    },
    bonusRoles: [],
  },
};

function randomStrategy(): AIStrategy {
  const strategies: AIStrategy[] = ['teamfight', 'push', 'pickoff', 'lategame', 'balanced'];
  return strategies[Math.floor(Math.random() * strategies.length)];
}

// ========== РАНДОМНЫЙ ПОРЯДОК ПОЗИЦИЙ ==========
function shufflePickOrder(): Position[] {
  // AI не пикает всегда 1→5, а в рандомном порядке
  // Но с приоритетом: мид и керри часто первыми, саппорты позже
  const earlyPicks: Position[] = [1, 2, 3];
  const latePicks: Position[] = [4, 5];
  
  // Перемешиваем каждую группу
  const shuffled = (arr: Position[]): Position[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Иногда AI сначала берёт саппорта (как в реальности)
  if (Math.random() < 0.3) {
    return [...shuffled(latePicks), ...shuffled(earlyPicks)];
  }
  return [...shuffled(earlyPicks), ...shuffled(latePicks)];
}

// ========== УМНЫЙ AI PICK ==========
function aiPickHero(
  aiSlots: DraftSlot[],
  playerSlots: DraftSlot[],
  usedHeroIds: Set<number>,
  position: Position,
  strategy: AIStrategy
): Hero | null {
  const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
  if (available.length === 0) return null;

  const strat = AI_STRATEGIES[strategy];
  const playerHeroes = playerSlots.filter(s => s.hero).map(s => s.hero!);
  const aiHeroes = aiSlots.filter(s => s.hero).map(s => s.hero!);

  // Считаем текущий баланс атрибутов AI
  const attrCount: Record<string, number> = { str: 0, agi: 0, int: 0, all: 0 };
  aiHeroes.forEach(h => attrCount[h.primary_attr]++);

  const wantedRoles = strat.positionPriority[position] || ['Support'];

  const scored = available.map(hero => {
    let score = 0;

    // 1. Роль подходит для позиции (ВАЖНО — вес 5)
    let roleFit = 0;
    for (const role of hero.roles) {
      if (wantedRoles.includes(role)) roleFit += 3;
      if (strat.bonusRoles.includes(role)) roleFit += 1;
    }
    // Штраф если герой совсем не подходит по роли
    if (roleFit === 0) score -= 8;
    score += roleFit;

    // 2. Позиция 5 — строго саппорт, позиция 1 — строго керри
    if (position === 5 && !hero.roles.includes('Support')) score -= 6;
    if (position === 1 && !hero.roles.includes('Carry')) score -= 5;
    if (position === 3 && !hero.roles.includes('Initiator') && !hero.roles.includes('Durable')) score -= 3;

    // 3. Баланс атрибутов — не больше 2 одного атрибута (кроме universal)
    if (hero.primary_attr !== 'all' && attrCount[hero.primary_attr] >= 2) {
      score -= 4;
    }

    // 4. Контрпик вражеских героев (вес 2)
    for (const ph of playerHeroes) {
      const adv = getHeroAdvantage(hero, ph);
      score += adv * 2;
    }

    // 5. Синергия с уже выбранными AI героями (вес 1.5)
    for (const ah of aiHeroes) {
      const syn = getHeroSynergy(hero, ah);
      score += syn * 1.5;
    }

    // 6. Не дублировать типы атаки — хотя бы 1 рэнж и 1 мили
    const meleeCount = aiHeroes.filter(h => h.attack_type === 'Melee').length;
    const rangedCount = aiHeroes.filter(h => h.attack_type === 'Ranged').length;
    if (meleeCount >= 4 && hero.attack_type === 'Melee') score -= 3;
    if (rangedCount >= 4 && hero.attack_type === 'Ranged') score -= 3;

    // 7. Маленький рандом чтобы не было одинаковых драфтов
    score += Math.random() * 1.5;

    return { hero, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Берём из топ-3 с небольшим рандомом (не всегда первого)
  const topN = scored.slice(0, Math.min(3, scored.length));
  return topN[Math.floor(Math.random() * topN.length)]?.hero || null;
}

// ========== УМНЫЙ BAN ==========
function aiBanHero(playerSlots: DraftSlot[], playerBans: Hero[], usedIds: Set<number>, strategy: AIStrategy): Hero | null {
  const available = ALL_HEROES.filter(h => !usedIds.has(h.id));
  if (available.length === 0) return null;

  const playerHeroes = playerSlots.filter(s => s.hero).map(s => s.hero!);

  // Банить тех кто контрит стратегию AI
  const scored = available.map(hero => {
    let dangerScore = 0;

    // Герои которые контрят стратегию AI
    if (strategy === 'teamfight' && hero.roles.includes('Escape')) dangerScore += 2;
    if (strategy === 'push' && hero.roles.includes('Initiator')) dangerScore += 2;
    if (strategy === 'lategame' && hero.roles.includes('Pusher')) dangerScore += 3;
    if (strategy === 'pickoff' && hero.roles.includes('Durable')) dangerScore += 2;

    // Сильные мета-герои
    const metaDanger: Record<string, number> = {
      'Faceless Void': 4, 'Invoker': 3, 'Phantom Assassin': 3, 'Spirit Breaker': 3,
      'Earthshaker': 3, 'Magnus': 3, 'Enigma': 3, 'Tidehunter': 2,
      'Storm Spirit': 3, 'Anti-Mage': 2, 'Spectre': 3, 'Ursa': 3,
      'Axe': 2, 'Silencer': 3, 'Ancient Apparition': 2,
    };
    dangerScore += metaDanger[hero.localized_name] || 0;

    // Рандом
    dangerScore += Math.random() * 2;

    return { hero, dangerScore };
  });

  scored.sort((a, b) => b.dangerScore - a.dangerScore);

  // Берём из топ-5 рандомно
  const topN = scored.slice(0, Math.min(5, scored.length));
  return topN[Math.floor(Math.random() * topN.length)]?.hero || null;
}

// ========== HELPERS ==========
function createEmptySlots(): DraftSlot[] {
  return [1, 2, 3, 4, 5].map(p => ({ position: p as Position, hero: null }));
}

// ========== CAPTAIN'S MODE SEQUENCE ==========
interface DraftStep {
  type: 'ban' | 'pick';
  who: 'player' | 'ai';
}

function generateSoloSequence(): DraftStep[] {
  // Рандом кто начинает
  const first: Turn = Math.random() > 0.5 ? 'player' : 'ai';
  const second: Turn = first === 'player' ? 'ai' : 'player';

  return [
    // Баны
    { type: 'ban', who: first },
    { type: 'ban', who: second },
    { type: 'ban', who: second },
    { type: 'ban', who: first },
    // Пики с двойными ходами
    { type: 'pick', who: first },
    { type: 'pick', who: second },
    { type: 'pick', who: second },
    { type: 'pick', who: first },
    { type: 'pick', who: first },
    { type: 'pick', who: second },
    { type: 'pick', who: second },
    { type: 'pick', who: first },
    { type: 'pick', who: first },
    { type: 'pick', who: second },
  ];
}

// ========== MAIN COMPONENT ==========
export function SoloDrafter({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<SoloPhase>('setup');
  const [playerSlots, setPlayerSlots] = useState<DraftSlot[]>(createEmptySlots());
  const [playerBans, setPlayerBans] = useState<Hero[]>([]);
  const [aiState, setAiState] = useState<AIState>({ bans: [], slots: createEmptySlots(), strategy: 'balanced' });
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [search, setSearch] = useState('');
  const [attrFilter, setAttrFilter] = useState('all');
  const [timer, setTimer] = useState(30);
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  // Captain's Mode
  const [sequence, setSequence] = useState<DraftStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiPickOrder, setAiPickOrder] = useState<Position[]>([]);
  const [aiPickIndex, setAiPickIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentAction = sequence[currentStep] || null;
  const turn = currentAction?.who || 'player';
  const actionType = currentAction?.type || 'ban';

  // All used hero ids
  const usedHeroIds = useMemo(() => {
    const ids = new Set<number>();
    playerBans.forEach(h => ids.add(h.id));
    aiState.bans.forEach(h => ids.add(h.id));
    playerSlots.forEach(s => { if (s.hero) ids.add(s.hero.id); });
    aiState.slots.forEach(s => { if (s.hero) ids.add(s.hero.id); });
    return ids;
  }, [playerBans, aiState, playerSlots]);

  // Timer for player turns
  useEffect(() => {
    if ((phase === 'ban' || phase === 'pick') && turn === 'player') {
      setTimer(30);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleRandomAction();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, turn, currentStep]);

  // AI auto-action
  useEffect(() => {
    if ((phase === 'ban' || phase === 'pick') && turn === 'ai') {
      const delay = 800 + Math.random() * 1200; // 0.8-2 секунды "думает"
      const timeout = setTimeout(() => {
        if (actionType === 'ban') {
          doAiBan();
        } else {
          doAiPick();
        }
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [phase, turn, currentStep]);

  const handleRandomAction = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
    if (available.length === 0) return;

    if (actionType === 'ban') {
      const random = available[Math.floor(Math.random() * available.length)];
      doPlayerBan(random);
    } else {
      const emptySlot = playerSlots.find(s => !s.hero);
      if (emptySlot) {
        const random = available[Math.floor(Math.random() * available.length)];
        doPlayerPick(random, emptySlot.position);
      }
    }
  };

  // Start game
  const startGame = () => {
    const strat = randomStrategy();
    const seq = generateSoloSequence();
    const pickOrder = shufflePickOrder();

    setAiState({ bans: [], slots: createEmptySlots(), strategy: strat });
    setSequence(seq);
    setCurrentStep(0);
    setAiPickOrder(pickOrder);
    setAiPickIndex(0);

    // Определяем первую фазу
    setPhase(seq[0].type === 'ban' ? 'ban' : 'pick');
  };

  const advanceStep = () => {
    const next = currentStep + 1;
    if (next >= sequence.length) {
      // Все шаги выполнены — в бой
      setTimeout(() => setPhase('battle'), 500);
      return;
    }
    setCurrentStep(next);
    const nextAction = sequence[next];
    if (nextAction.type !== actionType) {
      setPhase(nextAction.type === 'ban' ? 'ban' : 'pick');
    }
  };

  // ===== PLAYER ACTIONS =====
  const doPlayerBan = (hero: Hero) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerBans(prev => [...prev, hero]);
    advanceStep();
  };

  const doPlayerPick = (hero: Hero, position: Position) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerSlots(prev => prev.map(s => s.position === position ? { ...s, hero } : s));
    setSelectedPosition(null);
    advanceStep();
  };

  // ===== AI ACTIONS =====
  const doAiBan = () => {
    const hero = aiBanHero(playerSlots, playerBans, usedHeroIds, aiState.strategy);
    if (hero) {
      setAiState(prev => ({ ...prev, bans: [...prev.bans, hero] }));
    }
    advanceStep();
  };

  const doAiPick = () => {
    // Берём следующую позицию из рандомного порядка AI
    const pos = aiPickOrder[aiPickIndex] || (1 as Position);
    const hero = aiPickHero(aiState.slots, playerSlots, usedHeroIds, pos, aiState.strategy);
    if (hero) {
      setAiState(prev => ({
        ...prev,
        slots: prev.slots.map(s => s.position === pos ? { ...s, hero } : s),
      }));
    }
    setAiPickIndex(prev => prev + 1);
    advanceStep();
  };

  const handleHeroClick = (hero: Hero) => {
    if (turn !== 'player') return;
    if (actionType === 'ban') {
      doPlayerBan(hero);
    } else if (actionType === 'pick' && selectedPosition !== null) {
      doPlayerPick(hero, selectedPosition);
    }
  };

  // Battle complete
  const handleBattleComplete = (analysisResult: DraftAnalysis) => {
    setAnalysis(analysisResult);
    setResultData({
      player1: { name: 'Ты', slots: playerSlots, bans: playerBans },
      player2: { name: `AI (${AI_STRATEGIES[aiState.strategy].name})`, slots: aiState.slots, bans: aiState.bans },
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
    setAiState({ bans: [], slots: createEmptySlots(), strategy: 'balanced' });
    setSelectedPosition(null);
    setSearch('');
    setTimer(30);
    setAnalysis(null);
    setResultData(null);
    setSequence([]);
    setCurrentStep(0);
    setAiPickIndex(0);
  };

  // Filtered heroes
  const filteredHeroes = useMemo(() => {
    const order: Record<string, number> = { str: 0, agi: 1, int: 2, all: 3 };
    return ALL_HEROES.filter(h => {
      if (usedHeroIds.has(h.id)) return false;
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter === 'all') return true;
      if (attrFilter === 'uni') return h.primary_attr === 'all';
      return h.primary_attr === attrFilter;
    }).sort((a, b) => {
      const ao = order[a.primary_attr] ?? 4;
      const bo = order[b.primary_attr] ?? 4;
      return ao !== bo ? ao - bo : a.localized_name.localeCompare(b.localized_name);
    });
  }, [search, attrFilter, usedHeroIds]);

  // ===== SETUP SCREEN =====
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-base font-body text-slate-400 hover:text-white mb-8 transition-all duration-300">
          <ArrowLeft className="w-5 h-5" /> Назад
        </button>
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-5xl font-black gradient-text mb-3">SOLO DRAFTER</h1>
          <p className="text-base font-body text-slate-400 max-w-md mx-auto">
            Captain's Mode против умного AI. Рандомный порядок ходов, контрпики и стратегии.
          </p>
        </div>

        <div className="rounded-2xl bg-dota-card/60 border border-white/8 p-8 mb-6">
          <h3 className="font-display text-xl font-bold text-white mb-4">Как играет AI</h3>
          <div className="space-y-3">
            {[
              { icon: '🎲', text: 'Рандомно выбирает стратегию: Teamfight, Push, Pickoff, Late Game' },
              { icon: '🧠', text: 'Контрпикает твоих героев и строит синергии' },
              { icon: '⚖️', text: 'Балансирует атрибуты — не берёт 5 силовиков' },
              { icon: '🔀', text: 'Пикает позиции в рандомном порядке, не всегда 1→5' },
              { icon: '🚫', text: 'Банит героев, опасных для своей стратегии' },
              { icon: '⏱️', text: '30 секунд на ход — при таймауте рандомный выбор' },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03]">
                <span className="text-xl">{icon}</span>
                <span className="text-base font-body text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={startGame}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-body font-bold text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-transform">
          <Swords className="w-5 h-5 inline mr-2" /> Начать драфт
        </button>
      </div>
    );
  }

  // ===== BATTLE =====
  if (phase === 'battle') {
    return <SoloBattleAnimation playerSlots={playerSlots} aiSlots={aiState.slots} playerName="Ты" aiName={`AI (${AI_STRATEGIES[aiState.strategy].name})`} onComplete={handleBattleComplete} />;
  }

  // ===== RESULT =====
  if (phase === 'result' && resultData) {
    return <DraftResult data={resultData} onNewGame={handleNewGame} />;
  }

  // ===== BAN / PICK PHASE =====
  const allBans = [...playerBans, ...aiState.bans];
  const playerPicks = playerSlots.filter(s => s.hero).length;
  const aiPicks = aiState.slots.filter(s => s.hero).length;
  const progress = sequence.length > 0 ? (currentStep / sequence.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl font-body text-sm font-bold flex items-center gap-2 ${actionType === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {actionType === 'ban' ? <><Ban className="w-4 h-4" /> БАН</> : <><Shield className="w-4 h-4" /> ПИК</>}
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-sm font-body font-bold ${turn === 'player' ? 'bg-dota-gold/15 text-dota-gold animate-pulse' : 'bg-purple-500/15 text-purple-400'}`}>
            {turn === 'player' ? '⚡ Твой ход!' : `🤖 AI думает... (${AI_STRATEGIES[aiState.strategy].name})`}
          </div>
          <span className="text-xs font-mono text-slate-600">Шаг {currentStep + 1}/{sequence.length}</span>
        </div>

        {turn === 'player' && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timer <= 10 ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-white/[0.04] text-slate-300'}`}>
            <Timer className="w-4 h-4" /> {timer}с
          </div>
        )}

        <button onClick={onBack} className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-body hover:bg-slate-700 transition-all duration-300">Выйти</button>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-dota-gold to-emerald-500 transition-all duration-300 duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Sequence visualization */}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {sequence.map((step, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          const isPlayer = step.who === 'player';
          return (
            <div key={i} className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold border transition-all duration-300 ${
              isCurrent ? 'ring-2 ring-dota-gold/50 scale-110 z-10' : ''
            } ${isDone ? 'opacity-40' : ''} ${
              step.type === 'ban'
                ? isPlayer ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                : isPlayer ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
            }`} title={`${step.type === 'ban' ? 'Бан' : 'Пик'} — ${isPlayer ? 'Ты' : 'AI'}`}>
              {step.type === 'ban' ? 'B' : 'P'}
            </div>
          );
        })}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] gap-3">
        {/* Player */}
        <div className="rounded-2xl bg-dota-card/60 border border-emerald-500/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-body text-sm font-bold text-white uppercase tracking-wider">Ты</span>
          </div>
          <div className="space-y-1.5">
            {([1,2,3,4,5] as Position[]).map(pos => {
              const slot = playerSlots.find(s => s.position === pos);
              const hero = slot?.hero;
              const isSelected = selectedPosition === pos;
              const canSelect = actionType === 'pick' && turn === 'player' && !hero;
              return (
                <button key={pos} onClick={() => canSelect && setSelectedPosition(pos)} disabled={!canSelect}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 text-left ${
                    hero ? 'bg-white/[0.04]' : isSelected ? 'bg-dota-gold/10 ring-1 ring-dota-gold/40' : canSelect ? 'bg-white/2 hover:bg-white/[0.04] cursor-pointer border border-dashed border-dota-border/30' : 'bg-white/2 border border-dota-border/20'
                  }`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hero ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-slate-500'}`}>{pos}</div>
                  {hero ? (
                    <>
                      <img src={hero.icon} alt="" className="w-8 h-8 rounded" />
                      <AttrIcon attr={hero.primary_attr} size={12} />
                      <div className="min-w-0"><div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div><div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div></div>
                    </>
                  ) : (
                    <div><div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>{isSelected && <div className="text-[9px] text-dota-gold mt-0.5">← выбери героя</div>}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-dota-border/30 flex items-center justify-center">
            <Swords className="w-5 h-5 text-dota-gold" />
          </div>
        </div>

        {/* AI */}
        <div className="rounded-2xl bg-dota-card/60 border border-purple-500/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="font-body text-sm font-bold text-white uppercase tracking-wider">AI — {AI_STRATEGIES[aiState.strategy].name}</span>
            <Brain className="w-3 h-3 text-purple-400 ml-auto" />
          </div>
          <div className="space-y-1.5">
            {([1,2,3,4,5] as Position[]).map(pos => {
              const slot = aiState.slots.find(s => s.position === pos);
              const hero = slot?.hero;
              return (
                <div key={pos} className={`w-full flex items-center gap-2.5 p-2 rounded-xl ${hero ? 'bg-white/[0.04]' : 'bg-white/2 border border-dota-border/20'}`}>
                  <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hero ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-slate-500'}`}>{pos}</div>
                  {hero ? (
                    <>
                      <img src={hero.icon} alt="" className="w-8 h-8 rounded" />
                      <AttrIcon attr={hero.primary_attr} size={12} />
                      <div className="min-w-0"><div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div><div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div></div>
                    </>
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
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
          <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {allBans.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-red-500/10">
                <img src={h.icon} alt="" className="w-6 h-6 rounded grayscale" />
                <span className="text-xs font-body text-red-400 line-through">{h.localized_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick instruction */}
      {actionType === 'pick' && turn === 'player' && selectedPosition === null && (
        <div className="p-3 rounded-2xl bg-dota-gold/8 border border-dota-gold/15 text-center">
          <span className="text-base font-body text-dota-gold">👆 Нажми на позицию слева, потом выбери героя</span>
        </div>
      )}

      {/* Hero pool */}
      <div className="rounded-2xl bg-dota-card/60 border border-dota-border/20 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 text-white font-body text-base placeholder:text-slate-600 focus:border-white/15 focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
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
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${attrFilter === key ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/[0.04]'}`}>
                {label ? <span className="text-xs font-bold text-white">{label}</span> : <AttrIcon attr={attr!} size={20} />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[400px] overflow-y-auto">
          {filteredHeroes.map(hero => {
            const canClick = turn === 'player' && (actionType === 'ban' || (actionType === 'pick' && selectedPosition !== null));
            return (
              <button key={hero.id} onClick={() => handleHeroClick(hero)} disabled={!canClick}
                className={`group relative rounded-xl overflow-hidden transition-all duration-300 duration-150 ${canClick ? 'hover:scale-110 hover:z-10 hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                title={hero.localized_name}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-0.5 left-0.5"><AttrIcon attr={hero.primary_attr} size={12} /></div>
                <span className="absolute bottom-0 left-0 right-0 text-[9px] font-body font-bold text-white text-center p-1 truncate drop-shadow-lg">
                  {hero.localized_name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
