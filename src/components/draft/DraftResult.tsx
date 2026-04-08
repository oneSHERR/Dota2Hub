import type { DraftAnalysis, Position } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Trophy, Swords, ArrowRight, RotateCcw, TrendingUp, Map, Star, Shield, Zap, Target, MessageSquare, Award } from 'lucide-react';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

// Draft grade based on score difference
type DraftGrade = 'S' | 'A' | 'B' | 'C' | 'D';

function getDraftGrade(score: number): DraftGrade {
  if (score >= 65) return 'S';
  if (score >= 57) return 'A';
  if (score >= 50) return 'B';
  if (score >= 42) return 'C';
  return 'D';
}

function getGradeColor(grade: DraftGrade): string {
  switch (grade) {
    case 'S': return 'from-amber-400 to-yellow-500';
    case 'A': return 'from-emerald-400 to-green-500';
    case 'B': return 'from-blue-400 to-cyan-500';
    case 'C': return 'from-orange-400 to-amber-500';
    case 'D': return 'from-red-400 to-red-600';
  }
}

function getGradeBg(grade: DraftGrade): string {
  switch (grade) {
    case 'S': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    case 'A': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    case 'B': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    case 'C': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'D': return 'bg-red-500/10 border-red-500/30 text-red-400';
  }
}

function getGradeText(grade: DraftGrade): string {
  switch (grade) {
    case 'S': return 'Превосходный драфт! Идеальные контрпики и синергии.';
    case 'A': return 'Отличный драфт. Сильные матчапы и хорошая синергия.';
    case 'B': return 'Хороший драфт. Есть преимущества, но и слабые места.';
    case 'C': return 'Средний драфт. Много уязвимых линий.';
    case 'D': return 'Слабый драфт. Противник имеет значительное преимущество.';
  }
}

// Generate detailed explanation for the draft result
function generateDetailedAnalysis(analysis: DraftAnalysis, p1Name: string, p2Name: string): string[] {
  const lines: string[] = [];
  const winner = analysis.predictedWinner === 'player1' ? p1Name : p2Name;
  const loser = analysis.predictedWinner === 'player1' ? p2Name : p1Name;
  const diff = Math.abs(analysis.player1Score - analysis.player2Score);

  // Overall assessment
  if (diff > 20) {
    lines.push(`🏆 ${winner} доминирует в этом драфте с огромным преимуществом в ${diff} очков. ${loser} оказался в крайне невыгодном положении из-за плохих матчапов и слабой синергии.`);
  } else if (diff > 10) {
    lines.push(`⚔️ ${winner} имеет заметное преимущество в драфте (+${diff}). Хотя у ${loser} есть свои сильные стороны, общая картина складывается не в его пользу.`);
  } else if (diff > 5) {
    lines.push(`🤝 Драфты достаточно близки, но ${winner} получает небольшое преимущество (+${diff}). Исполнение игроков будет играть ключевую роль в исходе матча.`);
  } else {
    lines.push(`⚖️ Практически равные драфты! Разница всего ${diff} очков в пользу ${winner}. Эта игра будет решена чистым скиллом и координацией команды.`);
  }

  // Lane analysis
  const lanesWon1 = analysis.laneBreakdown.filter(l => l.advantage === 'team1').length;
  const lanesWon2 = analysis.laneBreakdown.filter(l => l.advantage === 'team2').length;
  const evenLanes = analysis.laneBreakdown.filter(l => l.advantage === 'even').length;

  if (lanesWon1 > lanesWon2) {
    lines.push(`🗺️ ${p1Name} выигрывает ${lanesWon1} из ${analysis.laneBreakdown.length} линий. Ранняя стадия игры будет в его пользу, что даст экономическое преимущество к мидгейму.`);
  } else if (lanesWon2 > lanesWon1) {
    lines.push(`🗺️ ${p2Name} доминирует на ${lanesWon2} линиях. Ранняя игра будет в его пользу, позволяя быстрее выйти на ключевые предметы.`);
  } else if (evenLanes === analysis.laneBreakdown.length) {
    lines.push(`🗺️ Все линии примерно равны! Это будет битва на индивидуальном мастерстве, где каждая ротация и ганк могут перевернуть игру.`);
  }

  // Synergy comparison
  const syn1 = analysis.synergyScore?.team1 || 0;
  const syn2 = analysis.synergyScore?.team2 || 0;
  if (syn1 > syn2 + 15) {
    lines.push(`🔗 У команды ${p1Name} значительно лучшая синергия (${syn1} vs ${syn2}). Их герои великолепно дополняют друг друга, создавая мощные комбинации способностей.`);
  } else if (syn2 > syn1 + 15) {
    lines.push(`🔗 Команда ${p2Name} имеет превосходную синергию героев (${syn2} vs ${syn1}). Комбинации их способностей могут перевернуть любой тимфайт.`);
  } else {
    lines.push(`🔗 Синергия команд примерно равна (${syn1} vs ${syn2}). Обе команды имеют рабочие комбинации, и победит тот, кто лучше их реализует.`);
  }

  // Key matchups
  if (analysis.keyMatchups && analysis.keyMatchups.length > 0) {
    const strongCounters = analysis.keyMatchups.filter(m => Math.abs(m.advantage) >= 3);
    if (strongCounters.length > 0) {
      const top = strongCounters[0];
      const counteringHero = top.advantage > 0 ? top.hero1 : top.hero2;
      const counteredHero = top.advantage > 0 ? top.hero2 : top.hero1;
      lines.push(`🎯 Ключевой матчап: ${counteringHero} является жёстким контрпиком для ${counteredHero}. Это существенно влияет на исход драфта и потребует от ${counteredHero} особой осторожности в игре.`);
    }
  }

  // Late game prediction
  const p1Roles = new Set<string>();
  const p2Roles = new Set<string>();
  analysis.laneBreakdown.forEach(l => {
    // infer from names
  });

  if (diff <= 10) {
    lines.push(`💡 Совет: при таком близком драфте всё решается исполнением. Кто лучше реализует свои пауэрспайки и вовремя использует ключевые способности — тот и победит.`);
  }

  return lines;
}

interface Props { data: any; onNewGame: () => void; }

export function DraftResult({ data, onNewGame }: Props) {
  const analysis: DraftAnalysis = data.analysis;
  const p1 = data.player1, p2 = data.player2;
  const winner = data.winner;
  const winnerName = winner === 'player1' ? p1?.name : p2?.name;

  const p1Grade = getDraftGrade(analysis.player1Score);
  const p2Grade = getDraftGrade(analysis.player2Score);
  const detailedAnalysis = generateDetailedAnalysis(analysis, p1?.name || 'Игрок 1', p2?.name || 'Игрок 2');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Winner banner with grade */}
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

      {/* Draft grades */}
      <div className="grid grid-cols-2 gap-4">
        <GradeCard name={p1?.name} grade={p1Grade} score={analysis.player1Score} />
        <GradeCard name={p2?.name} grade={p2Grade} score={analysis.player2Score} />
      </div>

      {/* Detailed text analysis */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-dota-gold" />
          <h3 className="font-display text-lg font-bold text-white">Подробный анализ</h3>
        </div>
        <div className="space-y-3">
          {detailedAnalysis.map((line, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-sm font-body text-slate-300 leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamSummary player={p1} color="emerald" advantages={analysis.player1Advantages} grade={p1Grade} />
        <TeamSummary player={p2} color="red" advantages={analysis.player2Advantages} grade={p2Grade} />
      </div>

      {/* Lane breakdown with details */}
      {analysis.laneBreakdown && analysis.laneBreakdown.length > 0 && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-dota-gold" />
            <h3 className="font-display text-lg font-bold text-white">Анализ линий</h3>
          </div>
          <div className="space-y-3">
            {analysis.laneBreakdown.map((lane: any, i: number) => (
              <div key={i} className="rounded-xl bg-white/3 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm font-bold text-white">{lane.lane}</span>
                  <span className={`text-xs font-body font-bold px-3 py-1 rounded-full ${
                    lane.advantage === 'team1' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    lane.advantage === 'team2' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {lane.advantage === 'team1' ? `✅ ${p1?.name}` : lane.advantage === 'team2' ? `❌ ${p2?.name}` : '🤝 Равно'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs font-body text-emerald-400">{toArray(lane.team1Heroes).join(', ')}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-bold">VS</span>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <span className="text-xs font-body text-red-400">{toArray(lane.team2Heroes).join(', ')}</span>
                  </div>
                </div>
                <p className="text-xs font-body text-slate-500 italic">{lane.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key matchups */}
      {analysis.keyMatchups && analysis.keyMatchups.length > 0 && (
        <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-5 h-5 text-dota-accent" />
            <h3 className="font-display text-lg font-bold text-white">Ключевые матчапы</h3>
          </div>
          <div className="space-y-2">
            {analysis.keyMatchups.map((m: any, i: number) => {
              const absAdv = Math.abs(m.advantage);
              const severity = absAdv >= 4 ? 'Жёсткий контрпик' : absAdv >= 3 ? 'Сильный контрпик' : 'Преимущество';
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <span className={`font-body text-sm font-bold ${m.advantage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero1}</span>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 rounded-full ${m.advantage > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${absAdv * 12}px` }} />
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <div className={`h-1.5 rounded-full ${m.advantage < 0 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${absAdv * 12}px` }} />
                  </div>
                  <span className={`font-body text-sm font-bold ${m.advantage < 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero2}</span>
                  <div className="ml-auto text-right">
                    <span className="text-[10px] font-body text-slate-500 block">{severity}</span>
                    <span className="text-xs font-body text-slate-400">{m.reason}</span>
                  </div>
                </div>
              );
            })}
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

function GradeCard({ name, grade, score }: { name: string; grade: DraftGrade; score: number }) {
  return (
    <div className={`rounded-2xl border p-5 text-center ${getGradeBg(grade)}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Award className="w-5 h-5" />
        <span className="font-body text-sm font-bold">{name}</span>
      </div>
      <div className={`font-display text-5xl font-black bg-gradient-to-b ${getGradeColor(grade)} bg-clip-text text-transparent`}>
        {grade}
      </div>
      <div className="text-xs font-body mt-2 opacity-80">{getGradeText(grade)}</div>
      <div className="text-lg font-mono font-bold mt-1">{score}%</div>
    </div>
  );
}

function TeamSummary({ player, color, advantages, grade }: { player: any; color: 'emerald' | 'red'; advantages: string[]; grade: DraftGrade }) {
  const slots = toArray(player?.slots);
  const borderClass = color === 'emerald' ? 'border-emerald-500/15' : 'border-red-500/15';
  const dotClass = color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400';
  return (
    <div className={`rounded-2xl bg-[#111827] border ${borderClass} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${dotClass}`} />
        <span className="font-body text-sm font-bold text-white">{player?.name}</span>
        <span className={`ml-auto text-xs font-display font-bold px-2 py-0.5 rounded ${getGradeBg(grade)}`}>{grade}</span>
      </div>
      <div className="space-y-1 mb-4">
        {slots.map((slot: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/2">
            <span className="text-[10px] font-mono text-slate-500 w-4">{slot?.position}</span>
            {slot?.hero ? (
              <>
                <img src={slot.hero.icon} alt="" className="w-6 h-6 rounded" />
                <span className="text-xs font-body text-white">{slot.hero.localized_name}</span>
              </>
            ) : <span className="text-xs font-body text-slate-600">—</span>}
          </div>
        ))}
      </div>
      {advantages?.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-body text-slate-500 uppercase tracking-wider">Преимущества</span>
          {advantages.map((a: string, i: number) => (
            <div key={i} className="text-xs font-body text-slate-300 flex items-start gap-1.5">
              <span className="text-emerald-400 mt-0.5">✓</span> {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
