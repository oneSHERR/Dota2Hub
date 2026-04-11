import { useState, useMemo, useCallback, useEffect } from 'react';
import { ALL_HEROES } from '@/data/heroes';
import { getHeroAdvantage } from '@/data/matchups';
import { getAttrColor } from '@/lib/utils';
import type { Hero } from '@/types';
import { Swords, RotateCcw, Trophy, X, Check, Zap, Timer, ChevronRight, Star, Target, Brain, ArrowRight } from 'lucide-react';

interface QuizRound {
  enemyHero: Hero;
  options: { hero: Hero; score: number }[];
  correctIndex: number;
}

type QuizPhase = 'menu' | 'playing' | 'answered' | 'finished';
type Difficulty = 'easy' | 'medium' | 'hard';

function generateRound(usedHeroIds: Set<number>, difficulty: Difficulty): QuizRound {
  // Pick a random enemy hero
  const available = ALL_HEROES.filter(h => !usedHeroIds.has(h.id));
  const enemyHero = available[Math.floor(Math.random() * available.length)];

  // Calculate advantages for all heroes against enemy
  const advantages = ALL_HEROES
    .filter(h => h.id !== enemyHero.id && !usedHeroIds.has(h.id))
    .map(h => ({ hero: h, score: getHeroAdvantage(h, enemyHero) }));

  // Sort by advantage (best counters first)
  advantages.sort((a, b) => b.score - a.score);

  // The correct answer is one of the top counters
  const topCounters = advantages.filter(a => a.score >= 1.5);
  const correct = topCounters.length > 0
    ? topCounters[Math.floor(Math.random() * Math.min(3, topCounters.length))]
    : advantages[0];

  // Generate wrong answers based on difficulty
  let wrongPool: typeof advantages;
  if (difficulty === 'easy') {
    // Easy: wrong answers are weak against enemy (negative score)
    wrongPool = advantages.filter(a => a.score < 0 && a.hero.id !== correct.hero.id);
  } else if (difficulty === 'medium') {
    // Medium: wrong answers are neutral
    wrongPool = advantages.filter(a => a.score >= -1 && a.score <= 1 && a.hero.id !== correct.hero.id);
  } else {
    // Hard: wrong answers are also decent (close scores)
    wrongPool = advantages.filter(a =>
      a.hero.id !== correct.hero.id &&
      a.score < correct.score &&
      a.score >= correct.score - 3
    );
  }

  // If not enough wrong options, expand pool
  if (wrongPool.length < 3) {
    wrongPool = advantages.filter(a => a.hero.id !== correct.hero.id);
  }

  // Shuffle and pick 3 wrong answers
  const shuffled = wrongPool.sort(() => Math.random() - 0.5);
  const wrong = shuffled.slice(0, 3);

  // Combine and shuffle
  const options = [correct, ...wrong].sort(() => Math.random() - 0.5);
  const correctIndex = options.findIndex(o => o.hero.id === correct.hero.id);

  return { enemyHero, options, correctIndex };
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; rounds: number; timePerRound: number; description: string }> = {
  easy: { label: 'Лёгкий', color: 'text-emerald-400', rounds: 10, timePerRound: 0, description: 'Очевидные контрпики. Без таймера.' },
  medium: { label: 'Средний', color: 'text-amber-400', rounds: 15, timePerRound: 15, description: 'Менее очевидные варианты. 15 секунд на ответ.' },
  hard: { label: 'Сложный', color: 'text-red-400', rounds: 20, timePerRound: 10, description: 'Все варианты похожи. 10 секунд на ответ.' },
};

export function CounterpickQuizPage() {
  const [phase, setPhase] = useState<QuizPhase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [rounds, setRounds] = useState<QuizRound[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const config = DIFFICULTY_CONFIG[difficulty];

  // Start game
  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const cfg = DIFFICULTY_CONFIG[diff];
    const usedIds = new Set<number>();
    const generatedRounds: QuizRound[] = [];

    for (let i = 0; i < cfg.rounds; i++) {
      const round = generateRound(usedIds, diff);
      usedIds.add(round.enemyHero.id);
      generatedRounds.push(round);
    }

    setRounds(generatedRounds);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTimer(cfg.timePerRound);
    setPhase('playing');
  };

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || config.timePerRound === 0) return;
    if (timer <= 0) {
      // Time's up — wrong answer
      handleAnswer(-1);
      return;
    }
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timer]);

  // Handle answer
  const handleAnswer = (index: number) => {
    if (phase !== 'playing') return;
    setSelectedAnswer(index);

    const round = rounds[currentRound];
    const isCorrect = index === round.correctIndex;

    if (isCorrect) {
      const streakBonus = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
      const timeBonus = config.timePerRound > 0 ? Math.ceil(timer / 3) : 0;
      setScore(prev => prev + (10 * streakBonus) + timeBonus);
      setStreak(prev => {
        const newStreak = prev + 1;
        setBestStreak(best => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setAnswers(prev => [...prev, isCorrect]);
    setPhase('answered');
  };

  // Next round
  const nextRound = () => {
    if (currentRound + 1 >= rounds.length) {
      setPhase('finished');
    } else {
      setCurrentRound(prev => prev + 1);
      setSelectedAnswer(null);
      setTimer(config.timePerRound);
      setPhase('playing');
    }
  };

  // Get grade
  const getGrade = () => {
    const correctCount = answers.filter(a => a).length;
    const pct = (correctCount / rounds.length) * 100;
    if (pct >= 90) return { grade: 'S', color: 'text-amber-400', label: 'Мастер контрпиков!' };
    if (pct >= 75) return { grade: 'A', color: 'text-emerald-400', label: 'Отличное знание матчапов!' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-400', label: 'Хорошо, но есть куда расти.' };
    if (pct >= 40) return { grade: 'C', color: 'text-orange-400', label: 'Нужно подтянуть знания.' };
    return { grade: 'D', color: 'text-red-400', label: 'Время изучить контрпики!' };
  };

  // ===== MENU =====
  if (phase === 'menu') {
    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dota-card via-dota-bg-light to-dota-bg" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-dota-gold" />
              <h1 className="font-display text-5xl font-black text-white tracking-tight">КОНТРПИК</h1>
            </div>
            <p className="font-body text-slate-400 text-sm">Угадай лучший контрпик против вражеского героя</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-16 pt-6">
          {/* How to play */}
          <div className="rounded-2xl bg-dota-card/60 border border-white/8 p-6 mb-6">
            <h3 className="font-display text-lg font-bold text-white mb-3">Как играть</h3>
            <div className="space-y-2">
              {[
                { icon: '👀', text: 'Тебе показывают вражеского героя' },
                { icon: '🤔', text: 'Выбери лучший контрпик из 4 вариантов' },
                { icon: '🔥', text: 'Серия правильных ответов = бонусные очки' },
                { icon: '📊', text: 'В конце получи оценку S/A/B/C/D' },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.03]">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-body text-slate-300">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty select */}
          <div className="space-y-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => {
              const cfg = DIFFICULTY_CONFIG[diff];
              return (
                <button
                  key={diff}
                  onClick={() => startGame(diff)}
                  className="w-full group rounded-2xl bg-dota-card/60 border border-white/8 p-5 text-left hover:border-dota-gold/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-display text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs font-body text-slate-500">{cfg.rounds} раундов</span>
                      </div>
                      <p className="text-xs font-body text-slate-400">{cfg.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-dota-gold group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== FINISHED =====
  if (phase === 'finished') {
    const correctCount = answers.filter(a => a).length;
    const { grade, color, label } = getGrade();

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-dota-card/60 border border-white/8 p-8 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="font-display text-3xl font-black text-white mb-2">Результат</h2>

            {/* Grade */}
            <div className={`font-display text-7xl font-black ${color} mb-2`}>{grade}</div>
            <p className="font-body text-sm text-slate-400 mb-6">{label}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <div className="font-display text-2xl font-bold text-white">{correctCount}/{rounds.length}</div>
                <div className="text-[10px] font-body text-slate-500">Правильно</div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <div className="font-display text-2xl font-bold text-dota-gold">{score}</div>
                <div className="text-[10px] font-body text-slate-500">Очки</div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-3">
                <div className="font-display text-2xl font-bold text-amber-400">{bestStreak}🔥</div>
                <div className="text-[10px] font-body text-slate-500">Макс. серия</div>
              </div>
            </div>

            {/* Answer history */}
            <div className="flex justify-center gap-1 mb-6 flex-wrap">
              {answers.map((correct, i) => (
                <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {correct ? '✓' : '✗'}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button onClick={() => startGame(difficulty)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-dota-accent to-red-600 text-white font-body font-bold hover:scale-[1.02] transition-transform">
                <RotateCcw className="w-4 h-4 inline mr-2" /> Играть снова
              </button>
              <button onClick={() => setPhase('menu')}
                className="w-full py-3 rounded-2xl bg-white/[0.04] border border-dota-border/30 text-slate-300 font-body font-bold hover:bg-white/[0.08] transition-all duration-300">
                Сменить сложность
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING / ANSWERED =====
  const round = rounds[currentRound];
  if (!round) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-body text-slate-500">Раунд</span>
          <span className="font-display text-lg font-bold text-white">{currentRound + 1}/{rounds.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-dota-gold/10">
            <Star className="w-3.5 h-3.5 text-dota-gold" />
            <span className="font-mono text-sm font-bold text-dota-gold">{score}</span>
          </div>
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 animate-pulse">
              <span className="text-sm">🔥</span>
              <span className="font-mono text-xs font-bold text-amber-400">{streak}</span>
            </div>
          )}
          {config.timePerRound > 0 && phase === 'playing' && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-xl font-mono text-sm font-bold ${
              timer <= 5 ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-white/[0.04] text-slate-300'
            }`}>
              <Timer className="w-3.5 h-3.5" /> {timer}с
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.04] mb-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-dota-gold to-dota-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentRound + 1) / rounds.length) * 100}%` }} />
      </div>

      {/* Enemy hero */}
      <div className="rounded-2xl bg-dota-card/60 border border-red-500/20 p-6 mb-6 text-center">
        <span className="text-xs font-body text-red-400 uppercase tracking-wider mb-3 block">Враг выбрал</span>
        <div className="w-32 h-20 rounded-2xl overflow-hidden border-2 border-red-500/30 mx-auto mb-3 shadow-xl shadow-red-500/10">
          <img src={round.enemyHero.img} alt="" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-display text-2xl font-black text-white">{round.enemyHero.localized_name}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getAttrColor(round.enemyHero.primary_attr) }} />
          <span className="text-xs font-body text-slate-400">{round.enemyHero.roles.slice(0, 3).join(' · ')}</span>
        </div>
        <p className="text-sm font-body text-dota-gold mt-3">Какой герой лучше всего контрит?</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {round.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === round.correctIndex;
          const isAnswered = phase === 'answered';

          let borderColor = 'border-white/8 hover:border-white/20';
          let bgColor = 'bg-dota-card/60';

          if (isAnswered) {
            if (isCorrect) {
              borderColor = 'border-emerald-500/50';
              bgColor = 'bg-emerald-500/8';
            } else if (isSelected && !isCorrect) {
              borderColor = 'border-red-500/50';
              bgColor = 'bg-red-500/8';
            } else {
              borderColor = 'border-dota-border/20';
              bgColor = 'bg-dota-card/60 opacity-50';
            }
          }

          return (
            <button
              key={i}
              onClick={() => phase === 'playing' && handleAnswer(i)}
              disabled={phase !== 'playing'}
              className={`relative rounded-2xl ${bgColor} border ${borderColor} p-4 transition-all duration-300 ${
                phase === 'playing' ? 'hover:scale-[1.03] cursor-pointer' : ''
              }`}
            >
              <div className="w-full h-12 rounded-xl overflow-hidden mb-2">
                <img src={option.hero.img} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-body font-bold text-white block truncate">{option.hero.localized_name}</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getAttrColor(option.hero.primary_attr) }} />
                <span className="text-[9px] font-body text-slate-500">{option.hero.roles[0]}</span>
              </div>

              {/* Correct/Wrong indicator */}
              {isAnswered && isCorrect && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              {isAnswered && isSelected && !isCorrect && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              {/* Score indicator on answered */}
              {isAnswered && (
                <div className={`text-[10px] font-mono font-bold mt-1 ${option.score >= 2 ? 'text-emerald-400' : option.score >= 0 ? 'text-slate-400' : 'text-red-400'}`}>
                  Преимущество: {option.score > 0 ? '+' : ''}{option.score.toFixed(1)}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation on answer */}
      {phase === 'answered' && (
        <div className="space-y-3" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className={`rounded-2xl p-4 ${
            selectedAnswer === round.correctIndex ? 'bg-emerald-500/8 border border-emerald-500/20' : 'bg-red-500/8 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {selectedAnswer === round.correctIndex ? (
                <><Check className="w-5 h-5 text-emerald-400" /><span className="font-body text-sm font-bold text-emerald-400">Правильно! +{streak >= 5 ? 30 : streak >= 3 ? 20 : 10} очков</span></>
              ) : (
                <><X className="w-5 h-5 text-red-400" /><span className="font-body text-sm font-bold text-red-400">Неправильно!</span></>
              )}
            </div>
            <p className="text-sm font-body text-slate-300">
              <span className="text-white font-bold">{round.options[round.correctIndex].hero.localized_name}</span> — лучший контрпик для {round.enemyHero.localized_name} с преимуществом <span className="text-emerald-400 font-bold">+{round.options[round.correctIndex].score.toFixed(1)}</span>.
            </p>
          </div>

          <button onClick={nextRound}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-dota-gold/80 to-amber-600 text-white font-body font-bold hover:scale-[1.02] transition-transform">
            {currentRound + 1 >= rounds.length ? 'Результаты' : 'Следующий раунд'}
            <ArrowRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
