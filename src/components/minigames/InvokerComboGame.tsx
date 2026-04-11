import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { GameProps, GameWrapper, randInt } from './shared';

const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities';
function abilIcon(name: string) { return `${ABILITY_CDN}/${name}.png`; }

const ORB_ICONS: Record<string, string> = {
  Q: abilIcon('invoker_quas'),
  W: abilIcon('invoker_wex'),
  E: abilIcon('invoker_exort'),
};

const ORB_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  Q: { bg: '#0e4f8a', border: '#1e90ff', glow: 'rgba(30,144,255,0.5)' },
  W: { bg: '#5b1a6e', border: '#b44aed', glow: 'rgba(180,74,237,0.5)' },
  E: { bg: '#8a3a0e', border: '#ff6a00', glow: 'rgba(255,106,0,0.5)' },
};

interface Spell { name: string; combo: string[]; icon: string; color: string; }

const SPELLS: Spell[] = [
  { name: 'Cold Snap',       combo: ['Q','Q','Q'], icon: 'invoker_cold_snap',       color: '#1e90ff' },
  { name: 'Ghost Walk',      combo: ['Q','Q','W'], icon: 'invoker_ghost_walk',      color: '#9370db' },
  { name: 'Ice Wall',        combo: ['Q','Q','E'], icon: 'invoker_ice_wall',        color: '#4fc3f7' },
  { name: 'EMP',             combo: ['W','W','W'], icon: 'invoker_emp',             color: '#b44aed' },
  { name: 'Tornado',         combo: ['Q','W','W'], icon: 'invoker_tornado',         color: '#26c6da' },
  { name: 'Alacrity',        combo: ['E','W','W'], icon: 'invoker_alacrity',        color: '#ffb74d' },
  { name: 'Sun Strike',      combo: ['E','E','E'], icon: 'invoker_sun_strike',      color: '#ff6a00' },
  { name: 'Forge Spirit',    combo: ['E','E','Q'], icon: 'invoker_forge_spirit',    color: '#ff8a65' },
  { name: 'Chaos Meteor',    combo: ['E','E','W'], icon: 'invoker_chaos_meteor',    color: '#d32f2f' },
  { name: 'Deafening Blast', combo: ['E','Q','W'], icon: 'invoker_deafening_blast', color: '#7e57c2' },
];

function findSpell(orbs: string[]): Spell | null {
  if (orbs.length < 3) return null;
  const s = [...orbs].sort().join('');
  return SPELLS.find(sp => [...sp.combo].sort().join('') === s) || null;
}

// Shuffle spells to create a queue of all 10
function shuffleSpells(): Spell[] {
  const arr = [...SPELLS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function InvokerComboGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0); // counts UP
  const [orbs, setOrbs] = useState<string[]>([]);
  const [invokedSpell, setInvokedSpell] = useState<Spell | null>(null);
  const [showComboHint, setShowComboHint] = useState(true); // show/hide combo under target
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  // Spell queue — all 10 spells in random order
  const [spellQueue, setSpellQueue] = useState<Spell[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [castSpells, setCastSpells] = useState<Set<string>>(new Set());

  const targetSpell = spellQueue[currentIndex] || null;

  // Refs for keyboard handler
  const ref = useRef({ orbs: [] as string[], queue: [] as Spell[], idx: 0, score: 0, combo: 0, maxCombo: 0, over: false, started: false });
  useEffect(() => { ref.current.orbs = orbs; }, [orbs]);
  useEffect(() => { ref.current.queue = spellQueue; ref.current.idx = currentIndex; }, [spellQueue, currentIndex]);
  useEffect(() => { ref.current.over = gameOver; }, [gameOver]);
  useEffect(() => { ref.current.started = gameStarted; }, [gameStarted]);

  const startGame = useCallback(() => {
    const q = shuffleSpells();
    ref.current = { orbs: [], queue: q, idx: 0, score: 0, combo: 0, maxCombo: 0, over: false, started: true };
    setSpellQueue(q); setCurrentIndex(0); setCastSpells(new Set());
    setScore(0); setCombo(0); setMaxCombo(0); setTimer(0);
    setOrbs([]); setInvokedSpell(null); setFlash(null); setShowComboHint(true);
    setGameStarted(true); setGameOver(false);
  }, []);

  // Timer counting UP
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameStarted, gameOver]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!ref.current.started || ref.current.over) return;
      const k = e.key.toUpperCase();
      if (['Q','W','E','R','H'].includes(k)) e.preventDefault();

      if (k === 'Q' || k === 'W' || k === 'E') {
        const next = [...ref.current.orbs, k];
        if (next.length > 3) next.shift();
        ref.current.orbs = next;
        setOrbs([...next]);
        return;
      }

      if (k === 'R') {
        const spell = findSpell(ref.current.orbs);
        if (!spell) return;
        const target = ref.current.queue[ref.current.idx];
        if (!target) return;
        setInvokedSpell(spell);

        if (spell.name === target.name) {
          setFlash('correct');
          ref.current.combo++;
          if (ref.current.combo > ref.current.maxCombo) ref.current.maxCombo = ref.current.combo;
          ref.current.score += 50 + ref.current.combo * 10;
          setScore(ref.current.score); setCombo(ref.current.combo); setMaxCombo(ref.current.maxCombo);
          setCastSpells(prev => new Set(prev).add(target.name));

          // Check if all 10 done
          if (ref.current.idx + 1 >= ref.current.queue.length) {
            ref.current.over = true;
            setTimeout(() => {
              setGameOver(true);
              if (user) onSave('invoker-combo', ref.current.score, ref.current.maxCombo);
            }, 300);
          } else {
            ref.current.idx++;
            setTimeout(() => { setFlash(null); setInvokedSpell(null); setCurrentIndex(ref.current.idx); }, 250);
          }
        } else {
          setFlash('wrong');
          ref.current.combo = 0; setCombo(0);
          setTimeout(() => setFlash(null), 350);
        }
        return;
      }

      if (k === 'H') setShowComboHint(v => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Format timer
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ---- PRE GAME ----
  if (!gameStarted) {
    return (
      <GameWrapper title="Инвокер" icon={Zap} color="from-amber-500 to-orange-600"
        score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={startGame}>
        <div className="text-center py-10">
          <img src={abilIcon('invoker_invoke')} alt="" className="w-20 h-20 mx-auto mb-4 rounded-xl border-2 border-dota-gold/30" />
          <h3 className="font-display text-3xl font-bold text-white mb-3">Invoker Trainer</h3>
          <p className="text-slate-400 font-body mb-6 max-w-md mx-auto">
            Скастуй все 10 заклинаний как можно быстрее. Таймер считает время — чем меньше, тем лучше!
          </p>
          <div className="max-w-xs mx-auto text-left space-y-2.5 mb-8">
            <p className="flex items-center gap-3 text-sm font-body text-slate-300">
              <span className="flex gap-1">{['Q','W','E'].map(k=><kbd key={k} className="px-2 py-1 rounded bg-dota-card border border-dota-border text-xs font-mono font-bold text-white">{k}</kbd>)}</span>
              <span className="text-slate-500">— сферы</span>
            </p>
            <p className="flex items-center gap-3 text-sm font-body text-slate-300">
              <kbd className="px-2.5 py-1 rounded bg-dota-card border border-dota-gold/40 text-xs font-mono font-bold text-dota-gold">R</kbd>
              <span className="text-slate-500">— Invoke + каст</span>
            </p>
            <p className="flex items-center gap-3 text-sm font-body text-slate-300">
              <kbd className="px-2.5 py-1 rounded bg-dota-card border border-dota-border text-xs font-mono font-bold text-white">H</kbd>
              <span className="text-slate-500">— показать / скрыть подсказку комбо</span>
            </p>
          </div>
          <button onClick={startGame} className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-body font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-orange-500/30">Начать</button>
        </div>
      </GameWrapper>
    );
  }

  // ---- GAME OVER ----
  if (gameOver) {
    return (
      <GameWrapper title="Инвокер" icon={Zap} color="from-amber-500 to-orange-600"
        score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={startGame}>
        <div className="text-center py-10">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Все 10 заклинаний!</h3>
          <p className="text-slate-300 font-body mb-1">Время: <span className="text-dota-gold font-bold text-2xl">{formatTime(timer)}</span></p>
          <p className="text-slate-400 font-body mb-1">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-body font-bold hover:scale-105 transition-transform">Ещё раз</button>
        </div>
      </GameWrapper>
    );
  }

  // ---- ACTIVE GAME ----
  return (
    <GameWrapper title="Инвокер" icon={Zap} color="from-amber-500 to-orange-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={startGame}>
      <div className={`transition-all duration-100 rounded-2xl ${flash === 'correct' ? 'ring-2 ring-green-500/50' : flash === 'wrong' ? 'ring-2 ring-red-500/50' : ''}`}>

        {/* Timer + Progress */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-slate-500">Время:</span>
            <span className="font-mono font-bold text-lg text-white">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-slate-500">{currentIndex}/10</span>
            <div className="w-32 h-2 rounded-full bg-dota-card overflow-hidden border border-dota-border/30">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-green-500 transition-all duration-300"
                style={{ width: `${(currentIndex / 10) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Target spell */}
        {targetSpell && (
          <div className="rounded-2xl bg-dota-card/80 border border-dota-border/50 p-5 mb-5 text-center">
            <p className="text-[10px] font-body text-slate-600 uppercase tracking-widest mb-3">Скастуй заклинание</p>
            <div className="flex items-center justify-center gap-4">
              <img src={abilIcon(targetSpell.icon)} alt="" className="w-[68px] h-[68px] rounded-xl border-2"
                style={{ borderColor: targetSpell.color, boxShadow: `0 0 20px ${targetSpell.color}40` }} />
              <div className="text-left">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">{targetSpell.name}</h3>
                {/* Combo hint — toggleable */}
                {showComboHint && (
                  <div className="flex items-center gap-1 mt-1.5 animate-fade-in">
                    {targetSpell.combo.map((o, i) => <img key={i} src={ORB_ICONS[o]} alt="" className="w-6 h-6 rounded" />)}
                    <span className="text-slate-600 text-xs ml-2 font-body">→ R</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orbs + invoked */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="flex items-center gap-2">
            {[0,1,2].map(i => {
              const o = orbs[i]; const c = o ? ORB_COLORS[o] : null;
              return (
                <div key={i} className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-100"
                  style={c ? { borderColor: c.border, background: c.bg, boxShadow: `0 0 14px ${c.glow}` } : { borderColor: '#2a2a2a', borderStyle: 'dashed' }}>
                  {o && <img src={ORB_ICONS[o]} alt="" className="w-9 h-9 rounded-full" />}
                </div>
              );
            })}
          </div>
          <span className="text-slate-600 text-lg">→</span>
          <div className="w-14 h-14 rounded-xl border-2 flex items-center justify-center"
            style={invokedSpell ? { borderColor: invokedSpell.color, background: `${invokedSpell.color}15`, boxShadow: `0 0 12px ${invokedSpell.color}30` } : { borderColor: '#2a2a2a', background: '#111923' }}>
            {invokedSpell ? <img src={abilIcon(invokedSpell.icon)} alt="" className="w-10 h-10 rounded-lg" /> : <span className="text-slate-700 text-xs font-mono">R</span>}
          </div>
        </div>

        {/* Key indicators */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {(['Q','W','E'] as const).map(o => (
            <div key={o} className="w-10 h-10 rounded-lg border flex items-center justify-center" style={{ borderColor: ORB_COLORS[o].border+'60', background: ORB_COLORS[o].bg+'40' }}>
              <img src={ORB_ICONS[o]} alt="" className="w-6 h-6 rounded" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-lg border border-dota-gold/40 flex items-center justify-center ml-1" style={{ background: '#2a1f0a' }}>
            <img src={abilIcon('invoker_invoke')} alt="" className="w-6 h-6 rounded" />
          </div>
        </div>

        {/* Hint toggle */}
        <div className="flex justify-center mb-4">
          <button onClick={() => setShowComboHint(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dota-card border border-dota-border/30 text-xs font-body text-slate-400 hover:text-white hover:border-white/15 transition-colors">
            {showComboHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showComboHint ? 'Скрыть подсказку (H)' : 'Показать подсказку (H)'}
          </button>
        </div>

        {/* Spell list — always visible, shows progress */}
        <div className="rounded-2xl bg-dota-card/50 border border-dota-border/20 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {SPELLS.map(sp => {
              const isTarget = targetSpell?.name === sp.name;
              const isDone = castSpells.has(sp.name);
              return (
                <div key={sp.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                  isTarget ? 'bg-dota-gold/10 border border-dota-gold/25 ring-1 ring-dota-gold/20' :
                  isDone ? 'bg-green-500/5 border border-green-500/15' : 'bg-dota-bg/30'
                }`}>
                  <div className="relative flex-shrink-0">
                    <img src={abilIcon(sp.icon)} alt="" className={`w-7 h-7 rounded-lg ${isDone && !isTarget ? 'opacity-40' : ''}`} />
                    {isDone && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center text-[7px] text-white font-bold">✓</span>}
                  </div>
                  <div>
                    <p className={`text-[10px] font-body font-bold truncate ${
                      isTarget ? 'text-dota-gold' : isDone ? 'text-green-400/60' : 'text-slate-400'
                    }`}>{sp.name}</p>
                    <div className="flex gap-0.5">
                      {sp.combo.map((o,i) => <span key={i} className="text-[9px] font-bold" style={{ color: ORB_COLORS[o].border + (isDone && !isTarget ? '50' : '') }}>{o}</span>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
