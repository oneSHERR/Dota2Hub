import { useState, useEffect } from 'react';
import { analyzeDraft } from '@/data/matchups';
import type { DraftSlot, DraftAnalysis, Position } from '@/types';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

interface Props {
  playerSlots: DraftSlot[];
  aiSlots: DraftSlot[];
  playerName: string;
  aiName: string;
  onComplete: (analysis: DraftAnalysis) => void;
}

type BattleStage = 'intro' | 'versus' | 'lane_safe' | 'lane_mid' | 'lane_off' | 'analyzing' | 'reveal';

const LANE_NAMES: Record<string, string> = {
  lane_safe: 'Лёгкая линия',
  lane_mid: 'Мид',
  lane_off: 'Сложная линия',
};

const LANE_POSITIONS: Record<string, Position[]> = {
  lane_safe: [1, 5],
  lane_mid: [2],
  lane_off: [3, 4],
};

export function SoloBattleAnimation({ playerSlots, aiSlots, playerName, aiName, onComplete }: Props) {
  const [stage, setStage] = useState<BattleStage>('intro');
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [laneResult, setLaneResult] = useState<Record<string, 'team1' | 'team2' | 'even'>>({});

  const p1Slots = playerSlots.filter(s => s.hero);
  const p2Slots = aiSlots.filter(s => s.hero);

  useEffect(() => {
    // Run analysis
    const result = analyzeDraft(playerSlots, aiSlots, playerName, aiName);

    // Never allow draw
    if (result.player1Score === result.player2Score) {
      const syn1 = result.synergyScore?.team1 || 0;
      const syn2 = result.synergyScore?.team2 || 0;
      if (syn1 >= syn2) {
        result.player1Score = 52;
        result.player2Score = 48;
        result.predictedWinner = 'player1';
      } else {
        result.player1Score = 48;
        result.player2Score = 52;
        result.predictedWinner = 'player2';
      }
    }

    setAnalysis(result);

    // Build lane results
    const lr: Record<string, 'team1' | 'team2' | 'even'> = {};
    result.laneBreakdown.forEach(lane => {
      if (lane.lane.includes('Лёгкая')) lr.lane_safe = lane.advantage;
      else if (lane.lane.includes('Мид')) lr.lane_mid = lane.advantage;
      else if (lane.lane.includes('Сложная')) lr.lane_off = lane.advantage;
    });
    setLaneResult(lr);

    // Animation timeline
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStage('versus'), 1500));
    timers.push(setTimeout(() => setStage('lane_safe'), 3500));
    timers.push(setTimeout(() => setStage('lane_mid'), 6000));
    timers.push(setTimeout(() => setStage('lane_off'), 8500));
    timers.push(setTimeout(() => setStage('analyzing'), 11000));
    timers.push(setTimeout(() => setStage('reveal'), 13000));
    timers.push(setTimeout(() => onComplete(result), 16000));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!analysis) return null;

  const winnerName = analysis.predictedWinner === 'player1' ? playerName : aiName;
  const isWinner = analysis.predictedWinner === 'player1';

  // Get heroes for a lane
  const getLaneHeroes = (slots: DraftSlot[], positions: Position[]) =>
    slots.filter(s => s.hero && positions.includes(s.position)).map(s => s.hero!);

  return (
    <div className="fixed inset-0 z-50 bg-[#050810] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        {/* INTRO */}
        {stage === 'intro' && (
          <div className="text-center space-y-6" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div className="text-xs font-body text-slate-500 uppercase tracking-[0.4em]">Solo Draft</div>
            <div className="font-display text-6xl sm:text-8xl font-black text-white" style={{ animation: 'scaleIn 0.6s ease-out' }}>
              БИТВА
            </div>
            <div className="text-lg font-body text-slate-400" style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}>
              Анализируем драфты по линиям...
            </div>
          </div>
        )}

        {/* VERSUS */}
        {stage === 'versus' && (
          <div className="flex items-center justify-center gap-4 sm:gap-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div className="text-center flex-1" style={{ animation: 'slideFromLeft 0.5s ease-out' }}>
              <div className="text-emerald-400 font-display text-xl font-bold mb-4 uppercase tracking-wider">{playerName}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {p1Slots.map((s, i) => (
                  <div key={i} className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    style={{ animation: `popIn 0.3s ease-out ${i * 0.1}s both` }}>
                    <img src={s.hero!.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0" style={{ animation: 'vsSlam 0.4s ease-out 0.5s both' }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-dota-gold/20 to-purple-500/20 border-2 border-dota-gold/40 flex items-center justify-center shadow-2xl shadow-dota-gold/20">
                <span className="font-display text-2xl sm:text-3xl font-black text-dota-gold">VS</span>
              </div>
            </div>
            <div className="text-center flex-1" style={{ animation: 'slideFromRight 0.5s ease-out' }}>
              <div className="text-purple-400 font-display text-xl font-bold mb-4 uppercase tracking-wider">{aiName}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {p2Slots.map((s, i) => (
                  <div key={i} className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-lg shadow-purple-500/10"
                    style={{ animation: `popIn 0.3s ease-out ${i * 0.1}s both` }}>
                    <img src={s.hero!.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LANE BATTLES */}
        {(stage === 'lane_safe' || stage === 'lane_mid' || stage === 'lane_off') && (
          <div className="space-y-6" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="text-center mb-8">
              <span className="font-display text-3xl font-bold text-dota-gold uppercase tracking-wider">
                {LANE_NAMES[stage]}
              </span>
              <div className="w-40 h-1 bg-gradient-to-r from-transparent via-dota-gold/50 to-transparent mx-auto mt-2" />
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-12">
              {/* Player heroes */}
              <div className="flex flex-col items-center gap-3" style={{ animation: 'slideFromLeft 0.5s ease-out' }}>
                {getLaneHeroes(playerSlots, LANE_POSITIONS[stage]).map((hero, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
                      style={{ animation: `popIn 0.4s ease-out ${i * 0.2}s both` }}>
                      <img src={hero.img} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-body font-bold text-emerald-400 hidden sm:block">{hero.localized_name}</span>
                  </div>
                ))}
              </div>

              {/* Battle indicator */}
              <div className="flex flex-col items-center gap-2" style={{ animation: 'vsSlam 0.3s ease-out 0.3s both' }}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                  laneResult[stage] === 'team1' ? 'bg-emerald-500/15 border-emerald-500/40' :
                  laneResult[stage] === 'team2' ? 'bg-purple-500/15 border-purple-500/40' :
                  'bg-white/5 border-white/20'
                }`}>
                  <span className="text-3xl">
                    {laneResult[stage] === 'team1' ? '✅' : laneResult[stage] === 'team2' ? '❌' : '🤝'}
                  </span>
                </div>
                <span className={`text-xs font-body font-bold ${
                  laneResult[stage] === 'team1' ? 'text-emerald-400' :
                  laneResult[stage] === 'team2' ? 'text-purple-400' :
                  'text-slate-400'
                }`}>
                  {laneResult[stage] === 'team1' ? 'Твоё преимущество!' :
                   laneResult[stage] === 'team2' ? 'Преимущество AI' :
                   'Равная линия'}
                </span>
              </div>

              {/* AI heroes */}
              <div className="flex flex-col items-center gap-3" style={{ animation: 'slideFromRight 0.5s ease-out' }}>
                {getLaneHeroes(aiSlots, LANE_POSITIONS[stage]).map((hero, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-body font-bold text-purple-400 hidden sm:block">{hero.localized_name}</span>
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-lg shadow-purple-500/20"
                      style={{ animation: `popIn 0.4s ease-out ${i * 0.2}s both` }}>
                      <img src={hero.img} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lane reason text */}
            {analysis?.laneBreakdown && (
              <div className="text-center mt-4" style={{ animation: 'fadeIn 0.5s ease-out 0.5s both' }}>
                <span className="text-sm font-body text-slate-400 italic">
                  {analysis.laneBreakdown.find(l =>
                    (stage === 'lane_safe' && l.lane.includes('Лёгкая')) ||
                    (stage === 'lane_mid' && l.lane.includes('Мид')) ||
                    (stage === 'lane_off' && l.lane.includes('Сложная'))
                  )?.reason || ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ANALYZING */}
        {stage === 'analyzing' && (
          <div className="text-center space-y-6" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-dota-gold/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-dota-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg font-bold text-dota-gold">AI</span>
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white">Финальный анализ...</div>
            <div className="text-sm font-body text-slate-400">Матчапы · Синергии · Линии · Контрпики</div>
          </div>
        )}

        {/* REVEAL */}
        {stage === 'reveal' && analysis && (
          <div className="text-center space-y-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ animation: 'dropIn 0.5s ease-out' }}>
              <div className="text-6xl mb-2">{isWinner ? '👑' : '⚔️'}</div>
              <div className={`font-display text-5xl sm:text-7xl font-black tracking-tight ${isWinner ? 'text-dota-gold' : 'text-purple-400'}`}
                style={{ animation: 'scaleIn 0.4s ease-out 0.2s both', textShadow: isWinner ? '0 0 60px rgba(218,165,32,0.3)' : '0 0 60px rgba(168,85,247,0.3)' }}>
                {isWinner ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
              </div>
              <div className="font-body text-lg text-slate-300 mt-3" style={{ animation: 'fadeIn 0.5s ease-out 0.5s both' }}>
                {winnerName} побеждает в драфте
              </div>
            </div>

            {/* Score bar */}
            <div className="max-w-md mx-auto" style={{ animation: 'fadeIn 0.5s ease-out 0.8s both' }}>
              <div className="flex justify-between mb-2">
                <span className="font-body text-sm font-bold text-emerald-400">{playerName} — {analysis.player1Score}%</span>
                <span className="font-body text-sm font-bold text-purple-400">{analysis.player2Score}% — {aiName}</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 rounded-l-full" style={{ width: `${analysis.player1Score}%` }} />
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-1000 rounded-r-full" style={{ width: `${analysis.player2Score}%` }} />
              </div>
            </div>

            <div className="text-sm font-body text-slate-500 mt-4" style={{ animation: 'fadeIn 0.5s ease-out 1.5s both' }}>
              Переход к результатам...
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideFromLeft { from { transform: translateX(-80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideFromRight { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes vsSlam { from { transform: scale(3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes dropIn { from { transform: translateY(-40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
