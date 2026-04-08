import { Link } from 'react-router-dom';
import { Swords, BookOpen, HelpCircle, ChevronRight, Zap, Shield, Target, ScrollText, TrendingUp } from 'lucide-react';
import { ALL_HEROES, META_HEROES } from '@/data/heroes';

const FEATURES = [
  { icon: Swords, title: 'Draft Arena', desc: 'Играй 1v1 с друзьями. Выбирай героев по позициям, анализируй драфт с помощью AI.', link: '/draft', color: 'from-red-500 to-orange-600', glow: 'shadow-red-500/20' },
  { icon: BookOpen, title: 'Wiki героев', desc: 'Контрпики, синергии и матчапы для всех 127 героев Dota 2.', link: '/wiki', color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
  { icon: HelpCircle, title: 'Квизы', desc: 'Узнай свою идеальную позицию и подбери героев под свой стиль.', link: '/quiz', color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  { icon: ScrollText, title: 'Патч 7.41b', desc: 'Все изменения героев и предметов в актуальном патче на русском.', link: '/patch', color: 'from-amber-500 to-yellow-600', glow: 'shadow-amber-500/20' },
];

const STATS = [
  { icon: Target, value: '127', label: 'Героев' },
  { icon: Zap, value: 'AI', label: 'Анализ драфта' },
  { icon: Shield, value: '7.41b', label: 'Актуальный патч' },
];

export function HomePage() {
  const metaCarry = META_HEROES.carry.slice(0, 4);
  const metaMid = META_HEROES.mid.slice(0, 4);

  return (
    <div className="relative overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background: hero mosaic like dota2.com */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0a0e13] to-[#0d1117]" />
          <div className="absolute inset-0 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5 opacity-[0.07]">
            {ALL_HEROES.slice(0, 96).map((hero) => (
              <div key={hero.id} className="aspect-[16/9] overflow-hidden">
                <img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e13] via-[#0a0e13]/60 to-[#0a0e13]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e13]/80 via-transparent to-[#0a0e13]/80" />
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-dota-accent/10 border border-dota-accent/20 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-dota-accent animate-pulse" />
            <span className="text-xs font-body text-dota-accent tracking-wider uppercase font-medium">Патч 7.41b — актуальные данные</span>
          </div>

          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight mb-6 leading-[0.9]">
            <span className="gradient-text">DOTA 2</span><br />
            <span className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">HUB</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-body max-w-2xl mx-auto mb-10 leading-relaxed">
            Драфт-арена, вики героев и квизы — всё для того, чтобы побеждать
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/draft" className="group flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-dota-accent to-red-700 text-white font-body font-bold text-lg shadow-2xl shadow-dota-accent/30 hover:shadow-dota-accent/50 hover:scale-105 transition-all duration-300">
              <Swords className="w-5 h-5" /> Играть <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/wiki" className="flex items-center gap-2 px-10 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-body font-medium text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
              <BookOpen className="w-5 h-5" /> Герои
            </Link>
          </div>

          <div className="flex items-center justify-center gap-10 sm:gap-16">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-dota-gold" />
                  <span className="font-display text-3xl font-bold text-white">{value}</span>
                </div>
                <span className="text-[10px] font-body text-slate-500 uppercase tracking-[0.2em]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </section>

      {/* ===== META HEROES ===== */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-5 h-5 text-dota-gold" />
          <h2 className="font-display text-2xl font-bold text-white">Мета герои 7.41b</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <MetaBlock label="Carry / Pos 1" color="text-dota-gold" borderColor="dota-gold" heroes={metaCarry} />
          <MetaBlock label="Mid / Pos 2" color="text-blue-400" borderColor="blue-400" heroes={metaMid} />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, link, color, glow }) => (
            <Link key={title} to={link} className={`group relative overflow-hidden rounded-2xl bg-dota-card/80 backdrop-blur-sm border border-dota-border/50 p-6 sm:p-8 hover:border-white/15 transition-all duration-300 shadow-xl ${glow} hover:shadow-2xl`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-sm font-body text-slate-400 leading-relaxed mb-4">{desc}</p>
              <div className="flex items-center gap-1 text-sm font-body text-dota-gold group-hover:gap-2 transition-all">
                Перейти <ChevronRight className="w-4 h-4" />
              </div>
              <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-dota-border/30 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-dota-accent" />
            <span className="font-display text-sm text-slate-500">Dota 2 Hub</span>
          </div>
          <p className="text-xs font-body text-slate-600">Dota 2 is a registered trademark of Valve Corporation.</p>
          <div className="flex items-center gap-1 text-xs font-body text-slate-600">
            <span>Патч</span><span className="text-dota-gold font-medium">7.41b</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetaBlock({ label, color, borderColor, heroes }: { label: string; color: string; borderColor: string; heroes: string[] }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-dota-card to-dota-bg border border-dota-border/50 p-5">
      <div className={`text-xs font-body ${color} uppercase tracking-wider mb-3 font-medium`}>{label}</div>
      <div className="grid grid-cols-4 gap-2">
        {heroes.map(name => {
          const hero = ALL_HEROES.find(h => h.name === name);
          if (!hero) return null;
          return (
            <Link to="/wiki" key={name} className="group">
              <div className={`rounded-lg overflow-hidden border border-dota-border/30 group-hover:border-${borderColor}/40 transition-all`}>
                <img src={hero.img} alt={hero.localized_name} className="w-full aspect-[16/9] object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[10px] font-body text-slate-400 mt-1 block truncate text-center">{hero.localized_name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
