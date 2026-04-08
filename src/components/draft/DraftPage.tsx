import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DraftLobby } from './DraftLobby';
import { DraftGame } from './DraftGame';
import { DraftResult } from './DraftResult';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export type DraftView = 'lobby' | 'game' | 'result';

export interface RoomInfo {
  roomId: string;
  playerId: 'player1' | 'player2';
}

export function DraftPage() {
  const { user } = useAuth();
  const [view, setView] = useState<DraftView>('lobby');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
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
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dota-accent text-white font-body font-bold text-sm hover:bg-red-600 transition-colors"
          >
            <LogIn className="w-4 h-4" /> Войти / Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  const handleStartGame = (info: RoomInfo) => {
    setRoomInfo(info);
    setView('game');
  };

  const handleGameEnd = (data: any) => {
    setResultData(data);
    setView('result');
  };

  const handleNewGame = () => {
    setRoomInfo(null);
    setResultData(null);
    setView('lobby');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {view === 'lobby' && <DraftLobby onStartGame={handleStartGame} />}
      {view === 'game' && roomInfo && (
        <DraftGame roomInfo={roomInfo} onGameEnd={handleGameEnd} onLeave={handleNewGame} />
      )}
      {view === 'result' && resultData && (
        <DraftResult data={resultData} onNewGame={handleNewGame} />
      )}
    </div>
  );
}
