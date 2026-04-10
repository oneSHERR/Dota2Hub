import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { GameProps, GameWrapper, randInt } from './shared';

const INVOKER_SPELLS: Record<string, { combo: string[]; name: string; icon: string; color: string }> = {
  'Cold Snap': { combo: ['Q', 'Q', 'Q'], name: 'Cold Snap', icon: 'invoker_cold_snap', color: '#00B4F0' },
  'Ghost Walk': { combo: ['Q', 'Q', 'W'], name: 'Ghost Walk', icon: 'invoker_ghost_walk', color: '#9B59B6' },
  'Ice Wall': { combo: ['Q', 'Q', 'E'], name: 'Ice Wall', icon: 'invoker_ice_wall', color: '#3498DB' },
  'EMP': { combo: ['W', 'W', 'W'], name: 'EMP', icon: 'invoker_emp', color: '#2ECC71' },
  'Tornado': { combo: ['W', 'W', 'Q'], name: 'Tornado', icon: 'invoker_tornado', color: '#1ABC9C' },
  'Alacrity': { combo: ['W', 'W', 'E'], name: 'Alacrity', icon: 'invoker_alacrity', color: '#F39C12' },
  'Sun Strike': { combo: ['E', 'E', 'E'], name: 'Sun Strike', icon: 'invoker_sun_strike', color: '#E74C3C' },
  'Forge Spirit': { combo: ['E', 'E', 'Q'], name: 'Forge Spirit', icon: 'invoker_forge_spirit', color: '#E67E22' },
  'Chaos Meteor': { combo: ['E', 'E', 'W'], name: 'Chaos Meteor', icon: 'invoker_chaos_meteor', color: '#C0392B' },
  'Deafening Blast': { combo: ['Q', 'W', 'E'], name: 'Deafening Blast', icon: 'invoker_deafening_blast', color: '#8E44AD' },
};

export function InvokerComboGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentSpell, setCurrentSpell] = useState<any>(null);
  const [input, setInput] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<any>(null);
  const spellNames = Object.keys(INVOKER_SPELLS);

  const nextSpell = useCallback(() => {
    const name = spellNames[randInt(0, spellNames.length - 1)];
    setCurrentSpell(INVOKER_SPELLS[name]);
    setInput([]);
  }, []);

  useEffect(() => { if (gameStarted && !gameOver) nextSpell(); }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); setGameOver(true); if (user) onSave('invoker-combo', score, maxCombo); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 300; canvas.height = 80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const orbColors: Record<string, string> = { Q: '#00B4F0', W: '#8B5CF6', E: '#EF4444' };
    const cx = canvas.width / 2;
    input.forEach((orb, i) => {
      const x = cx + (i - 1) * 60; const y = 40; const r = 22;
      const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.5);
      glow.addColorStop(0, orbColors[orb] + '80'); glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow; ctx.fillRect(x - r * 2, y - r * 2, r * 4, r * 4);
      const grad = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, r);
      grad.addColorStop(0, 'white'); grad.addColorStop(0.3, orbColors[orb]); grad.addColorStop(1, orbColors[orb] + '40');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = orbColors[orb]; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'white'; ctx.font = 'bold 16px "Exo 2"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(orb, x, y + 1);
    });
    for (let i = input.length; i < 3; i++) {
      const x = cx + (i - 1) * 60;
      ctx.beginPath(); ctx.arc(x, 40, 22, 0, Math.PI * 2); ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
  }, [input]);

  const pressKey = (key: string) => {
    if (gameOver || !currentSpell) return;
    const newInput = [...input, key].slice(-3); setInput(newInput);
    if (newInput.length === 3) {
      const sorted = [...newInput].sort().join(''); const target = [...currentSpell.combo].sort().join('');
      if (sorted === target) {
        setFlash('correct'); setScore(s => s + 50 + combo * 10);
        setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
        setTimeLeft(t => Math.min(t + 2, 60));
        setTimeout(() => { setFlash(null); nextSpell(); }, 400);
      } else { setFlash('wrong'); setCombo(0); setTimeout(() => { setFlash(null); setInput([]); }, 500); }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { const k = e.key.toUpperCase(); if (['Q', 'W', 'E'].includes(k)) pressKey(k); };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [input, gameOver, currentSpell, combo]);

  const restart = () => { setScore(0); setCombo(0); setMaxCombo(0); setTimeLeft(60); setGameOver(false); setGameStarted(true); setInput([]); setFlash(null); };

  return (
    <GameWrapper title="Инвокер" icon={Zap} color="from-blue-400 to-cyan-400"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      {!gameStarted ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="font-display text-2xl font-bold text-white mb-3">Комбинации Инвокера</h3>
          <p className="text-slate-400 font-body mb-2 max-w-md mx-auto">Собирай правильные комбинации Q, W, E за 60 секунд. Порядок не важен — важно набрать нужные сферы!</p>
          <p className="text-xs text-slate-500 font-body mb-6">Используй клавиатуру Q, W, E или кнопки</p>
          <button onClick={() => setGameStarted(true)} className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-body font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-500/30">Начать</button>
        </div>
      ) : gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Время вышло!</h3>
          <p className="text-slate-400 font-body mb-2">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo}</p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-body font-bold hover:scale-105 transition-transform">Ещё раз</button>
        </div>
      ) : (
        <div className={`space-y-6 transition-all duration-150 ${flash === 'correct' ? 'bg-green-500/5 rounded-2xl' : flash === 'wrong' ? 'bg-red-500/5 rounded-2xl' : ''}`}>
          <div className="relative h-3 rounded-full bg-dota-card overflow-hidden border border-dota-border/30">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / 60) * 100}%`, background: timeLeft > 20 ? 'linear-gradient(90deg, #3B82F6, #06B6D4)' : 'linear-gradient(90deg, #EF4444, #F97316)' }} />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/70">{timeLeft}s</span>
          </div>
          {currentSpell && (
            <div className="rounded-2xl bg-dota-card/80 border border-dota-border/50 p-6 text-center">
              <p className="text-sm font-body text-slate-400 mb-2">Собери заклинание:</p>
              <h3 className="font-display text-2xl font-bold mb-2" style={{ color: currentSpell.color }}>{currentSpell.name}</h3>
              <div className="flex items-center justify-center gap-2">
                {currentSpell.combo.map((orb: string, i: number) => (
                  <span key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${orb === 'Q' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : orb === 'W' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>{orb}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-center"><canvas ref={canvasRef} width={300} height={80} /></div>
          <div className="flex items-center justify-center gap-4">
            {[{ key: 'Q', color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/30' }, { key: 'W', color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/30' }, { key: 'E', color: 'from-red-500 to-red-700', shadow: 'shadow-red-500/30' }].map(({ key, color, shadow }) => (
              <button key={key} onClick={() => pressKey(key)} className={`w-20 h-20 rounded-2xl bg-gradient-to-b ${color} text-white font-display text-3xl font-bold shadow-xl ${shadow} hover:scale-110 active:scale-95 transition-transform`}>{key}</button>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
