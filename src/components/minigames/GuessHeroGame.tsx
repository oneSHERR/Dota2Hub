import { useState, useEffect, useCallback } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { HERO_ABILITIES } from '@/data/heroAbilities';
import { Brain, Heart } from 'lucide-react';
import { GameProps, GameWrapper, heroImg, abilityImg, shuffle, randInt, HEROES_WITH_ABILITIES } from './shared';

export function GuessHeroGame({ onBack, onSave, user, bestScore }: GameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [mode, setMode] = useState<'silhouette' | 'ability' | 'mixed'>('mixed');
  const [question, setQuestion] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);

  const generateQuestion = useCallback(() => {
    const heroesPool = mode === 'ability' ? HEROES_WITH_ABILITIES : ALL_HEROES;
    const correctHero = heroesPool[randInt(0, heroesPool.length - 1)];
    const others = shuffle(ALL_HEROES.filter(h => h.id !== correctHero.id)).slice(0, 3);
    const options = shuffle([correctHero, ...others]);
    const questionMode = mode === 'mixed' ? (Math.random() > 0.5 ? 'silhouette' : 'ability') : mode;
    let abilityData: any = null;
    if (questionMode === 'ability' && HERO_ABILITIES[correctHero.name]) {
      const abilities = HERO_ABILITIES[correctHero.name];
      abilityData = abilities[randInt(0, abilities.length - 1)];
    }
    return { correctHero, options, questionMode, abilityData };
  }, [mode]);

  useEffect(() => {
    if (!gameOver) setQuestion(generateQuestion());
  }, [round, gameOver, generateQuestion]);

  const handleAnswer = (heroName: string) => {
    if (selected || !question) return;
    setSelected(heroName);
    const correct = heroName === question.correctHero.localized_name;
    if (correct) {
      const comboBonus = Math.floor(combo * 5);
      setScore(s => s + 100 + comboBonus);
      setCombo(c => { const nc = c + 1; setMaxCombo(m => Math.max(m, nc)); return nc; });
    } else {
      setCombo(0);
      setLives(l => l - 1);
      if (lives <= 1) { setGameOver(true); if (user) onSave('guess-hero', score, maxCombo); }
    }
    setTimeout(() => {
      if (!gameOver && lives > (correct ? 0 : 1)) { setSelected(null); setRound(r => r + 1); }
    }, 1500);
  };

  const restart = () => { setScore(0); setCombo(0); setMaxCombo(0); setRound(0); setLives(3); setGameOver(false); setSelected(null); };

  return (
    <GameWrapper title="Угадай героя" icon={Brain} color="from-purple-500 to-indigo-600"
      score={score} combo={combo} bestScore={bestScore} onBack={onBack} onRestart={restart}>
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
        ))}
        <span className="text-xs font-body text-slate-500 ml-2">Раунд {round + 1}</span>
      </div>
      {gameOver ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💀</div>
          <h3 className="font-display text-2xl font-bold text-white mb-2">Игра окончена!</h3>
          <p className="text-slate-400 font-body mb-2">Счёт: <span className="text-dota-gold font-bold">{score}</span></p>
          <p className="text-slate-500 font-body text-sm mb-6">Макс. комбо: {maxCombo} · Раундов: {round}</p>
          <button onClick={restart} className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-body font-bold hover:scale-105 transition-transform">Играть снова</button>
        </div>
      ) : question && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-dota-card/80 border border-dota-border/50 p-6 flex flex-col items-center">
            {question.questionMode === 'silhouette' ? (
              <>
                <p className="text-sm font-body text-slate-400 mb-4">Кто этот герой?</p>
                <div className="relative w-[280px] h-[160px] rounded-xl overflow-hidden border border-purple-500/20">
                  {/* Силуэт через CSS-фильтры — без CORS проблем */}
                  <img
                    src={heroImg(question.correctHero.name)}
                    alt=""
                    className="w-full h-full object-cover transition-all duration-500"
                    style={!selected ? {
                      filter: 'brightness(0) drop-shadow(0 0 8px rgba(124,58,237,0.6)) drop-shadow(0 0 20px rgba(124,58,237,0.3))',
                    } : {}}
                  />
                  {/* Фиолетовый оверлей для атмосферы */}
                  {!selected && (
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-indigo-900/30 pointer-events-none" />
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-body text-slate-400 mb-4">Чья это способность?</p>
                {question.abilityData ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={abilityImg(question.abilityData.name)} alt="" className="w-16 h-16 rounded-lg border border-dota-border" />
                    <p className="text-base font-body text-white font-semibold">{question.abilityData.displayName}</p>
                    <p className="text-xs font-body text-slate-500 text-center max-w-md">{question.abilityData.description}</p>
                  </div>
                ) : <p className="text-sm font-body text-slate-500 italic">Загрузка...</p>}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((hero: any) => {
              const isCorrect = hero.localized_name === question.correctHero.localized_name;
              const isSelected = selected === hero.localized_name;
              let borderClass = 'border-dota-border/50 hover:border-white/20';
              if (selected) {
                if (isCorrect) borderClass = 'border-green-500 bg-green-500/10';
                else if (isSelected) borderClass = 'border-red-500 bg-red-500/10';
                else borderClass = 'border-dota-border/20 opacity-50';
              }
              return (
                <button key={hero.id} onClick={() => handleAnswer(hero.localized_name)} disabled={!!selected}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-dota-card border ${borderClass} transition-all duration-200`}>
                  <img src={heroImg(hero.name)} alt="" className="w-14 h-8 rounded-lg object-cover" />
                  <span className="font-body text-sm text-white">{hero.localized_name}</span>
                  {selected && isCorrect && <span className="ml-auto text-green-400">✓</span>}
                  {selected && isSelected && !isCorrect && <span className="ml-auto text-red-400">✗</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
