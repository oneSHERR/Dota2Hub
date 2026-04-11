import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import {
  Gamepad2, Trophy, Zap, Target, Swords, Star, ChevronRight
} from 'lucide-react';

import { type GameId, type MiniGameScore, saveScore } from './shared';
import { WhoStrongerGame } from './WhoStrongerGame';
import { DraftPuzzleGame } from './DraftPuzzleGame';
import { InvokerComboGame } from './InvokerComboGame';

// ============================================================
// GAME DEFINITIONS (3 games)
// ============================================================
const GAMES = [
  { id: 'who-stronger' as GameId, title: 'Кто сильнее?', desc: '1v1 матчап — кто победит на линии?', icon: Swords, color: 'from-red-500 to-orange-600', glow: 'shadow-red-500/30', difficulty: 'Средне' },
  { id: 'draft-puzzle' as GameId, title: 'Draft Puzzle', desc: 'Подбери идеального 5-го героя в команду', icon: Target, color: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/30', difficulty: 'Средне' },
  { id: 'invoker-combo' as GameId, title: 'Инвокер', desc: 'Тренажёр комбинаций — Q W E → Invoke → Cast', icon: Zap, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/30', difficulty: 'Сложно' },
];

// ============================================================
// MAIN PAGE
// ============================================================
export function MiniGamesPage() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<GameId>('hub');
  const [scores, setScores] = useState<Record<string, MiniGameScore>>({});
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = onValue(ref(db, `miniGameScores/${user.uid}`), (snap) => {
      const data = snap.val() || {};
      setScores(data);
      setTotalScore(Object.values(data).reduce((sum: number, g: any) => sum + (g.score || 0), 0));
    });
    return () => unsub();
  }, [user]);

  const handleSave = useCallback(async (gameId: string, score: number, combo: number) => {
    if (!user) return;
    await saveScore(user.uid, gameId, score, combo);
  }, [user]);

  const goBack = () => setActiveGame('hub');

  if (activeGame === 'hub') {
    return <GameHub scores={scores} totalScore={totalScore} onSelect={setActiveGame} user={user} />;
  }

  const gameMap: Record<string, React.FC<any>> = {
    'who-stronger': WhoStrongerGame,
    'draft-puzzle': DraftPuzzleGame,
    'invoker-combo': InvokerComboGame,
  };

  const GameComponent = gameMap[activeGame];
  if (!GameComponent) return null;

  return (
    <div className="min-h-screen">
      <GameComponent onBack={goBack} onSave={handleSave} user={user} bestScore={scores[activeGame]?.score || 0} />
    </div>
  );
}

// ============================================================
// HUB
// ============================================================
function GameHub({ scores, totalScore, onSelect, user }: {
  scores: Record<string, MiniGameScore>;
  totalScore: number;
  onSelect: (id: GameId) => void;
  user: any;
}) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onValue(ref(db, 'users'), (snap) => {
      const data = snap.val();
      if (!data) return;
      const list = Object.entries(data)
        .filter(([_, u]: any) => u.miniGameScore > 0)
        .map(([uid, u]: any) => ({ uid, name: u.displayName, score: u.miniGameScore || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      setLeaderboard(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">Мини-игры</h1>
            <p className="text-sm font-body text-slate-400">Тренируйся и соревнуйся с друзьями</p>
          </div>
        </div>
        {user && (
          <div className="hidden sm:flex items-center gap-3 px-5 py-3 rounded-xl bg-dota-card border border-dota-border">
            <Trophy className="w-5 h-5 text-dota-gold" />
            <div>
              <div className="text-xs text-slate-500 font-body">Общий счёт</div>
              <div className="text-xl font-display font-bold text-dota-gold">{totalScore.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile score */}
      {user && (
        <div className="sm:hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-dota-card border border-dota-border mb-6">
          <Trophy className="w-5 h-5 text-dota-gold" />
          <span className="text-sm text-slate-400 font-body">Общий счёт:</span>
          <span className="text-lg font-display font-bold text-dota-gold ml-auto">{totalScore.toLocaleString()}</span>
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {GAMES.map((game) => {
          const Icon = game.icon;
          const gameScore = scores[game.id];
          return (
            <button key={game.id} onClick={() => onSelect(game.id)}
              className={`group relative overflow-hidden rounded-2xl bg-dota-card/80 border border-dota-border/50 p-6 text-left hover:border-white/15 transition-all duration-300 shadow-xl ${game.glow} hover:shadow-2xl hover:translate-y-[-4px]`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-[10px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                  game.difficulty === 'Средне' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'
                }`}>{game.difficulty}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">{game.title}</h3>
              <p className="text-xs font-body text-slate-500 leading-relaxed mb-4">{game.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-dota-border/30">
                {gameScore ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-dota-gold" />
                      <span className="text-sm font-display font-bold text-dota-gold">{gameScore.score}</span>
                    </div>
                    <span className="text-[10px] font-body text-slate-600">Игр: {gameScore.gamesPlayed}</span>
                  </>
                ) : (
                  <span className="text-[10px] font-body text-slate-600">Ещё не играл</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${game.color} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
            </button>
          );
        })}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="rounded-2xl bg-dota-card/80 border border-dota-border/50 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="w-5 h-5 text-dota-gold" />
            <h2 className="font-display text-xl font-bold text-white">Таблица лидеров</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div key={entry.uid} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${
                user?.uid === entry.uid ? 'bg-dota-gold/10 border border-dota-gold/20' : 'bg-dota-bg/50'
              } transition-colors`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                  i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white' :
                  i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-800 text-white' :
                  'bg-dota-border text-slate-400'
                }`}>{i + 1}</div>
                <span className="font-body text-sm text-white flex-1">{entry.name}</span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-dota-gold" />
                  <span className="font-display font-bold text-dota-gold">{entry.score.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
