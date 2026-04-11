import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { GameProps, GameWrapper, randInt } from './shared';

// ============================================================
// INVOKER SPELL DATA
// ============================================================
const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities';
function abilIcon(name: string) { return `${ABILITY_CDN}/${name}.png`; }

const ORB_ICONS = {
  Q: abilIcon('invoker_quas'),
  W: abilIcon('invoker_wex'),
  E: abilIcon('invoker_exort'),
};

const ORB_COLORS = {
  Q: { bg: '#0e4f8a', border: '#1e90ff', glow: 'rgba(30,144,255,0.4)', name: 'Quas' },
  W: { bg: '#5b1a6e', border: '#b44aed', glow: 'rgba(180,74,237,0.4)', name: 'Wex' },
  E: { bg: '#8a3a0e', border: '#ff6a00', glow: 'rgba(255,106,0,0.4)', name: 'Exort' },
};

interface Spell {
  name: string;
  combo: [string, string, string]; // sorted orbs needed
  icon: string;
  color: string;
}

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

function comboLabel(combo: string[]): string {
  return combo.map(o => o).join(' ');
}

function matchCombo(orbs: string[], spell: Spell): boolean {
  const sorted = [...orbs].sort().join('');
  const target = [...spell.combo].sort().join('');
  return sorted === target;
}

function findSpellByOrbs(orbs: string[]): Spell | null {
  return SPELLS.find(s => matchCombo(orbs, s)) || null;
}

// ============================================================
// INVOKER GAME COMPONENT
// ============================================================
export function InvokerComboGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Invoker state
  const [orbs, setOrbs] = useState<string[]>([]);         // current 3 active orbs
  const [spellSlotD, setSpellSlotD] = useState<Spell | null>(null);
  const [spellSlotF, setSpellSlotF] = useState<Spell | null>(null);
  const [targetSpell, setTargetSpell] = useState<Spell | null>(null);

  // Feedback
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [castHistory, setCastHistory] = useState<{ spell: string; correct: boolean }[]>([]);

  const timerRef = useRef<any>(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  // Pick next random target spell
  const nextTarget = useCallback(() => {
    const idx = randInt(0, SPELLS.length - 1);
    setTargetSpell(SPELLS[idx]);
  }, []);

  // Start game
  const startGame = () => {
    setScore(0); setCombo(0); setMaxCombo(0); setTimeLeft(60);
    setOrbs([]); setSpellSlotD(null); setSpellSlotF(null);
    setCastHistory([]); setFlash(null);
    scoreRef.current = 0; comboRef.current = 0;
    setGameStarted(true); setGameOver(false);
    nextTarget();
  };

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          if (user) onSave('invoker-combo', scoreRef.current, Math.max(comboRef.current));
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  // Press Q/W/E — add orb (max 3, oldest drops off)
  const pressOrb = useCallback((orb: string) => {
    if (!gameStarted || gameOver) return;
    setOrbs(prev => {
      const next = [...prev, orb];
      if (next.length > 3) next.shift();
      return next;
    });
  }, [gameStarted, gameOver]);

  // Press R — Invoke (create spell from current orbs → push to D, old D goes to F)
  const pressInvoke = useCallback(() => {
    if (!gameStarted || gameOver || orbs.length < 3) return;
    const spell = findSpellByOrbs(orbs);
    if (!spell) return;
    // Shift: D → F, new spell → D
    setSpellSlotF(spellSlotD);
    setSpellSlotD(spell);
  }, [gameStarted, gameOver, orbs, spellSlotD]);

  // Press D or F — cast the spell in that slot
  const castSpell = useCallback((slot: 'D' | 'F') => {
    if (!gameStarted || gameOver || !targetSpell) return;
    const spell = slot === 'D' ? spellSlotD : spellSlotF;
    if (!spell) return;

    const correct = spell.name === targetSpell.name;
    setCastHistory(prev => [{ spell: spell.name, correct }, ...prev].slice(0, 10));

    if (correct) {
      setFlash('correct');
      comboRef.current++;
      const pts = 50 + comboRef.current * 10;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(m => Math.max(m, comboRef.current));
      setTimeLeft(t => Math.min(t + 3, 90)); // bonus time
      setTimeout(() => { setFlash(null); nextTarget(); }, 300);
    } else {
      setFlash('wrong');
      comboRef.current = 0;
      setCombo(0);
      setTimeout(() => setFlash(null), 400);
    }
  }, [gameStarted, gameOver, targetSpell, spellSlotD, spellSlotF, nextTarget]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (k === 'Q' || k === 'W' || k === 'E') pressOrb(k);
      else if (k === 'R') pressInvoke();
      else if (k === 'D') castSpell('D');
      else if (k === 'F') castSpell('F');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pressOrb, pressInvoke, castSpell]);

  const restart = startGame;

  // ============================================================
  // RENDER
  // ============================================================
  if (!gameStarted) {
    return (
      <GameWrapper title="Инвокер" icon={Zap} color="from-blue-400 to-cyan-400"
        score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
        <div className="text-center py-12">
          <img src={abilIcon('invoker_invoke')} alt="" className="w-20 h-20 mx-auto mb-4 rounded-xl border-2 border-dota-gold/30" />
          <h3 className="font-display text-2xl font-bold text-white mb-3">Invoker Trainer</h3>
          <p className="text-slate-400 font-body mb-2 max-w-lg mx-auto">
            Нажимай Q, W, E для выбора сфер. R — Invoke (создать заклинание). D/F — скастовать. Собери нужное заклинание как можно быстрее!
          </p>
          <div className="flex items-center justify-center gap-6 mb-6 mt-4">
            {(['Q', 'W', 'E'] as const).map(orb => (
              <div key={orb} className="flex flex-col items-center gap-1">
                <img src={ORB_ICONS[orb]} alt="" className="w-10 h-10 rounded-lg" />
                <span className="text-xs font-body text-slate-500">{orb} — {ORB_COLORS[orb].name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-body mb-6">Клавиатура: Q, W, E, R, D, F · Или нажимай кнопки</p>
          <button onClick={startGame} className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-body font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-orange-500/30">
            Начать
          </button>
        </div>
      </GameWrapper>
    );
  }

  if (gameOver) {
    return (
      <GameWrapper title="Инвокер" icon={Zap} color="from-blue-400 to-cyan-400"
        score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Время вышло!</h3>
          <p className="text-slate-400 font-body mb-2">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo}</p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-body font-bold hover:scale-105 transition-transform">Ещё раз</button>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper title="Инвокер" icon={Zap} color="from-blue-400 to-cyan-400"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>

      <div className={`transition-all duration-150 rounded-2xl ${
        flash === 'correct' ? 'ring-2 ring-green-500/50 bg-green-500/5' :
        flash === 'wrong' ? 'ring-2 ring-red-500/50 bg-red-500/5' : ''
      }`}>

        {/* Timer bar */}
        <div className="relative h-3 rounded-full bg-dota-card overflow-hidden border border-dota-border/30 mb-5">
          <div className="h-full rounded-full transition-all duration-1000" style={{
            width: `${(timeLeft / 90) * 100}%`,
            background: timeLeft > 20 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
          }} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/70">{timeLeft}s</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* === LEFT: Main game area === */}
          <div className="space-y-5">

            {/* Target spell */}
            {targetSpell && (
              <div className="rounded-2xl bg-dota-card/80 border border-dota-border/50 p-5 text-center">
                <p className="text-xs font-body text-slate-500 mb-2 uppercase tracking-wider">Скастуй заклинание</p>
                <div className="flex items-center justify-center gap-4">
                  <img src={abilIcon(targetSpell.icon)} alt="" className="w-16 h-16 rounded-xl border-2 shadow-lg"
                    style={{ borderColor: targetSpell.color, boxShadow: `0 0 20px ${targetSpell.color}40` }} />
                  <div className="text-left">
                    <h3 className="font-display text-xl font-bold text-white">{targetSpell.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {targetSpell.combo.map((orb, i) => (
                        <img key={i} src={ORB_ICONS[orb as keyof typeof ORB_ICONS]} alt={orb}
                          className="w-6 h-6 rounded" />
                      ))}
                      <span className="text-xs font-body text-slate-500 ml-2">+ R → D/F</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Current orbs (3 active) */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2].map(i => {
                const orb = orbs[i] as keyof typeof ORB_COLORS | undefined;
                return (
                  <div key={i} className="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={orb ? {
                      borderColor: ORB_COLORS[orb].border,
                      background: ORB_COLORS[orb].bg,
                      boxShadow: `0 0 15px ${ORB_COLORS[orb].glow}`,
                    } : {
                      borderColor: '#333',
                      borderStyle: 'dashed',
                      background: 'transparent',
                    }}>
                    {orb ? (
                      <img src={ORB_ICONS[orb]} alt={orb} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-slate-700 text-lg">?</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Spell slots D & F */}
            <div className="flex items-center justify-center gap-4">
              {([
                { key: 'D', spell: spellSlotD },
                { key: 'F', spell: spellSlotF },
              ] as const).map(({ key, spell }) => (
                <button key={key} onClick={() => castSpell(key)}
                  className="group relative flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-110"
                    style={spell ? {
                      borderColor: spell.color,
                      background: `${spell.color}15`,
                      boxShadow: `0 0 12px ${spell.color}30`,
                    } : {
                      borderColor: '#333',
                      background: '#111923',
                    }}>
                    {spell ? (
                      <img src={abilIcon(spell.icon)} alt="" className="w-10 h-10 rounded-lg" />
                    ) : (
                      <span className="text-slate-600 text-xl font-bold">{key}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-body text-slate-500 font-bold">{key}</span>
                  {spell && (
                    <span className="text-[9px] font-body text-slate-600 truncate max-w-[60px]">{spell.name}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Control buttons: Q W E — R (Invoke) */}
            <div className="flex items-center justify-center gap-3">
              {(['Q', 'W', 'E'] as const).map(orb => (
                <button key={orb} onClick={() => pressOrb(orb)}
                  className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 hover:scale-110 active:scale-95 transition-transform"
                  style={{
                    borderColor: ORB_COLORS[orb].border,
                    background: `linear-gradient(135deg, ${ORB_COLORS[orb].bg}, #0a0e13)`,
                    boxShadow: `0 4px 15px ${ORB_COLORS[orb].glow}`,
                  }}>
                  <img src={ORB_ICONS[orb]} alt="" className="w-8 h-8 rounded" />
                  <span className="text-[10px] font-bold text-white/80">{orb}</span>
                </button>
              ))}

              {/* Invoke button (R) */}
              <button onClick={pressInvoke}
                className="w-16 h-16 rounded-xl border-2 border-dota-gold/60 flex flex-col items-center justify-center gap-0.5 hover:scale-110 active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #3d2b08, #0a0e13)',
                  boxShadow: '0 4px 15px rgba(218,165,32,0.3)',
                }}>
                <img src={abilIcon('invoker_invoke')} alt="" className="w-8 h-8 rounded" />
                <span className="text-[10px] font-bold text-dota-gold">R</span>
              </button>
            </div>
          </div>

          {/* === RIGHT: Spell list === */}
          <div className="rounded-2xl bg-dota-card/60 border border-dota-border/30 p-3 overflow-y-auto max-h-[480px]">
            <h4 className="font-display text-sm font-bold text-slate-400 mb-2 text-center uppercase tracking-wider">Заклинания</h4>
            <div className="space-y-1.5">
              {SPELLS.map(spell => {
                const isTarget = targetSpell?.name === spell.name;
                return (
                  <div key={spell.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${
                    isTarget ? 'bg-dota-gold/10 border border-dota-gold/20' : 'hover:bg-white/3'
                  }`}>
                    <img src={abilIcon(spell.icon)} alt="" className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={isTarget ? { boxShadow: `0 0 8px ${spell.color}60` } : {}} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-body font-semibold truncate ${isTarget ? 'text-dota-gold' : 'text-slate-300'}`}>
                        {spell.name}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {spell.combo.map((orb, i) => (
                          <span key={i} className="text-[10px] font-bold" style={{ color: ORB_COLORS[orb as keyof typeof ORB_COLORS].border }}>
                            {orb}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cast history */}
            {castHistory.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dota-border/20">
                <p className="text-[10px] font-body text-slate-600 mb-1 text-center">Последние касты</p>
                <div className="space-y-0.5">
                  {castHistory.slice(0, 5).map((c, i) => (
                    <div key={i} className={`text-[10px] font-body px-2 py-0.5 rounded ${
                      c.correct ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {c.correct ? '✓' : '✗'} {c.spell}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameWrapper>
  );
}
