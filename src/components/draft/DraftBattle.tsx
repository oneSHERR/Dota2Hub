import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateRoom, saveMatchResult, updateUserStats } from '@/firebase';
import { analyzeDraft } from '@/data/matchups';
import type { DraftAnalysis } from '@/types';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

interface Props {
  roomData: any;
  playerId: 'player1' | 'player2';
  roomId: string;
  onResult: (data: any) => void;
}

type BattleStage = 'intro' | 'versus' | 'clash' | 'analyzing' | 'reveal';

export function DraftBattle({ roomData, playerId, roomId, onResult }: Props) {
  const { user } = useAuth();
  const [stage, setStage] = useState<BattleStage>('intro');
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [clashIndex, setClashIndex] = useState(0);

  const p1 = roomData.player1;
  const p2 = roomData.player2;
  const p1Slots = toArray(p1?.slots).filter((s: any) => s?.hero);
  const p2Slots = toArray(p2?.slots).filter((s: any) => s?.hero);

  useEffect(() => {
    // Run analysis
    const result = analyzeDraft(
      toArray(p1?.slots),
      toArray(p2?.slots),
      p1?.name || 'Player 1',
      p2?.name || 'Player 2'
    );

    // NEVER allow draw — give slight edge to player with more synergy, or player1
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

    // Animation timeline
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStage('versus'), 1500));
    timers.push(setTimeout(() => setStage('clash'), 3500));

    // Clash through each position matchup
    for (let i = 0; i < 5; i++) {
      timers.push(setTimeout(() => setClashIndex(i), 3500 + i * 800));
    }

    timers.push(setTimeout(() => setStage('analyzing'), 7500));
    timers.push(setTimeout(() => {
      setStage('reveal');

      // Save to Firebase (only player1 writes to avoid duplicates)
      if (playerId === 'player1' && user) {
        updateRoom(roomId, {
          phase: 'result',
          analysis: result,
          winner: result.predictedWinner,
          currentTurn: null,
        });

        saveMatchResult({
          roomId,
          player1Uid: p1.uid,
          player1Name: p1.name,
          player2Uid: p2.uid,
          player2Name: p2.name,
          player1Slots: toArray(p1.slots),
          player2Slots: toArray(p2.slots),
          winner: result.predictedWinner,
          analysis: result,
        });
      }

      // Update stats for current user
      if (user) {
        const isP1 = playerId === 'player1';
        const won = (result.predictedWinner === 'player1' && isP1) || (result.predictedWinner === 'player2' && !isP1);
        updateUserStats(user.uid, won ? 'win' : 'loss');
      }
    }, 9500));

    // Transition to results
    timers.push(setTimeout(() => {
      onResult({ ...roomData, analysis: result, winner: result.predictedWinner, phase: 'result' });
    }, 12000));

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!analysis) return null;

  const winnerName = analysis.predictedWinner === 'player1' ? p1?.name : p2?.name;
  const isWinner = analysis.predictedWinner === playerId;

  return (
    <div className="fixed inset-0 z-50 bg-[#050810] flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, #050810 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">

        {/* STAGE: INTRO — Team names fly in */}
        {stage === 'intro' && (
          <div className="text-center space-y-6" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div className="text-xs font-body text-slate-500 uppercase tracking-[0.4em]">Draft Arena</div>
            <div className="font-display text-6xl sm:text-8xl font-black text-white" style={{ animation: 'scaleIn 0.6s ease-out' }}>
              БИТВА
            </div>
            <div className="text-lg font-body text-slate-400" style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}>
              Анализируем драфты...
            </div>
          </div>
        )}

        {/* STAGE: VERSUS — Show both teams */}
        {stage === 'versus' && (
          <div className="flex items-center justify-center gap-4 sm:gap-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* Team 1 */}
            <div className="text-center flex-1" style={{ animation: 'slideFromLeft 0.5s ease-out' }}>
              <div className="text-emerald-400 font-display text-xl font-bold mb-4 uppercase tracking-wider">{p1?.name}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {p1Slots.map((s: any, i: number) => (
                  <div key={i} className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    style={{ animation: `popIn 0.3s ease-out ${i * 0.1}s both` }}>
                    <img src={s.hero.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="flex-shrink-0" style={{ animation: 'vsSlam 0.4s ease-out 0.5s both' }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-dota-gold/20 to-dota-accent/20 border-2 border-dota-gold/40 flex items-center justify-center shadow-2xl shadow-dota-gold/20">
                <span className="font-display text-2xl sm:text-3xl font-black text-dota-gold">VS</span>
              </div>
            </div>

            {/* Team 2 */}
            <div className="text-center flex-1" style={{ animation: 'slideFromRight 0.5s ease-out' }}>
              <div className="text-red-400 font-display text-xl font-bold mb-4 uppercase tracking-wider">{p2?.name}</div>
              <div className="flex flex-wrap justify-center gap-2">
                {p2Slots.map((s: any, i: number) => (
                  <div key={i} className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 border-red-500/30 shadow-lg shadow-red-500/10"
                    style={{ animation: `popIn 0.3s ease-out ${i * 0.1}s both` }}>
                    <img src={s.hero.img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAGE: CLASH — Position-by-position matchup */}
        {stage === 'clash' && (
          <div className="space-y-3" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div className="text-center mb-6">
              <span className="font-display text-2xl font-bold text-dota-gold uppercase tracking-wider">Столкновение на линиях</span>
            </div>
            {[0, 1, 2, 3, 4].map(i => {
              const h1 = p1Slots[i]?.hero;
              const h2 = p2Slots[i]?.hero;
              if (!h1 || !h2) return null;
              const visible = i <= clashIndex;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ backgroundColor: visible ? 'rgba(255,255,255,0.03)' : 'transparent', transitionDelay: `${i * 0.1}s` }}>
                  {/* Hero 1 */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-body font-bold text-emerald-400 truncate">{h1.localized_name}</span>
                    <img src={h1.icon} alt="" className="w-10 h-10 rounded-xl border border-emerald-500/30" />
                  </div>
                  {/* Position badge */}
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-dota-border/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-dota-gold">{i + 1}</span>
                  </div>
                  {/* Hero 2 */}
                  <div className="flex items-center gap-2 flex-1">
                    <img src={h2.icon} alt="" className="w-10 h-10 rounded-xl border border-red-500/30" />
                    <span className="text-sm font-body font-bold text-red-400 truncate">{h2.localized_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STAGE: ANALYZING — spinning/loading */}
        {stage === 'analyzing' && (
          <div className="text-center space-y-6" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-dota-gold/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-dota-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-t-dota-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-lg font-bold text-dota-gold">AI</span>
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-white">Анализ драфта...</div>
            <div className="text-sm font-body text-slate-400">Матчапы · Синергии · Линии</div>
          </div>
        )}

        {/* STAGE: REVEAL — Winner announcement */}
        {stage === 'reveal' && analysis && (
          <div className="text-center space-y-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            {/* Winner crown */}
            <div style={{ animation: 'dropIn 0.5s ease-out' }}>
              <div className="text-6xl mb-2">{isWinner ? '👑' : '⚔️'}</div>
              <div className={`font-display text-5xl sm:text-7xl font-black tracking-tight ${isWinner ? 'text-dota-gold' : 'text-red-400'}`}
                style={{ animation: 'scaleIn 0.4s ease-out 0.2s both', textShadow: isWinner ? '0 0 60px rgba(218,165,32,0.3)' : '0 0 60px rgba(239,68,68,0.3)' }}>
                {isWinner ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
              </div>
              <div className="font-body text-lg text-slate-300 mt-3" style={{ animation: 'fadeIn 0.5s ease-out 0.5s both' }}>
                {winnerName} побеждает в драфте
              </div>
            </div>

            {/* Score bar */}
            <div className="max-w-md mx-auto" style={{ animation: 'fadeIn 0.5s ease-out 0.8s both' }}>
              <div className="flex justify-between mb-2">
                <span className="font-body text-sm font-bold text-emerald-400">{p1?.name} — {analysis.player1Score}%</span>
                <span className="font-body text-sm font-bold text-red-400">{analysis.player2Score}% — {p2?.name}</span>
              </div>
              <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 duration-1000 rounded-l-full" style={{ width: `${analysis.player1Score}%` }} />
                <div className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-300 duration-1000 rounded-r-full" style={{ width: `${analysis.player2Score}%` }} />
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
