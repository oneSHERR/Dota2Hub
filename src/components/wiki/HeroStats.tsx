import { useState, useEffect } from 'react';
import { Crown, Loader2, AlertCircle, Target } from 'lucide-react';

interface Props { heroId: number; }

interface RankData { rank: string; winRate: number; pickRate: number; matchCount: number; color: string; }

const RANK_META = [
  { idx: 1, name: 'Herald', color: '#616161' },
  { idx: 2, name: 'Guardian', color: '#81868f' },
  { idx: 3, name: 'Crusader', color: '#c0a050' },
  { idx: 4, name: 'Archon', color: '#c0a050' },
  { idx: 5, name: 'Legend', color: '#8b9dc3' },
  { idx: 6, name: 'Ancient', color: '#b88ae0' },
  { idx: 7, name: 'Divine', color: '#e0c882' },
  { idx: 8, name: 'Immortal', color: '#e74c3c' },
];

export function HeroStats({ heroId }: Props) {
  const [ranks, setRanks] = useState<RankData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true); setError(false);
    fetch('https://api.opendota.com/api/heroStats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setError(true); setLoading(false); return; }

        // Find our hero in the array
        const hero = data.find((h: any) => h.id === heroId);
        if (!hero) { setError(true); setLoading(false); return; }

        const result: RankData[] = RANK_META.map(({ idx, name, color }) => {
          const picks = hero[`${idx}_pick`] || 0;
          const wins = hero[`${idx}_win`] || 0;
          const wr = picks > 0 ? Math.round((wins / picks) * 1000) / 10 : 0;
          return { rank: name, winRate: wr, pickRate: picks, matchCount: picks, color };
        });

        setRanks(result);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [heroId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Loader2 className="w-6 h-6 text-dota-gold animate-spin" />
      <span className="font-body text-slate-400">Загрузка статистики...</span>
    </div>
  );

  if (error || ranks.length === 0) return (
    <div className="rounded-2xl bg-red-500/5 border border-red-500/15 p-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="font-body text-red-400">Не удалось загрузить статистику</p>
    </div>
  );

  // Overall stats
  const totalPicks = ranks.reduce((s, r) => s + r.matchCount, 0);
  const totalWins = ranks.reduce((s, r) => s + Math.round(r.matchCount * r.winRate / 100), 0);
  const overallWR = totalPicks > 0 ? Math.round((totalWins / totalPicks) * 1000) / 10 : 0;
  const bestRank = [...ranks].sort((a, b) => b.winRate - a.winRate)[0];
  const worstRank = [...ranks].sort((a, b) => a.winRate - b.winRate)[0];

  return (
    <div className="space-y-8">
      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Общий WR', value: `${overallWR}%`, color: overallWR >= 50 ? '#22c55e' : '#ef4444' },
          { label: 'Всего игр', value: totalPicks.toLocaleString(), color: '#daa520' },
          { label: 'Лучший ранг', value: bestRank.rank, color: bestRank.color },
          { label: 'Худший ранг', value: worstRank.rank, color: worstRank.color },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-dota-card/30 border border-dota-border/10 p-4 text-center">
            <p className="text-[10px] font-body text-slate-600 uppercase tracking-wider mb-1">{label}</p>
            <p className="font-display text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Winrate by Rank — horizontal bars */}
      <div className="rounded-2xl bg-dota-card/30 border border-dota-border/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-amber-400" />
          <h3 className="font-display text-lg font-bold text-white">Винрейт по рангам</h3>
          <span className="text-xs font-body text-slate-600 ml-auto">OpenDota · Текущая неделя</span>
        </div>
        <div className="space-y-3">
          {ranks.map(rank => {
            const barWidth = Math.max(5, Math.min(100, (rank.winRate / 60) * 100));
            return (
              <div key={rank.rank}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rank.color }} />
                    <span className="text-sm font-body font-semibold text-slate-300">{rank.rank}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-body text-slate-600">{rank.matchCount.toLocaleString()} игр</span>
                    <span className={`text-sm font-mono font-bold ${rank.winRate >= 52 ? 'text-green-400' : rank.winRate >= 48 ? 'text-slate-300' : 'text-red-400'}`}>
                      {rank.winRate}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-dota-bg/60 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`,
                    boxShadow: `0 0 8px ${rank.color}30`,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Winrate by Rank — vertical bars chart */}
      <div className="rounded-2xl bg-dota-card/30 border border-dota-border/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-blue-400" />
          <h3 className="font-display text-lg font-bold text-white">Популярность по рангам</h3>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {ranks.map(rank => {
            const maxPick = Math.max(...ranks.map(r => r.matchCount), 1);
            const barHeight = Math.max(8, (rank.matchCount / maxPick) * 100);
            return (
              <div key={rank.rank} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-mono font-bold" style={{ color: rank.color }}>{rank.matchCount > 999 ? `${(rank.matchCount / 1000).toFixed(1)}k` : rank.matchCount}</span>
                <div className="w-full h-20 rounded-lg bg-dota-bg/40 flex items-end justify-center p-0.5 overflow-hidden">
                  <div className="w-full rounded-md transition-all duration-700" style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(180deg, ${rank.color}, ${rank.color}40)`,
                  }} />
                </div>
                <span className="text-[9px] font-body font-bold text-center leading-tight" style={{ color: rank.color + 'aa' }}>
                  {rank.rank.slice(0, 4)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
