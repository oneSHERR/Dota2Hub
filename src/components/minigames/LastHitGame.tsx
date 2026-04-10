import { useState, useEffect, useRef } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { Sword } from 'lucide-react';
import { GameProps, GameWrapper, randInt } from './shared';

interface Creep {
  x: number; y: number; hp: number; maxHp: number; speed: number;
  isEnemy: boolean; goldValue: number; width: number; height: number;
  color: string; takingDamage: boolean; damageTimer: number;
}

export function LastHitGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [missed, setMissed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>({ creeps: [], particles: [], hero: { x: 400, attackCooldown: 0 }, totalGold: 0 });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const missedRef = useRef(0);
  const animRef = useRef<number>(0);
  const timeRef = useRef(45);

  const spawnWave = (): Creep[] => {
    const creeps: Creep[] = [];
    for (let i = 0; i < 4; i++) {
      const maxHp = 400 + randInt(0, 150);
      creeps.push({ x: 100 + i * 80, y: 260, hp: maxHp, maxHp, speed: 0.3, isEnemy: false, goldValue: randInt(36, 48), width: 28, height: 24, color: '#92A525', takingDamage: false, damageTimer: 0 });
    }
    for (let i = 0; i < 3; i++) {
      creeps.push({ x: 580 + i * 70, y: 260, hp: 500, maxHp: 500, speed: -0.3, isEnemy: true, goldValue: 0, width: 28, height: 24, color: '#C23C2A', takingDamage: false, damageTimer: 0 });
    }
    return creeps;
  };

  const startGame = () => {
    const g = gameRef.current;
    g.creeps = spawnWave(); g.particles = []; g.hero = { x: 350, attackCooldown: 0 }; g.totalGold = 0;
    scoreRef.current = 0; comboRef.current = 0; missedRef.current = 0; timeRef.current = 45;
    setScore(0); setCombo(0); setMaxCombo(0); setMissed(0); setGameStarted(true); setGameOver(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 800; canvas.height = 380;
    const g = gameRef.current;
    let frameCount = 0;

    const loop = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#141e0a'); bgGrad.addColorStop(0.6, '#1a280e'); bgGrad.addColorStop(1, '#0d1a08');
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a1f14'; ctx.fillRect(0, 230, canvas.width, 80);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(0, 270); ctx.lineTo(canvas.width, 270); ctx.stroke(); ctx.setLineDash([]);

      if (frameCount % 60 === 0) { timeRef.current--; if (timeRef.current <= 0) { setGameOver(true); if (user) onSave('last-hit', scoreRef.current, Math.max(maxCombo, comboRef.current)); return; } }

      if (frameCount % 40 === 0) {
        const allied = g.creeps.filter((c: Creep) => !c.isEnemy && c.hp > 0);
        const enemies = g.creeps.filter((c: Creep) => c.isEnemy && c.hp > 0);
        enemies.forEach((e: Creep) => { const target = allied[randInt(0, allied.length - 1)]; if (target) { target.hp -= randInt(18, 30); target.takingDamage = true; target.damageTimer = 8; } });
        allied.forEach((a: Creep) => { const target = enemies[randInt(0, enemies.length - 1)]; if (target) target.hp -= randInt(15, 25); });
      }

      g.creeps = g.creeps.filter((c: Creep) => {
        if (c.hp <= 0 && !c.isEnemy && c.goldValue > 0) { missedRef.current++; setMissed(missedRef.current); comboRef.current = 0; setCombo(0); c.goldValue = 0; }
        return c.hp > 0;
      });

      if (g.creeps.filter((c: Creep) => !c.isEnemy).length === 0) g.creeps = [...g.creeps.filter((c: Creep) => c.isEnemy), ...spawnWave()];

      g.creeps.forEach((c: Creep) => {
        if (c.damageTimer > 0) c.damageTimer--;
        ctx.fillStyle = c.damageTimer > 0 ? '#fff' : c.color;
        ctx.fillRect(c.x - c.width / 2, c.y - c.height / 2, c.width, c.height);
        ctx.strokeStyle = c.isEnemy ? '#ff4444' : '#aabb33'; ctx.lineWidth = 1.5;
        ctx.strokeRect(c.x - c.width / 2, c.y - c.height / 2, c.width, c.height);
        if (!c.isEnemy) {
          const barW = 36; const barH = 5; const barX = c.x - barW / 2; const barY = c.y - c.height / 2 - 10;
          const hpPct = c.hp / c.maxHp;
          ctx.fillStyle = '#111'; ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = hpPct > 0.3 ? '#22c55e' : hpPct > 0.15 ? '#eab308' : '#ef4444';
          ctx.fillRect(barX, barY, barW * hpPct, barH);
          ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
          ctx.fillStyle = '#daa520'; ctx.font = '10px "Exo 2"'; ctx.textAlign = 'center'; ctx.fillText(`${c.goldValue}g`, c.x, barY - 3);
          if (hpPct <= 0.15) { ctx.strokeStyle = '#daa520'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.strokeRect(c.x - c.width / 2 - 4, c.y - c.height / 2 - 4, c.width + 8, c.height + 8); ctx.setLineDash([]); }
        }
      });

      const hx = g.hero.x; const hy = 260;
      if (g.hero.attackCooldown > 0) g.hero.attackCooldown--;
      ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2);
      const hGrad = ctx.createRadialGradient(hx - 3, hy - 3, 3, hx, hy, 18);
      hGrad.addColorStop(0, '#ffd700'); hGrad.addColorStop(1, '#b8860b');
      ctx.fillStyle = hGrad; ctx.fill(); ctx.strokeStyle = '#daa520'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx + 12, hy - 5); ctx.lineTo(hx + 28, hy - 20); ctx.stroke();
      ctx.fillStyle = '#888'; ctx.fillRect(hx + 26, hy - 24, 6, 6);

      g.particles = g.particles.filter((p: any) => {
        p.x += p.dx; p.y += p.dy; p.dy += 0.1; p.life--;
        ctx.globalAlpha = p.life / p.maxLife;
        if (p.isGold) { ctx.fillStyle = '#daa520'; ctx.font = `bold ${p.size}px "Exo 2"`; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); }
        ctx.globalAlpha = 1; return p.life > 0;
      });

      ctx.fillStyle = '#daa520'; ctx.font = 'bold 16px "Exo 2"'; ctx.textAlign = 'left';
      ctx.fillText(`💰 ${g.totalGold} золота`, 15, 25);
      ctx.fillStyle = '#ef4444'; ctx.fillText(`❌ ${missedRef.current} пропущено`, 15, 48);
      ctx.fillStyle = '#94a3b8'; ctx.font = '14px "Exo 2"'; ctx.textAlign = 'right';
      ctx.fillText(`⏱ ${timeRef.current}s`, canvas.width - 15, 25);

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameStarted, gameOver]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameOver) return;
    const g = gameRef.current; if (g.hero.attackCooldown > 0) return;
    const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width); const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let closest: any = null; let minDist = 50;
    g.creeps.forEach((c: Creep) => { if (c.isEnemy) return; const d = Math.sqrt((mx - c.x) ** 2 + (my - c.y) ** 2); if (d < minDist) { minDist = d; closest = c; } });
    if (closest) {
      g.hero.attackCooldown = 20; const dmg = randInt(55, 75); closest.hp -= dmg; closest.takingDamage = true; closest.damageTimer = 8;
      if (closest.hp <= 0) {
        const gold = closest.goldValue; g.totalGold += gold; closest.goldValue = 0;
        comboRef.current++; scoreRef.current += gold + comboRef.current * 10;
        setScore(scoreRef.current); setCombo(comboRef.current); setMaxCombo(m => Math.max(m, comboRef.current));
        g.particles.push({ x: closest.x, y: closest.y - 20, dx: 0, dy: -1.5, life: 40, maxLife: 40, isGold: true, text: `+${gold}`, size: 16 });
        for (let i = 0; i < 8; i++) g.particles.push({ x: closest.x, y: closest.y, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 - 2, life: 20, maxLife: 20, color: '#daa520' });
      }
    }
  };

  return (
    <GameWrapper title="Добивание крипов" icon={Sword} color="from-rose-500 to-pink-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={startGame}>
      {!gameStarted ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="font-display text-2xl font-bold text-white mb-3">Last Hit Trainer</h3>
          <p className="text-slate-400 font-body mb-6 max-w-md mx-auto">Кликай по союзным крипам, когда у них мало HP, чтобы добить и получить золото. 45 секунд!</p>
          <button onClick={startGame} className="px-10 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-body font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-rose-500/30">Начать</button>
        </div>
      ) : gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Время вышло!</h3>
          <p className="text-slate-400 font-body mb-1">Золото: <span className="text-dota-gold font-bold">{gameRef.current.totalGold}</span></p>
          <p className="text-slate-400 font-body mb-1">Очки: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-red-400 font-body text-sm mb-6">Пропущено: {missed}</p>
          <button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-body font-bold hover:scale-105 transition-transform">Ещё раз</button>
        </div>
      ) : (
        <div>
          <canvas ref={canvasRef} onClick={handleClick} className="w-full rounded-2xl border border-dota-border/50 cursor-pointer" style={{ maxWidth: 800, aspectRatio: '800/380' }} />
          <p className="text-xs font-body text-slate-600 text-center mt-2">Кликай по зелёным крипам с низким HP, чтобы добить</p>
        </div>
      )}
    </GameWrapper>
  );
}
