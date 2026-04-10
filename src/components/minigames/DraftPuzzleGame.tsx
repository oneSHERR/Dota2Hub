import { useState, useEffect, useCallback } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { Target, Heart } from 'lucide-react';
import { GameProps, GameWrapper, heroImg, shuffle, pick, randInt } from './shared';

export function DraftPuzzleGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const generatePuzzle = useCallback(() => {
    const team = pick(ALL_HEROES, 4);
    const teamRoles = new Set(team.flatMap(h => h.roles));
    const needsSupport = !team.some(h => h.roles.includes('Support'));
    const needsCarry = !team.some(h => h.roles.includes('Carry'));
    const needsInitiator = !team.some(h => h.roles.includes('Initiator'));
    const candidates = ALL_HEROES.filter(h => !team.some(t => t.id === h.id));
    const scored = candidates.map(h => {
      let s = 0;
      if (needsSupport && h.roles.includes('Support')) s += 3;
      if (needsCarry && h.roles.includes('Carry')) s += 3;
      if (needsInitiator && h.roles.includes('Initiator')) s += 2;
      h.roles.forEach(r => { if (!teamRoles.has(r)) s += 1; });
      return { hero: h, score: s };
    }).sort((a, b) => b.score - a.score);
    const correct = scored[0].hero;
    const wrong = pick(scored.slice(10), 3).map(s => s.hero);
    const options = shuffle([correct, ...wrong]);
    return { team, correct, options, reason: needsSupport ? 'Команде нужен саппорт' : needsCarry ? 'Команде нужен керри' : needsInitiator ? 'Нужна инициация' : 'Закрывает роли' };
  }, []);

  useEffect(() => { if (!gameOver) setPuzzle(generatePuzzle()); }, [round, gameOver, generatePuzzle]);

  const handlePick = (heroName: string) => {
    if (selected || !puzzle) return;
    setSelected(heroName);
    const correct = heroName === puzzle.correct.localized_name;
    if (correct) {
      setScore(s => s + 120 + combo * 5);
      setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
    } else {
      setCombo(0); setLives(l => l - 1);
      if (lives <= 1) { setGameOver(true); if (user) onSave('draft-puzzle', score, maxCombo); }
    }
    setTimeout(() => {
      if (!gameOver && lives > (correct ? 0 : 1)) { setSelected(null); setRound(r => r + 1); }
    }, 1800);
  };

  const restart = () => { setScore(0); setCombo(0); setMaxCombo(0); setRound(0); setLives(3); setGameOver(false); setSelected(null); };

  return (
    <GameWrapper title="Draft Puzzle" icon={Target} color="from-cyan-500 to-blue-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
        ))}
      </div>
      {gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🧩</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Игра окончена!</h3>
          <p className="text-slate-400 font-body mb-6">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-body font-bold hover:scale-105 transition-transform">Снова</button>
        </div>
      ) : puzzle && (
        <div className="space-y-6">
          <p className="text-center text-sm font-body text-slate-400">Подбери идеального 5-го героя в команду</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {puzzle.team.map((h: any) => (
              <div key={h.id} className="flex flex-col items-center gap-1">
                <img src={heroImg(h.name)} alt="" className="w-16 h-9 rounded-lg border border-dota-border object-cover" />
                <span className="text-[10px] font-body text-slate-500 truncate w-16 text-center">{h.localized_name}</span>
              </div>
            ))}
            <div className="w-16 h-9 rounded-lg border-2 border-dashed border-dota-gold/40 flex items-center justify-center">
              <span className="text-dota-gold text-xl">?</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {puzzle.options.map((hero: any) => {
              const isCorrect = hero.localized_name === puzzle.correct.localized_name;
              const isSelected = selected === hero.localized_name;
              let cls = 'border-dota-border/50 hover:border-white/20';
              if (selected) { if (isCorrect) cls = 'border-green-500 bg-green-500/10'; else if (isSelected) cls = 'border-red-500 bg-red-500/10'; else cls = 'border-dota-border/20 opacity-50'; }
              return (
                <button key={hero.id} onClick={() => handlePick(hero.localized_name)} disabled={!!selected}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-dota-card border ${cls} transition-all`}>
                  <img src={heroImg(hero.name)} alt="" className="w-14 h-8 rounded-lg object-cover" />
                  <div className="text-left">
                    <span className="font-body text-sm text-white block">{hero.localized_name}</span>
                    <span className="font-body text-[10px] text-slate-500">{hero.roles.slice(0, 2).join(', ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {selected && <p className="text-center text-sm font-body text-slate-400 animate-fade-in">{puzzle.reason}</p>}
        </div>
      )}
    </GameWrapper>
  );
}
