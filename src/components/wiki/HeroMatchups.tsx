import { useMemo } from 'react';
import { Shield, Zap, Users } from 'lucide-react';
import { ALL_HEROES } from '@/data/heroes';
import { getHeroAdvantage, getHeroSynergy } from '@/data/matchups';
import type { Hero } from '@/types';

interface Props { hero: Hero; }

export function HeroMatchups({ hero }: Props) {
  const matchups = useMemo(() => {
    return ALL_HEROES.filter(h => h.id !== hero.id)
      .map(h => ({ hero: h, advantage: getHeroAdvantage(hero, h) }))
      .sort((a, b) => b.advantage - a.advantage);
  }, [hero]);

  const counters = matchups.filter(m => m.advantage >= 1.5);
  const counteredBy = matchups.filter(m => m.advantage <= -1.5).sort((a, b) => a.advantage - b.advantage);

  const synergies = useMemo(() => {
    return ALL_HEROES.filter(h => h.id !== hero.id)
      .map(h => ({ hero: h, score: getHeroSynergy(hero, h) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [hero]);

  return (
    <div className="space-y-6">
      {/* Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-dota-card/40 border border-green-500/15 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="font-display text-lg font-bold text-white">Хорош против</h3>
            <span className="text-xs font-body text-slate-600 ml-auto">{counters.length}</span>
          </div>
          {counters.length > 0 ? (
            <div className="space-y-1.5">
              {counters.slice(0, 10).map(({ hero: h, advantage }) => (
                <MatchupRow key={h.id} hero={h} score={advantage} positive />
              ))}
            </div>
          ) : <p className="font-body text-slate-500">Нет явных контрпиков</p>}
        </div>

        <div className="rounded-2xl bg-dota-card/40 border border-red-500/15 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-6 h-6 text-red-400" />
            <h3 className="font-display text-lg font-bold text-white">Слаб против</h3>
            <span className="text-xs font-body text-slate-600 ml-auto">{counteredBy.length}</span>
          </div>
          {counteredBy.length > 0 ? (
            <div className="space-y-1.5">
              {counteredBy.slice(0, 10).map(({ hero: h, advantage }) => (
                <MatchupRow key={h.id} hero={h} score={Math.abs(advantage)} positive={false} />
              ))}
            </div>
          ) : <p className="font-body text-slate-500">Нет явных контрпиков</p>}
        </div>
      </div>

      {/* Synergies */}
      <div className="rounded-2xl bg-dota-card/40 border border-blue-500/15 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="font-display text-lg font-bold text-white">Лучшие союзники</h3>
        </div>
        {synergies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {synergies.slice(0, 12).map(({ hero: h, score }) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-dota-bg/30 hover:bg-dota-bg/50 transition-all duration-300">
                <img src={h.icon} alt="" className="w-9 h-9 rounded-lg border border-dota-border/20" />
                <span className="font-body font-medium text-white flex-1 truncate">{h.localized_name}</span>
                <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">+{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        ) : <p className="font-body text-slate-500">Нет данных о синергиях</p>}
      </div>
    </div>
  );
}

function MatchupRow({ hero, score, positive }: { hero: Hero; score: number; positive: boolean }) {
  const barWidth = Math.min(100, (score / 5) * 100);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-dota-bg/30 hover:bg-dota-bg/50 transition-all duration-300 group">
      <img src={hero.icon} alt="" className="w-8 h-8 rounded-lg border border-dota-border/20 group-hover:scale-110 transition-transform" />
      <span className="font-body text-white flex-1 truncate text-sm">{hero.localized_name}</span>
      <div className="w-24 h-2 rounded-full bg-dota-bg/60 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${positive ? 'bg-green-500' : 'bg-red-500'}`}
          style={{ width: `${barWidth}%`, boxShadow: positive ? '0 0 6px rgba(34,197,94,0.3)' : '0 0 6px rgba(239,68,68,0.3)' }} />
      </div>
      <span className={`text-sm font-mono font-bold w-10 text-right ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? '+' : '-'}{score.toFixed(1)}
      </span>
    </div>
  );
}
