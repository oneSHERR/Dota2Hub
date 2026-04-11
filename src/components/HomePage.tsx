import { Link } from 'react-router-dom';
import { Swords, BookOpen, HelpCircle, ChevronRight, Zap, Shield, Target, ScrollText, TrendingUp, Crown, Calculator, Gamepad2 } from 'lucide-react';
import { ALL_HEROES, META_HEROES } from '@/data/heroes';

const FEATURES = [
  { icon: Swords, title: 'Draft Arena', desc: 'Играй 1v1 с друзьями. Выбирай героев по позициям, анализируй драфт с помощью AI.', link: '/draft', color: 'from-red-500 to-orange-600', glow: 'shadow-red-500/20', accent: '#ef4444' },
  { icon: BookOpen, title: 'Wiki героев', desc: 'Контрпики, синергии, способности из OpenDota API для всех 128 героев.', link: '/wiki', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20', accent: '#3b82f6' },
  { icon: Crown, title: 'Тир-лист', desc: 'Рейтинг героев на основе OpenDota API. Винрейт и пикрейт по всем рангам.', link: '/tierlist', color: 'from-amber-500 to-yellow-600', glow: 'shadow-amber-500/20', accent: '#f59e0b' },
  { icon: Calculator, title: 'Калькулятор', desc: 'Введи вражеский драфт — получи лучшие контрпики с учётом синергий.', link: '/calculator', color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20', accent: '#8b5cf6' },
  { icon: Target, title: 'Контрпик-квиз', desc: 'Мини-игра: угадай правильный контрпик из 4 вариантов.', link: '/counterpick', color: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/20', accent: '#ec4899' },
  { icon: Gamepad2, title: 'Мини-игры', desc: 'Инвокер-тренажёр, матчапы и Draft Puzzle.', link: '/minigames', color: 'from-fuchsia-500 to-pink-600', glow: 'shadow-fuchsia-500/20', accent: '#d946ef' },
  { icon: HelpCircle, title: 'Квиз позиций', desc: 'Узнай свою идеальную позицию и подбери героев.', link: '/quiz', color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', accent: '#10b981' },
  { icon: ScrollText, title: 'Патч 7.41b', desc: 'Все изменения героев и предметов на русском.', link: '/patch', color: 'from-slate-400 to-zinc-500', glow: 'shadow-slate-500/20', accent: '#94a3b8' },
];

const STATS = [
  { icon: Target, value: '128', label: 'Героев' },
  { icon: Zap, value: 'AI', label: 'Анализ' },
  { icon: Shield, value: '7.41b', label: 'Патч' },
  { icon: Crown, value: 'S→D', label: 'Тиры' },
];

const META_SECTIONS = [
  { key: 'carry' as const, label: 'Pos 1 — Carry', color: 'text-dota-gold', bc: 'border-dota-gold/15' },
  { key: 'mid' as const, label: 'Pos 2 — Mid', color: 'text-blue-400', bc: 'border-blue-500/15' },
  { key: 'offlane' as const, label: 'Pos 3 — Offlane', color: 'text-red-400', bc: 'border-red-500/15' },
  { key: 'support4' as const, label: 'Pos 4 — Roamer', color: 'text-purple-400', bc: 'border-purple-500/15' },
  { key: 'support5' as const, label: 'Pos 5 — Support', color: 'text-emerald-400', bc: 'border-emerald-500/15' },
];

export function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dota-bg via-[#080c14] to-dota-bg" />
          <div className="absolute inset-0 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5 opacity-[0.05]">
            {ALL_HEROES.slice(0, 96).map((hero) => (
              <div key={hero.id} className="aspect-[16/9] overflow-hidden"><img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" /></div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-dota-bg via-dota-bg/50 to-dota-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-dota-bg/80 via-transparent to-dota-bg/80" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-600/[0.04] rounded-full blur-[200px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[180px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/[0.03] rounded-full blur-[150px] animate-float" />
        </div>

        <div className="relative z-10 text-center max-w-4xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-dota-gold/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-dota-gold animate-pulse-soft" />
            <span className="text-sm font-body text-dota-gold/80 tracking-wider uppercase font-semibold">v3 · Патч 7.41b · OpenDota API</span>
          </div>

          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight mb-6 leading-[0.85]">
            <span className="gradient-text drop-shadow-[0_0_60px_rgba(218,165,32,0.15)]">DOTA 2</span><br />
            <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.04)]">HUB</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400/80 font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Драфт-арена, вики, тир-лист, калькулятор и мини-игры
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/draft" className="group relative flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-dota-accent to-red-700 text-white font-body font-bold text-lg shadow-2xl shadow-dota-accent/20 hover:shadow-dota-accent/40 hover:scale-105 transition-all duration-300 overflow-hidden">
              <Swords className="w-5 h-5" /> Играть <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
            <Link to="/minigames" className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-dota-border/30 text-slate-300 hover:text-white hover:border-dota-gold/20 font-body font-semibold text-lg transition-all duration-300">
              <Gamepad2 className="w-5 h-5" /> Мини-игры
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 sm:gap-14">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-dota-gold/60" />
                  <span className="font-display text-3xl font-bold text-white">{value}</span>
                </div>
                <span className="text-[10px] font-body text-slate-600 uppercase tracking-[0.2em]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/20 animate-pulse-soft" />
          </div>
        </div>
      </section>

      {/* ===== META ===== */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dota-gold/20 to-transparent flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-dota-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Мета герои 7.41b</h2>
            <p className="text-xs font-body text-slate-600">Актуальные пики по позициям</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {META_SECTIONS.map(({ key, label, color, bc }) => (
            <MetaBlock key={key} label={label} color={color} borderColor={bc} heroes={META_HEROES[key].slice(0, 4)} />
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dota-accent/20 to-transparent flex items-center justify-center">
            <Zap className="w-5 h-5 text-dota-accent" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Возможности</h2>
            <p className="text-xs font-body text-slate-600">Всё для Dota 2 в одном месте</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, link, color, glow, accent }) => (
            <Link key={title} to={link}
              className={`group relative overflow-hidden rounded-2xl bg-dota-card/50 border border-dota-border/20 p-6 hover:border-white/10 transition-all duration-400 shadow-xl ${glow} hover:shadow-2xl hover:translate-y-[-4px] shine-effect`}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-1.5 group-hover:text-dota-gold transition-colors duration-300">{title}</h3>
              <p className="text-xs font-body text-slate-500 leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1 text-sm font-body font-semibold group-hover:gap-2.5 transition-all" style={{ color: accent }}>
                Перейти <ChevronRight className="w-4 h-4" />
              </div>
              <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity duration-500`} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-dota-border/15 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-dota-accent/30" />
            <span className="font-display text-sm text-slate-700">Dota 2 Hub v3</span>
          </div>
          <p className="text-xs font-body text-slate-700/60">Dota 2 is a registered trademark of Valve Corporation.</p>
          <div className="flex items-center gap-1.5 text-xs font-body text-slate-700">
            <span>Патч</span><span className="text-dota-gold/50 font-semibold">7.41b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetaBlock({ label, color, borderColor, heroes }: { label: string; color: string; borderColor: string; heroes: string[] }) {
  return (
    <div className={`rounded-2xl bg-dota-card/30 border ${borderColor} p-5 hover:bg-dota-card/50 transition-all duration-300`}>
      <div className={`text-xs font-body ${color} uppercase tracking-wider mb-3 font-semibold`}>{label}</div>
      <div className="grid grid-cols-4 gap-2">
        {heroes.map(name => {
          const hero = ALL_HEROES.find(h => h.name === name);
          if (!hero) return null;
          return (
            <Link to="/wiki" key={name} className="group/h">
              <div className="rounded-lg overflow-hidden border border-dota-border/15 group-hover/h:border-white/15 transition-all duration-300">
                <img src={hero.img} alt={hero.localized_name} className="w-full aspect-[16/9] object-cover group-hover/h:scale-110 transition-transform duration-500" />
              </div>
              <span className="text-[10px] font-body text-slate-500 mt-1.5 block truncate text-center group-hover/h:text-slate-300 transition-colors">{hero.localized_name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
