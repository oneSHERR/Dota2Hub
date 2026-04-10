import { useState, useEffect, useCallback } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { SPECIFIC_COUNTERS } from '@/data/matchups';
import { Swords, Heart } from 'lucide-react';
import { GameProps, GameWrapper, heroImg, heroCrop, randInt } from './shared';

export function WhoStrongerGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [matchup, setMatchup] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const generateMatchup = useCallback((): any => {
    const heroNames = Object.keys(SPECIFIC_COUNTERS);
    const h1Name = heroNames[randInt(0, heroNames.length - 1)];
    const counters = SPECIFIC_COUNTERS[h1Name];
    const enemyNames = Object.keys(counters);
    if (enemyNames.length === 0) return generateMatchup();
    const h2Name = enemyNames[randInt(0, enemyNames.length - 1)];
    const advantage = counters[h2Name];
    const hero1 = ALL_HEROES.find(h => h.localized_name === h1Name);
    const hero2 = ALL_HEROES.find(h => h.localized_name === h2Name);
    if (!hero1 || !hero2) return generateMatchup();
    return { hero1, hero2, advantage, winner: advantage > 0 ? 'hero1' : 'hero2' };
  }, []);

  useEffect(() => { if (!gameOver) setMatchup(generateMatchup()); }, [round, gameOver, generateMatchup]);

  const handlePick = (pick: 'hero1' | 'hero2') => {
    if (selected || !matchup) return;
    setSelected(pick);
    const correct = pick === matchup.winner;
    if (correct) {
      const bonus = Math.abs(matchup.advantage) <= 2 ? 150 : 100;
      setScore(s => s + bonus + combo * 5);
      setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
    } else {
      setCombo(0); setLives(l => l - 1);
      if (lives <= 1) { setGameOver(true); if (user) onSave('who-stronger', score, maxCombo); }
    }
    setTimeout(() => {
      if (!gameOver && lives > (correct ? 0 : 1)) { setSelected(null); setRound(r => r + 1); }
    }, 1800);
  };

  const restart = () => { setScore(0); setCombo(0); setMaxCombo(0); setRound(0); setLives(3); setGameOver(false); setSelected(null); };

  return (
    <GameWrapper title="Кто сильнее?" icon={Swords} color="from-red-500 to-orange-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
        ))}
        <span className="text-xs font-body text-slate-500 ml-2">Раунд {round + 1}</span>
      </div>
      {gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Игра окончена!</h3>
          <p className="text-slate-400 font-body mb-2">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo}</p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-body font-bold hover:scale-105 transition-transform">Играть снова</button>
        </div>
      ) : matchup && (
        <div className="space-y-6">
          <p className="text-center text-sm font-body text-slate-400">Кто победит в матчапе 1 на 1?</p>
          <div className="grid grid-cols-2 gap-4">
            {(['hero1', 'hero2'] as const).map((side) => {
              const hero = matchup[side];
              const isWinner = matchup.winner === side;
              const isSelected = selected === side;
              let border = 'border-dota-border/50 hover:border-white/20 hover:translate-y-[-4px]';
              if (selected) {
                if (isWinner) border = 'border-green-500 shadow-green-500/20 shadow-xl';
                else if (isSelected) border = 'border-red-500 shadow-red-500/20 shadow-xl';
                else border = 'border-dota-border/20 opacity-60';
              }
              return (
                <button key={side} onClick={() => handlePick(side)} disabled={!!selected}
                  className={`relative rounded-2xl bg-dota-card border ${border} overflow-hidden transition-all duration-300 group`}>
                  <div className="aspect-[16/10] overflow-hidden">
                    <img src={heroCrop(hero.name)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = heroImg(hero.name); }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-display text-lg font-bold text-white">{hero.localized_name}</h4>
                    <p className="text-xs font-body text-slate-400">{hero.roles.slice(0, 2).join(', ')}</p>
                  </div>
                  {selected && isWinner && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-fade-in">
                      <span className="text-white font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className="text-center animate-fade-in">
              <p className="text-sm font-body text-slate-300">
                <span className="text-white font-semibold">{matchup[matchup.winner].localized_name}</span> побеждает с преимуществом <span className="text-dota-gold font-bold">{Math.abs(matchup.advantage)}/5</span>
              </p>
            </div>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
