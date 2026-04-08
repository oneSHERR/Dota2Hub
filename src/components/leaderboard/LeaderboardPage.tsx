import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Medal, Crown, TrendingUp, Users, Swords, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'wins' | 'winrate' | 'total'>('wins');

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (!data) { setEntries([]); setLoading(false); return; }

      const list: LeaderboardEntry[] = Object.entries(data)
        .map(([uid, userData]: [string, any]) => {
          const stats = userData.stats || { wins: 0, losses: 0, draws: 0 };
          const total = stats.wins + stats.losses + stats.draws;
          const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
          return {
            uid,
            displayName: userData.displayName || 'Аноним',
            wins: stats.wins || 0,
            losses: stats.losses || 0,
            draws: stats.draws || 0,
            total,
            winRate,
          };
        })
        .filter(e => e.total > 0); // Only show players with games

      setEntries(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === 'wins') return b.wins - a.wins;
    if (sortBy === 'winrate') return b.winRate - a.winRate;
    return b.total - a.total;
  });

  const myRank = user ? sorted.findIndex(e => e.uid === user.uid) + 1 : 0;
  const myEntry = user ? sorted.find(e => e.uid === user.uid) : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0d1117] to-[#0a0e13]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-dota-gold" />
            <h1 className="font-display text-5xl font-black text-white tracking-tight">ЛИДЕРБОРД</h1>
          </div>
          <p className="font-body text-slate-400 text-sm">Рейтинг лучших драфтеров</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* My stats */}
        {myEntry && (
          <div className="rounded-2xl bg-gradient-to-r from-dota-gold/8 to-dota-accent/8 border border-dota-gold/20 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-dota-gold to-dota-accent flex items-center justify-center shadow-lg shadow-dota-gold/20">
                  <span className="font-display text-2xl font-black text-white">#{myRank}</span>
                </div>
                <div>
                  <div className="font-body text-lg font-bold text-white">{myEntry.displayName}</div>
                  <div className="flex items-center gap-3 text-sm font-body text-slate-400">
                    <span className="text-emerald-400">{myEntry.wins}W</span>
                    <span className="text-red-400">{myEntry.losses}L</span>
                    <span className="text-slate-500">{myEntry.draws}D</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-black text-dota-gold">{myEntry.winRate}%</div>
                <div className="text-xs font-body text-slate-500">Винрейт</div>
              </div>
            </div>
          </div>
        )}

        {/* Sort tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-[#111827] border border-white/5 w-fit">
          {[
            { key: 'wins' as const, label: 'По победам', icon: Trophy },
            { key: 'winrate' as const, label: 'По винрейту', icon: TrendingUp },
            { key: 'total' as const, label: 'По играм', icon: Swords },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-bold transition-all ${
                sortBy === key ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Leaderboard table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-dota-gold/20 border-t-dota-gold animate-spin mx-auto mb-4" />
            <p className="font-body text-slate-400">Загрузка...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="font-body text-slate-400 text-lg">Пока нет данных</p>
            <p className="font-body text-slate-600 text-sm mt-2">Сыграйте в Draft Arena, чтобы попасть в рейтинг!</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Top 3 podium */}
            {sorted.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 0, 2].map(idx => {
                  const entry = sorted[idx];
                  if (!entry) return null;
                  const rank = idx + 1;
                  const isMe = user?.uid === entry.uid;
                  return (
                    <div
                      key={entry.uid}
                      className={`rounded-2xl bg-[#111827] border p-4 text-center ${
                        rank === 1 ? 'border-amber-500/30 order-2 -mt-4 shadow-xl shadow-amber-500/10' :
                        rank === 2 ? 'border-slate-400/20 order-1' :
                        'border-orange-700/20 order-3'
                      } ${isMe ? 'ring-2 ring-dota-gold/30' : ''}`}
                    >
                      <div className="text-3xl mb-2">
                        {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="font-body text-sm font-bold text-white truncate">{entry.displayName}</div>
                      <div className={`font-display text-2xl font-black mt-1 ${
                        rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : 'text-orange-400'
                      }`}>{entry.wins}</div>
                      <div className="text-[10px] font-body text-slate-500">побед</div>
                      <div className="text-xs font-body text-slate-400 mt-1">{entry.winRate}% WR</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of list */}
            {sorted.slice(3).map((entry, i) => {
              const rank = i + 4;
              const isMe = user?.uid === entry.uid;
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isMe ? 'bg-dota-gold/8 border border-dota-gold/20' : 'bg-[#111827] border border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="w-8 text-center">
                    <span className={`font-mono text-sm font-bold ${rank <= 10 ? 'text-dota-gold' : 'text-slate-500'}`}>
                      {rank}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {entry.displayName[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-body font-bold text-white truncate">
                      {entry.displayName}
                      {isMe && <span className="text-dota-gold ml-1">(ты)</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-body text-slate-500">
                      <span className="text-emerald-400">{entry.wins}W</span>
                      <span className="text-red-400">{entry.losses}L</span>
                      <span>{entry.total} игр</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-mono font-bold ${
                      entry.winRate >= 60 ? 'text-amber-400' :
                      entry.winRate >= 50 ? 'text-emerald-400' :
                      'text-red-400'
                    }`}>{entry.winRate}%</div>
                    <div className="text-[9px] font-body text-slate-600">WR</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
