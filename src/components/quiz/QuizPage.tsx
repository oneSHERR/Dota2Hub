import { useState } from 'react';
import { Target, Swords, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import type { Position } from '@/types';
import { POSITION_LABELS } from '@/types';
import { ALL_HEROES } from '@/data/heroes';

// ========== POSITION QUIZ — "Какая твоя позиция?" ==========
const POSITION_QUESTIONS = [
  {
    id: '1', text: 'Что тебе важнее в игре?',
    options: [
      { text: 'Фармить и нести игру в лейте', scores: { 1: 3, 2: 1 } },
      { text: 'Контролировать темп игры', scores: { 2: 3, 3: 1 } },
      { text: 'Создавать пространство для команды', scores: { 3: 3, 4: 1 } },
      { text: 'Помогать союзникам и спасать их', scores: { 5: 3, 4: 1 } },
    ],
  },
  {
    id: '2', text: 'Как ты предпочитаешь начинать игру?',
    options: [
      { text: 'Спокойно фармить на линии', scores: { 1: 3, 2: 1 } },
      { text: 'Доминировать на линии 1v1', scores: { 2: 3 } },
      { text: 'Агрессивно играть и давить', scores: { 3: 3, 4: 2 } },
      { text: 'Стакать, пуллить, вардить', scores: { 5: 3 } },
    ],
  },
  {
    id: '3', text: 'Какой тип героев тебе ближе?',
    options: [
      { text: 'Carry — сильный в лейте', scores: { 1: 3 } },
      { text: 'Мобильный мидер с бурстом', scores: { 2: 3 } },
      { text: 'Танк/инициатор', scores: { 3: 3 } },
      { text: 'Роумер/ганкер', scores: { 4: 3 } },
      { text: 'Хилер/спасатель', scores: { 5: 3 } },
    ],
  },
  {
    id: '4', text: 'Что ты делаешь в тимфайте?',
    options: [
      { text: 'Наношу максимум урона', scores: { 1: 3, 2: 2 } },
      { text: 'Инициирую и ловлю врагов', scores: { 3: 3, 4: 1 } },
      { text: 'Дизейблю приоритетные цели', scores: { 4: 3, 3: 1 } },
      { text: 'Защищаю своих союзников', scores: { 5: 3 } },
    ],
  },
  {
    id: '5', text: 'Как ты относишься к фарму?',
    options: [
      { text: 'Обожаю, могу фармить 30+ минут', scores: { 1: 3 } },
      { text: 'Фармлю между ганками', scores: { 2: 3 } },
      { text: 'Фарм? Я иду на врага!', scores: { 3: 2, 4: 3 } },
      { text: 'Отдаю фарм союзникам', scores: { 5: 3 } },
    ],
  },
  {
    id: '6', text: 'Какую роль ты играешь в реальной жизни?',
    options: [
      { text: 'Лидер, принимаю решения', scores: { 1: 2, 2: 2 } },
      { text: 'Стратег, планирую наперёд', scores: { 2: 2, 3: 2 } },
      { text: 'Командный игрок', scores: { 4: 2, 5: 2 } },
      { text: 'Поддержка, помогаю другим', scores: { 5: 3 } },
    ],
  },
];

// ========== HERO QUIZ — "Подбор героя" (другие вопросы!) ==========
const HERO_QUESTIONS = [
  {
    id: 'h1', text: 'Какой стиль боя тебе нравится?',
    options: [
      { text: 'Бить в ближнем бою, быть в гуще событий', tags: ['Melee', 'Durable', 'Carry'] },
      { text: 'Кастовать заклинания издалека', tags: ['Ranged', 'Nuker', 'Disabler'] },
      { text: 'Быстро входить и выходить из боя', tags: ['Escape', 'Initiator'] },
      { text: 'Поддерживать команду из-за спины', tags: ['Support', 'Disabler'] },
    ],
  },
  {
    id: 'h2', text: 'Что важнее — урон или выживаемость?',
    options: [
      { text: 'Максимальный урон, даже если хрупкий', tags: ['Nuker', 'Carry'] },
      { text: 'Баланс урона и выживаемости', tags: ['Initiator', 'Escape'] },
      { text: 'Выживаемость — я танк', tags: ['Durable'] },
      { text: 'Мне не нужен урон, главное помогать', tags: ['Support'] },
    ],
  },
  {
    id: 'h3', text: 'Как ты предпочитаешь убивать врагов?',
    options: [
      { text: 'Физические атаки — бью правой кнопкой', tags: ['Carry', 'Pusher'] },
      { text: 'Магический бурст — комбо заклинаний', tags: ['Nuker', 'Disabler'] },
      { text: 'Контроль и дизейблы — враг не может двигаться', tags: ['Disabler', 'Initiator'] },
      { text: 'Постепенно изматываю — DOT и яды', tags: ['Nuker', 'Durable'] },
    ],
  },
  {
    id: 'h4', text: 'Тебе нравится сплитпуш и разрушение башен?',
    options: [
      { text: 'Да! Люблю пушить линии', tags: ['Pusher', 'Carry'] },
      { text: 'Иногда, но больше люблю тимфайты', tags: ['Initiator', 'Nuker'] },
      { text: 'Нет, я предпочитаю ганки и драки', tags: ['Escape', 'Disabler'] },
      { text: 'Я вообще не про это, я саппорт', tags: ['Support'] },
    ],
  },
  {
    id: 'h5', text: 'Какая сложность героя тебе по душе?',
    options: [
      { text: 'Простой — нажал кнопки и пошёл', tags: ['Durable', 'Support', 'Carry'] },
      { text: 'Средний — нужно думать когда кастовать', tags: ['Nuker', 'Initiator', 'Disabler'] },
      { text: 'Сложный — механически и тактически', tags: ['Escape', 'Initiator'] },
    ],
  },
  {
    id: 'h6', text: 'В какой фазе игры ты сильнее всего?',
    options: [
      { text: 'Ранняя — доминирую на линии', tags: ['Nuker', 'Support', 'Disabler'] },
      { text: 'Средняя — ганкаю и дерусь', tags: ['Initiator', 'Escape', 'Nuker'] },
      { text: 'Поздняя — становлюсь монстром', tags: ['Carry', 'Pusher'] },
      { text: 'Во всех фазах одинаково', tags: ['Durable', 'Disabler'] },
    ],
  },
];

// Position descriptions
const POSITION_INFO: Record<number, { emoji: string; desc: string; style: string }> = {
  1: { emoji: '⚔️', desc: 'Ты — главный дамагер команды. Фармишь, становишься сильнее и несёшь игру.', style: 'Carry / Hard Carry' },
  2: { emoji: '🎯', desc: 'Ты контролируешь темп. Выигрываешь мид и создаёшь давление по карте.', style: 'Midlaner' },
  3: { emoji: '🛡️', desc: 'Ты — стена для команды. Инициируешь, танкуешь и создаёшь пространство.', style: 'Offlaner' },
  4: { emoji: '🗡️', desc: 'Ты — агрессивный support. Роумишь, ганкаешь и задаёшь ритм игры.', style: 'Soft Support / Roamer' },
  5: { emoji: '💚', desc: 'Ты — спасатель. Вардишь, хилишь, защищаешь своих союзников.', style: 'Hard Support' },
};

export function QuizPage() {
  const [activeQuiz, setActiveQuiz] = useState<'none' | 'position' | 'hero'>('none');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [heroTags, setHeroTags] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Position | null>(null);
  const [heroResult, setHeroResult] = useState<typeof ALL_HEROES | null>(null);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);

  const resetQuiz = () => {
    setQuestionIdx(0);
    setScores({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    setHeroTags({});
    setResult(null);
    setHeroResult(null);
    setSelectedPos(null);
  };

  // ===== POSITION QUIZ ANSWER =====
  const handlePositionAnswer = (optionScores: Partial<Record<Position, number>>) => {
    const newScores = { ...scores };
    for (const [pos, val] of Object.entries(optionScores)) {
      newScores[Number(pos)] = (newScores[Number(pos)] || 0) + (val || 0);
    }
    setScores(newScores);

    if (questionIdx < POSITION_QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      const maxPos = Object.entries(newScores).reduce((best, [pos, score]) =>
        score > best.score ? { pos: Number(pos), score } : best
      , { pos: 1, score: 0 });
      setResult(maxPos.pos as Position);
    }
  };

  // ===== HERO QUIZ ANSWER =====
  const handleHeroAnswer = (tags: string[]) => {
    const newTags = { ...heroTags };
    for (const tag of tags) {
      newTags[tag] = (newTags[tag] || 0) + 1;
    }
    setHeroTags(newTags);

    if (questionIdx < HERO_QUESTIONS.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      // Score each hero by how many of their roles match the user's tags
      const scored = ALL_HEROES.map(hero => {
        let score = 0;
        for (const role of hero.roles) {
          score += (newTags[role] || 0);
        }
        // Bonus for attack type match
        if (newTags['Melee'] && hero.attack_type === 'Melee') score += newTags['Melee'] * 0.5;
        if (newTags['Ranged'] && hero.attack_type === 'Ranged') score += newTags['Ranged'] * 0.5;
        return { hero, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(h => h.hero);

      setHeroResult(scored);
    }
  };

  // ===== MENU =====
  if (activeQuiz === 'none') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold gradient-text mb-3">Квизы</h1>
          <p className="font-body text-sm text-slate-400">Узнай свою позицию и подбери героев</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setActiveQuiz('position'); resetQuiz(); }}
            className="group rounded-2xl bg-dota-card border border-dota-border p-8 text-left hover:border-dota-accent/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dota-accent to-orange-600 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Какая твоя позиция?</h3>
            <p className="text-sm font-body text-slate-400 mb-4">Пройди тест за 2 минуты и узнай, на какой роли ты раскроешься лучше всего</p>
            <span className="flex items-center gap-1 text-sm font-body text-dota-gold group-hover:gap-2 transition-all duration-300">
              Начать тест <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => { setActiveQuiz('hero'); resetQuiz(); }}
            className="group rounded-2xl bg-dota-card border border-dota-border p-8 text-left hover:border-green-500/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Подбор героя</h3>
            <p className="text-sm font-body text-slate-400 mb-4">Ответь на вопросы о стиле игры и получи список идеальных героев</p>
            <span className="flex items-center gap-1 text-sm font-body text-green-400 group-hover:gap-2 transition-all duration-300">
              Подобрать <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ===== POSITION RESULT =====
  if (activeQuiz === 'position' && result !== null) {
    const info = POSITION_INFO[result];
    const heroesForPos = ALL_HEROES.filter(h => {
      if (result === 1) return h.roles.includes('Carry') && !h.roles.includes('Support');
      if (result === 2) return (h.roles.includes('Nuker') || h.roles.includes('Carry')) && h.attack_type === 'Ranged';
      if (result === 3) return h.roles.includes('Initiator') || h.roles.includes('Durable');
      if (result === 4) return h.roles.includes('Disabler') && (h.roles.includes('Initiator') || h.roles.includes('Nuker'));
      if (result === 5) return h.roles.includes('Support') && !h.roles.includes('Carry');
      return false;
    }).slice(0, 8);

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-dota-card border border-dota-border p-8 text-center mb-6">
          <div className="text-5xl mb-4">{info.emoji}</div>
          <h2 className="font-display text-3xl font-black text-white mb-2">{POSITION_LABELS[result]}</h2>
          <p className="text-sm font-body text-dota-gold mb-2">{info.style}</p>
          <p className="text-sm font-body text-slate-400 max-w-md mx-auto">{info.desc}</p>

          <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
            {([1, 2, 3, 4, 5] as Position[]).map(pos => {
              const pct = Math.round(((scores[pos] || 0) / totalScore) * 100);
              return (
                <div key={pos} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 w-6">{pos}</span>
                  <div className="flex-1 h-2 rounded-full bg-dota-bg overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 duration-700 ${pos === result ? 'bg-dota-gold' : 'bg-slate-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-500 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-dota-card border border-dota-border p-6 mb-6">
          <h3 className="font-display text-lg font-bold text-white mb-4">Рекомендуемые герои</h3>
          <div className="grid grid-cols-4 gap-2">
            {heroesForPos.map(hero => (
              <div key={hero.id} className="rounded-2xl overflow-hidden bg-dota-bg border border-dota-border/50">
                <img src={hero.img} alt="" className="w-full aspect-[16/9] object-cover" />
                <div className="p-1.5">
                  <span className="text-[10px] font-body text-white block truncate">{hero.localized_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={resetQuiz} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-dota-accent text-white font-body font-bold text-sm">
            <RotateCcw className="w-4 h-4" /> Пройти снова
          </button>
          <button onClick={() => { setActiveQuiz('none'); resetQuiz(); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-dota-card border border-dota-border text-slate-300 font-body text-sm">
            <ChevronLeft className="w-4 h-4" /> К квизам
          </button>
        </div>
      </div>
    );
  }

  // ===== HERO RESULT =====
  if (activeQuiz === 'hero' && heroResult !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-dota-card border border-dota-border p-8 text-center mb-6">
          <div className="text-5xl mb-4">🦸</div>
          <h2 className="font-display text-3xl font-black text-white mb-2">Твои герои</h2>
          <p className="text-sm font-body text-slate-400 mb-6">Герои подобраны на основе твоего стиля игры</p>

          <div className="grid grid-cols-4 gap-3">
            {heroResult.map((hero, i) => (
              <div key={hero.id} className="rounded-2xl overflow-hidden bg-dota-bg border border-dota-border/50 hover:border-dota-gold/30 transition-all duration-300">
                <div className="relative">
                  <img src={hero.img} alt="" className="w-full aspect-[16/9] object-cover" />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-dota-gold font-bold">#{i + 1}</span>
                  </div>
                </div>
                <div className="p-1.5">
                  <span className="text-[10px] font-body text-white block truncate text-center">{hero.localized_name}</span>
                  <span className="text-[8px] font-body text-slate-500 block truncate text-center">{hero.roles.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={resetQuiz} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-body font-bold text-sm">
            <RotateCcw className="w-4 h-4" /> Пройти снова
          </button>
          <button onClick={() => { setActiveQuiz('none'); resetQuiz(); }} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-dota-card border border-dota-border text-slate-300 font-body text-sm">
            <ChevronLeft className="w-4 h-4" /> К квизам
          </button>
        </div>
      </div>
    );
  }

  // ===== QUESTIONS =====
  const isPositionQuiz = activeQuiz === 'position';
  const questions = isPositionQuiz ? POSITION_QUESTIONS : HERO_QUESTIONS;
  const q = questions[questionIdx];

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => { setActiveQuiz('none'); resetQuiz(); }} className="text-sm font-body text-slate-400 hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>
          <span className="text-xs font-body text-slate-500">{questionIdx + 1} / {questions.length}</span>
        </div>
        <div className="h-1.5 rounded-full bg-dota-card overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 duration-500 ${isPositionQuiz ? 'bg-gradient-to-r from-dota-accent to-dota-gold' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
            style={{ width: `${((questionIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl bg-dota-card border border-dota-border p-6 sm:p-8">
        <div className={`text-xs font-body uppercase tracking-wider mb-3 ${isPositionQuiz ? 'text-dota-gold' : 'text-emerald-400'}`}>
          {isPositionQuiz ? 'Квиз по позиции' : 'Подбор героя'}
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-6">{q.text}</h2>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (isPositionQuiz) {
                  handlePositionAnswer((opt as any).scores as Partial<Record<Position, number>>);
                } else {
                  handleHeroAnswer((opt as any).tags as string[]);
                }
              }}
              className={`w-full text-left p-4 rounded-2xl bg-dota-bg border border-dota-border hover:border-dota-gold/40 hover:bg-dota-gold/5 transition-all duration-300 font-body text-sm text-slate-300 hover:text-white`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
