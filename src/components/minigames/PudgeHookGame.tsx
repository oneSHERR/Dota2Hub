import { useState, useEffect, useRef } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { Crosshair } from 'lucide-react';
import { GameProps, GameWrapper, randInt } from './shared';

export function PudgeHookGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hooks, setHooks] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<any>({ pudgeX: 0, pudgeY: 0, targets: [] as any[], hook: null as any, particles: [] as any[] });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const hooksRef = useRef(10);
  const animRef = useRef<number>(0);

  const spawnTargets = (count: number) => {
    const targets = [];
    for (let i = 0; i < count; i++) {
      targets.push({ x: randInt(80, 700), y: randInt(60, 250), speed: (1 + Math.random() * 2) * (Math.random() > 0.5 ? 1 : -1), radius: 18, heroIdx: randInt(0, ALL_HEROES.length - 1), alive: true });
    }
    return targets;
  };

  const startGame = () => {
    const gs = gameStateRef.current;
    gs.pudgeX = 400; gs.pudgeY = 380; gs.targets = spawnTargets(4); gs.hook = null; gs.particles = [];
    scoreRef.current = 0; comboRef.current = 0; hooksRef.current = 10;
    setScore(0); setCombo(0); setMaxCombo(0); setHooks(10); setGameStarted(true); setGameOver(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 800; canvas.height = 440;
    const gs = gameStateRef.current;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#0a1628'); bgGrad.addColorStop(0.5, '#0d1f2d'); bgGrad.addColorStop(1, '#071018');
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      gs.targets.forEach((t: any) => {
        if (!t.alive) return;
        t.x += t.speed; if (t.x < 30 || t.x > canvas.width - 30) t.speed *= -1;
        const glow = ctx.createRadialGradient(t.x, t.y, 5, t.x, t.y, 35);
        glow.addColorStop(0, 'rgba(231,76,60,0.3)'); glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow; ctx.fillRect(t.x - 35, t.y - 35, 70, 70);
        ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#1a2332'; ctx.fill(); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Exo 2"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(ALL_HEROES[t.heroIdx]?.localized_name?.slice(0, 3) || '?', t.x, t.y);
      });

      if (gs.hook) {
        const h = gs.hook;
        h.x += h.dx * 12; h.y += h.dy * 12; h.trail.push({ x: h.x, y: h.y }); if (h.trail.length > 20) h.trail.shift();
        ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gs.pudgeX, gs.pudgeY);
        h.trail.forEach((p: any) => ctx.lineTo(p.x, p.y)); ctx.lineTo(h.x, h.y); ctx.stroke();
        for (let i = 0; i < h.trail.length; i += 3) { const p = h.trail[i]; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#A0885B'; ctx.fill(); }
        ctx.beginPath(); ctx.arc(h.x, h.y, 8, 0, Math.PI * 2); ctx.fillStyle = '#CD853F'; ctx.fill(); ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(h.x + h.dx * 12, h.y + h.dy * 12); ctx.lineTo(h.x - h.dy * 6, h.y + h.dx * 6); ctx.lineTo(h.x + h.dy * 6, h.y - h.dx * 6); ctx.closePath(); ctx.fillStyle = '#DDD'; ctx.fill();
        let hit = false;
        gs.targets.forEach((t: any) => {
          if (!t.alive) return;
          const dist = Math.sqrt((h.x - t.x) ** 2 + (h.y - t.y) ** 2);
          if (dist < t.radius + 10) {
            t.alive = false; hit = true;
            for (let i = 0; i < 12; i++) gs.particles.push({ x: t.x, y: t.y, dx: (Math.random() - 0.5) * 6, dy: (Math.random() - 0.5) * 6, life: 30, color: `hsl(${randInt(0, 30)}, 80%, 60%)` });
            comboRef.current++; scoreRef.current += 100 + comboRef.current * 20;
            setScore(scoreRef.current); setCombo(comboRef.current); setMaxCombo(m => Math.max(m, comboRef.current));
          }
        });
        if (hit) gs.hook = null;
        if (h.x < -20 || h.x > canvas.width + 20 || h.y < -20 || h.y > canvas.height + 20) { gs.hook = null; comboRef.current = 0; setCombo(0); }
        if (gs.targets.every((t: any) => !t.alive)) gs.targets = spawnTargets(4 + Math.floor(scoreRef.current / 500));
      }

      gs.particles = gs.particles.filter((p: any) => { p.x += p.dx; p.y += p.dy; p.life--; ctx.globalAlpha = p.life / 30; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); ctx.globalAlpha = 1; return p.life > 0; });

      const px = gs.pudgeX; const py = gs.pudgeY;
      ctx.beginPath(); ctx.arc(px, py, 28, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(px - 5, py - 5, 5, px, py, 28); bodyGrad.addColorStop(0, '#4a6741'); bodyGrad.addColorStop(1, '#2d3d28');
      ctx.fillStyle = bodyGrad; ctx.fill(); ctx.strokeStyle = '#5a7750'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(px - 8, py - 6, 4, 0, Math.PI * 2); ctx.fillStyle = '#ffddaa'; ctx.fill();
      ctx.beginPath(); ctx.arc(px + 8, py - 6, 4, 0, Math.PI * 2); ctx.fillStyle = '#ffddaa'; ctx.fill();
      ctx.beginPath(); ctx.arc(px - 8, py - 6, 2, 0, Math.PI * 2); ctx.fillStyle = '#c00'; ctx.fill();
      ctx.beginPath(); ctx.arc(px + 8, py - 6, 2, 0, Math.PI * 2); ctx.fillStyle = '#c00'; ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px - 10, py + 8);
      for (let i = 0; i < 5; i++) ctx.lineTo(px - 10 + i * 5, py + 8 + (i % 2 === 0 ? -3 : 3)); ctx.stroke();

      ctx.fillStyle = '#daa520'; ctx.font = 'bold 14px "Exo 2"'; ctx.textAlign = 'left';
      ctx.fillText(`Хуки: ${hooksRef.current}`, 15, 25); ctx.fillStyle = '#e74c3c'; ctx.fillText(`Счёт: ${scoreRef.current}`, 15, 45);

      if (hooksRef.current <= 0 && !gs.hook) { setGameOver(true); if (user) onSave('pudge-hook', scoreRef.current, Math.max(maxCombo, comboRef.current)); return; }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !gameStarted) return;
    const gs = gameStateRef.current; if (gs.hook || hooksRef.current <= 0) return;
    const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const angle = Math.atan2(my - gs.pudgeY, mx - gs.pudgeX);
    gs.hook = { x: gs.pudgeX, y: gs.pudgeY, dx: Math.cos(angle), dy: Math.sin(angle), trail: [] };
    hooksRef.current--; setHooks(hooksRef.current);
  };

  return (
    <GameWrapper title="Хук Пуджа" icon={Crosshair} color="from-green-500 to-emerald-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={startGame}>
      {!gameStarted ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🪝</div>
          <h3 className="font-display text-2xl font-bold text-white mb-3">Хук Пуджа</h3>
          <p className="text-slate-400 font-body mb-6 max-w-md mx-auto">Кликни, чтобы бросить хук в движущиеся цели. 10 хуков — попади по максимуму!</p>
          <button onClick={startGame} className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-body font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-green-500/30">Начать</button>
        </div>
      ) : gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🪝</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Хуки кончились!</h3>
          <p className="text-slate-400 font-body mb-2">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-body font-bold hover:scale-105 transition-transform">Ещё раз</button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-body text-slate-500">Хуков осталось:</span>
            {Array.from({ length: 10 }).map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full ${i < hooks ? 'bg-green-500' : 'bg-slate-700'}`} />))}
          </div>
          <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full rounded-2xl border border-dota-border/50 cursor-crosshair" style={{ maxWidth: 800, aspectRatio: '800/440' }} />
          <p className="text-xs font-body text-slate-600 text-center mt-2">Кликни, чтобы бросить хук</p>
        </div>
      )}
    </GameWrapper>
  );
}
