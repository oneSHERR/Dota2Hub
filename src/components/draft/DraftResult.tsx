import type { DraftAnalysis, Position } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Trophy, Swords, ArrowRight, RotateCcw, TrendingUp, Map } from 'lucide-react';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

interface Props { data: any; onNewGame: () => void; }

export function DraftResult({ data, onNewGame }: Props) {
  const analysis: DraftAnalysis = data.analysis;
  const p1 = data.player1, p2 = data.player2;
  const winner = data.winner;
  const winnerName = winner === 'player1' ? p1?.name : p2?.name;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Winner banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#111827] to-[#0f172a] border border-white/5 p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-transparent to-red-500/3" />
        <div className="relative z-10">
          <Trophy className="w-12 h-12 text-dota-gold mx-auto mb-4" />
          <h1 className="font-display text-4xl font-black text-white mb-2">{winnerName} побеждает!</h1>
          <p className="font-body text-slate-400 text-sm mb-6">{analysis.summary}</p>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="font-body text-sm font-bold text-emerald-400">{p1?.name} — {analysis.player1Score}%</span>
              <span className="font-body text-sm font-bold text-red-400">{analysis.player2Score}% — {p2?.name}</span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full" style={{ width: `${analysis.player1Score}%`, transition: 'width 1s' }} />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full" style={{ width: `${analysis.player2Score}%`, transition: 'width 1s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamSummary player={p1} color="emerald" advantages={analysis.player1Advantages} />
        <TeamSummary player={p2} color="red" advantages={analysis.player2Advantages} />
      </div>

      {/* Lane breakdown */}
      {analysis.laneBreakdown && analysis.laneBreakdown.length > 0 && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4"><Map className="w-5 h-5 text-dota-gold" /><h3 className="font-display text-lg font-bold text-white">Анализ линий</h3></div>
          <div className="space-y-2">
            {analysis.laneBreakdown.map((lane: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/2">
                <span className="font-body text-sm text-slate-400 w-40 flex-shrink-0">{lane.lane}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-body text-emerald-400">{toArray(lane.team1Heroes).join(', ')}</span>
                  <span className="text-[10px] text-slate-600">vs</span>
                  <span className="text-xs font-body text-red-400">{toArray(lane.team2Heroes).join(', ')}</span>
                </div>
                <span className={`text-xs font-body font-bold px-2 py-1 rounded ${lane.advantage === 'team1' ? 'bg-emerald-500/10 text-emerald-400' : lane.advantage === 'team2' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-400'}`}>
                  {lane.advantage === 'team1' ? p1?.name : lane.advantage === 'team2' ? p2?.name : 'Равно'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key matchups */}
      {analysis.keyMatchups && analysis.keyMatchups.length > 0 && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4"><Swords className="w-5 h-5 text-dota-accent" /><h3 className="font-display text-lg font-bold text-white">Ключевые матчапы</h3></div>
          <div className="space-y-2">
            {analysis.keyMatchups.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2">
                <span className={`font-body text-sm font-bold ${m.advantage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero1}</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <span className={`font-body text-sm font-bold ${m.advantage < 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero2}</span>
                <span className="text-xs font-body text-slate-500 ml-auto">{m.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synergy scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#111827] border border-white/5 p-4 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <div className="font-display text-2xl font-bold text-white">{analysis.synergyScore?.team1 || 0}</div>
          <div className="text-xs font-body text-slate-500">Синергия {p1?.name}</div>
        </div>
        <div className="rounded-xl bg-[#111827] border border-white/5 p-4 text-center">
          <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <div className="font-display text-2xl font-bold text-white">{analysis.synergyScore?.team2 || 0}</div>
          <div className="text-xs font-body text-slate-500">Синергия {p2?.name}</div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={onNewGame} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-dota-accent to-red-600 text-white font-body font-bold text-lg shadow-xl shadow-dota-accent/20 hover:scale-105 transition-all">
          <RotateCcw className="w-5 h-5" /> Играть снова
        </button>
      </div>
    </div>
  );
}

function TeamSummary({ player, color, advantages }: { player: any; color: 'emerald' | 'red'; advantages: string[] }) {
  const slots = toArray(player?.slots);
  const borderClass = color === 'emerald' ? 'border-emerald-500/15' : 'border-red-500/15';
  const dotClass = color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400';
  return (
    <div className={`rounded-2xl bg-[#111827] border ${borderClass} p-5`}>
      <div className="flex items-center gap-2 mb-4"><div className={`w-3 h-3 rounded-full ${dotClass}`} /><span className="font-body text-sm font-bold text-white">{player?.name}</span></div>
      <div className="space-y-1 mb-4">
        {slots.map((slot: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/2">
            <span className="text-[10px] font-mono text-slate-500 w-4">{slot?.position}</span>
            {slot?.hero ? <><img src={slot.hero.icon} alt="" className="w-6 h-6 rounded" /><span className="text-xs font-body text-white">{slot.hero.localized_name}</span></> : <span className="text-xs font-body text-slate-600">—</span>}
          </div>
        ))}
      </div>
      {advantages?.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-body text-slate-500 uppercase tracking-wider">Преимущества</span>
          {advantages.map((a: string, i: number) => <div key={i} className="text-xs font-body text-slate-300 flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5">✓</span> {a}</div>)}
        </div>
      )}
    </div>
  );
}
