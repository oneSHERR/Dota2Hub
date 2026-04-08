import type { DraftAnalysis, Position } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Trophy, Swords, ArrowRight, RotateCcw, TrendingUp, Map } from 'lucide-react';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

interface Props {
  data: any;
  onNewGame: () => void;
}

export function DraftResult({ data, onNewGame }: Props) {
  const analysis: DraftAnalysis = data.analysis;
  const p1 = data.player1;
  const p2 = data.player2;
  const winner = data.winner;
  const winnerName = winner === 'player1' ? p1?.name : winner === 'player2' ? p2?.name : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-dota-card border border-dota-border p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-dota-radiant/5 via-transparent to-dota-dire/5" />
        <div className="relative z-10">
          <Trophy className="w-12 h-12 text-dota-gold mx-auto mb-4" />
          <h1 className="font-display text-3xl font-black text-white mb-2">{winner === 'draw' ? 'Ничья!' : `${winnerName} побеждает!`}</h1>
          <p className="font-body text-slate-400 text-sm">{analysis.summary}</p>
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="font-body text-sm font-bold text-dota-radiant">{p1?.name} — {analysis.player1Score}%</span>
              <span className="font-body text-sm font-bold text-dota-dire">{p2?.name} — {analysis.player2Score}%</span>
            </div>
            <div className="h-4 rounded-full bg-dota-bg overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-dota-radiant to-green-600 transition-all duration-1000" style={{ width: `${analysis.player1Score}%` }} />
              <div className="h-full bg-gradient-to-r from-red-700 to-dota-dire transition-all duration-1000" style={{ width: `${analysis.player2Score}%` }} />
            </div>
            <div className="text-center mt-2"><span className="text-xs font-body text-slate-500">Уверенность: {analysis.confidence > 15 ? 'Высокая' : analysis.confidence > 5 ? 'Средняя' : 'Низкая'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamSummary player={p1} color="radiant" advantages={analysis.player1Advantages} />
        <TeamSummary player={p2} color="dire" advantages={analysis.player2Advantages} />
      </div>

      {analysis.laneBreakdown && analysis.laneBreakdown.length > 0 && (
        <div className="rounded-2xl bg-dota-card border border-dota-border p-6">
          <div className="flex items-center gap-2 mb-4"><Map className="w-5 h-5 text-dota-gold" /><h3 className="font-display text-lg font-bold text-white">Анализ линий</h3></div>
          <div className="space-y-3">
            {analysis.laneBreakdown.map((lane: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-dota-bg/50">
                <span className="font-body text-sm text-slate-400 w-40 flex-shrink-0">{lane.lane}</span>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-body text-dota-radiant">{toArray(lane.team1Heroes).join(', ')}</span>
                  <span className="text-xs text-slate-600">vs</span>
                  <span className="text-xs font-body text-dota-dire">{toArray(lane.team2Heroes).join(', ')}</span>
                </div>
                <span className={`text-xs font-body font-bold px-2 py-1 rounded ${lane.advantage === 'team1' ? 'bg-green-500/15 text-green-400' : lane.advantage === 'team2' ? 'bg-red-500/15 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  {lane.advantage === 'team1' ? p1?.name : lane.advantage === 'team2' ? p2?.name : 'Равно'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.keyMatchups && analysis.keyMatchups.length > 0 && (
        <div className="rounded-2xl bg-dota-card border border-dota-border p-6">
          <div className="flex items-center gap-2 mb-4"><Swords className="w-5 h-5 text-dota-accent" /><h3 className="font-display text-lg font-bold text-white">Ключевые матчапы</h3></div>
          <div className="space-y-2">
            {analysis.keyMatchups.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-dota-bg/50">
                <span className={`font-body text-sm font-bold ${m.advantage > 0 ? 'text-green-400' : 'text-red-400'}`}>{m.hero1}</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <span className={`font-body text-sm font-bold ${m.advantage < 0 ? 'text-green-400' : 'text-red-400'}`}>{m.hero2}</span>
                <span className="text-xs font-body text-slate-500 ml-auto">{m.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-dota-card border border-dota-border p-4 text-center">
          <TrendingUp className="w-5 h-5 text-dota-radiant mx-auto mb-2" />
          <div className="font-display text-2xl font-bold text-white">{analysis.synergyScore?.team1 || 0}</div>
          <div className="text-xs font-body text-slate-500">Синергия {p1?.name}</div>
        </div>
        <div className="rounded-xl bg-dota-card border border-dota-border p-4 text-center">
          <TrendingUp className="w-5 h-5 text-dota-dire mx-auto mb-2" />
          <div className="font-display text-2xl font-bold text-white">{analysis.synergyScore?.team2 || 0}</div>
          <div className="text-xs font-body text-slate-500">Синергия {p2?.name}</div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={onNewGame} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-dota-accent to-red-700 text-white font-body font-bold text-lg shadow-xl shadow-dota-accent/20 hover:shadow-dota-accent/40 hover:scale-105 transition-all">
          <RotateCcw className="w-5 h-5" /> Играть снова
        </button>
      </div>
    </div>
  );
}

function TeamSummary({ player, color, advantages }: { player: any; color: 'radiant' | 'dire'; advantages: string[] }) {
  const slots = toArray(player?.slots);
  return (
    <div className={`rounded-2xl bg-dota-card border ${color === 'radiant' ? 'border-dota-radiant/30' : 'border-dota-dire/30'} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color === 'radiant' ? 'bg-dota-radiant' : 'bg-dota-dire'}`} />
        <span className="font-body text-sm font-bold text-white">{player?.name}</span>
      </div>
      <div className="space-y-1.5 mb-4">
        {slots.map((slot: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-dota-bg/50">
            <span className="text-[10px] font-mono text-slate-500 w-4">{slot?.position}</span>
            {slot?.hero ? (
              <><img src={slot.hero.icon} alt="" className="w-6 h-6 rounded" /><span className="text-xs font-body text-white">{slot.hero.localized_name}</span></>
            ) : <span className="text-xs font-body text-slate-600">—</span>}
          </div>
        ))}
      </div>
      {advantages && advantages.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-body text-slate-500 uppercase tracking-wider">Преимущества</span>
          {advantages.map((a: string, i: number) => (
            <div key={i} className="text-xs font-body text-slate-300 flex items-start gap-1.5"><span className="text-green-400 mt-0.5">✓</span> {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}
