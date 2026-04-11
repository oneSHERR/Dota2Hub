import { useState, useEffect } from 'react';
import { BarChart3, Loader2, AlertCircle, Crown, TrendingUp, Target } from 'lucide-react';
import { fetchHeroPositionStats, type HeroPositionStat, type HeroRankStat } from '@/data/stratzApi';

interface Props { heroId: number; }

const POSITION_COLORS: Record<string, string> = {
  'Pos 1 — Carry': '#daa520',
  'Pos 2 — Mid': '#3b82f6',
  'Pos 3 — Offlane': '#ef4444',
  'Pos 4 — Soft Sup': '#a855f7',
  'Pos 5 — Hard Sup': '#22c55e',
};

const RANK_COLORS: Record<string, string> = {
  Herald: '#616161', Guardian: '#81868f', Crusader: '#c0a050',
  Archon: '#c0a050', Legend: '#8b9dc3', Ancient: '#b88ae0',
  Divine: '#e0c882', Immortal: '#e74c3c',
};

export function HeroStats({ heroId }: Props) {
  const [data, setData] = useState<{ positions: HeroPositionStat[]; ranks: HeroRankStat[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetchHeroPositionStats(heroId)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [heroId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-dota-gold animate-spin" />
      <span className="font-body text-slate-400">Загрузка статистики...</span>
    </div>
  );

  if (error || !data) return (
    <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="font-body text-red-400">Не удалось загрузить статистику</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Winrate by Position */}
      <div className="rounded-2xl bg-dota-card/40 border border-dota-border/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-dota-gold" />
          <h3 className="font-display text-lg font-bold text-white">Винрейт по позициям</h3>
        </div>
        <div className="space-y-3">
          {data.positions.map(pos => {
            const color = POSITION_COLORS[pos.position] || '#888';
            const barWidth = Math.max(5, Math.min(100, (pos.winRate / 60) * 100));
            return (
              <div key={pos.position} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-body font-semibold text-slate-300">{pos.position}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-body text-slate-600">{pos.matchCount.toLocaleString()} игр</span>
                    <span className={`text-sm font-mono font-bold ${pos.winRate >= 52 ? 'text-green-400' : pos.winRate >= 48 ? 'text-slate-300' : 'text-red-400'}`}>
                      {pos.winRate}%
                    </span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-dota-bg/60 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 8px ${color}30`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Winrate by Rank */}
      <div className="rounded-2xl bg-dota-card/40 border border-dota-border/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-white">Винрейт по рангам</h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {data.ranks.map(rank => {
            const color = RANK_COLORS[rank.rank] || '#888';
            const barHeight = Math.max(10, Math.min(100, ((rank.winRate - 40) / 20) * 100));
            return (
              <div key={rank.rank} className="flex flex-col items-center gap-2">
                {/* Bar */}
                <div className="w-full h-24 rounded-xl bg-dota-bg/40 flex items-end justify-center p-1 relative overflow-hidden">
                  <div className="w-full rounded-lg transition-all duration-700" style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(180deg, ${color}, ${color}60)`,
                    boxShadow: `0 0 10px ${color}20`,
                  }} />
                  {/* WR label */}
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold" style={{ color }}>
                    {rank.winRate}%
                  </span>
                </div>
                {/* Rank name */}
                <span className="text-[9px] font-body font-bold uppercase tracking-wider text-center" style={{ color: color + 'cc' }}>
                  {rank.rank.slice(0, 4)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] font-body text-slate-700 text-center mt-3">Данные из STRATZ · All Pick Ranked</p>
      </div>
    </div>
  );
}
