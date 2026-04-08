import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DraftLobby } from './DraftLobby';
import { DraftGame } from './DraftGame';
import { DraftBattle } from './DraftBattle';
import { DraftResult } from './DraftResult';
import { SoloDrafter } from './SoloDrafter';
import { Link } from 'react-router-dom';
import { LogIn, Brain, Users } from 'lucide-react';

export type DraftView = 'lobby' | 'game' | 'battle' | 'result' | 'solo' | 'menu';

export interface RoomInfo {
  roomId: string;
  playerId: 'player1' | 'player2';
}

export function DraftPage() {
  const { user } = useAuth();
  const [view, setView] = useState<DraftView>('menu');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [battleData, setBattleData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-dota-card border border-dota-border flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Войди, чтобы играть</h2>
          <p className="text-sm font-body text-slate-400 mb-6">Нужен аккаунт для мультиплеера</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dota-accent text-white font-body font-bold text-sm hover:bg-red-600 transition-colors">
            <LogIn className="w-4 h-4" /> Войти / Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  const handleStartGame = (info: RoomInfo) => { setRoomInfo(info); setView('game'); };

  const handleBattleStart = (data: any) => {
    setBattleData(data);
    setView('battle');
  };

  const handleResult = (data: any) => {
    setResultData(data);
    setView('result');
  };

  const handleNewGame = () => {
    setRoomInfo(null);
    setBattleData(null);
    setResultData(null);
    setView('menu');
  };

  // Mode selection menu
  if (view === 'menu') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-black gradient-text mb-3">DRAFT ARENA</h1>
          <p className="text-sm font-body text-slate-400">Выбери режим игры</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1v1 Mode */}
          <button
            onClick={() => setView('lobby')}
            className="group rounded-2xl bg-[#111827] border border-white/8 p-8 text-center hover:border-emerald-500/20 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">1v1 с другом</h3>
            <p className="text-xs font-body text-slate-500">Создай комнату и сыграй с другом в реальном времени</p>
          </button>

          {/* Solo Mode */}
          <button
            onClick={() => setView('solo')}
            className="group rounded-2xl bg-[#111827] border border-white/8 p-8 text-center hover:border-purple-500/20 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Solo Drafter</h3>
            <p className="text-xs font-body text-slate-500">Драфти против AI и получи детальный анализ</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={view === 'battle' ? '' : 'max-w-7xl mx-auto px-4 py-6'}>
      {view === 'lobby' && <DraftLobby onStartGame={handleStartGame} />}
      {view === 'game' && roomInfo && <DraftGame roomInfo={roomInfo} onBattleStart={handleBattleStart} onLeave={handleNewGame} />}
      {view === 'battle' && battleData && roomInfo && (
        <DraftBattle roomData={battleData} playerId={roomInfo.playerId} roomId={roomInfo.roomId} onResult={handleResult} />
      )}
      {view === 'result' && resultData && <DraftResult data={resultData} onNewGame={handleNewGame} />}
      {view === 'solo' && <SoloDrafter onBack={handleNewGame} />}
    </div>
  );
}
