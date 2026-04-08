import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, subscribeToRoom, updateRoom } from '@/firebase';
import { generateRoomId } from '@/lib/utils';
import type { RoomInfo } from './DraftPage';
import { Plus, Users, Copy, Check, Loader2 } from 'lucide-react';

interface Props {
  onStartGame: (info: RoomInfo) => void;
}

export function DraftLobby({ onStartGame }: Props) {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [waitingRoom, setWaitingRoom] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    const roomId = generateRoomId();
    const roomData = {
      roomId,
      phase: 'lobby',
      player1: {
        uid: user.uid,
        name: user.displayName || 'Player 1',
        isReady: false,
        slots: [
          { position: 1, hero: null },
          { position: 2, hero: null },
          { position: 3, hero: null },
          { position: 4, hero: null },
          { position: 5, hero: null },
        ],
        bans: [],
      },
      player2: null,
      currentTurn: null,
      turnNumber: 0,
      banCount: 2,
      timer: 30,
      winner: null,
      analysis: null,
      createdAt: Date.now(),
    };

    try {
      await createRoom(roomId, roomData);
      setWaitingRoom(roomId);

      // Subscribe to room for when player2 joins
      const unsub = subscribeToRoom(roomId, (data) => {
        if (data?.player2 && data?.player1?.isReady && data?.player2?.isReady) {
          unsub();
          onStartGame({ roomId, playerId: 'player1' });
        }
      });
    } catch (err) {
      setError('Не удалось создать комнату');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');

    const roomId = joinCode.trim().toUpperCase();

    try {
      // Check room exists by subscribing once
      const unsub = subscribeToRoom(roomId, async (data) => {
        unsub();

        if (!data) {
          setError('Комната не найдена');
          setLoading(false);
          return;
        }
        if (data.player2) {
          setError('Комната уже заполнена');
          setLoading(false);
          return;
        }

        await updateRoom(roomId, {
          player2: {
            uid: user.uid,
            name: user.displayName || 'Player 2',
            isReady: false,
            slots: [
              { position: 1, hero: null },
              { position: 2, hero: null },
              { position: 3, hero: null },
              { position: 4, hero: null },
              { position: 5, hero: null },
            ],
            bans: [],
          },
        });

        setWaitingRoom(roomId);
        setLoading(false);

        // Subscribe for ready state
        const unsub2 = subscribeToRoom(roomId, (d) => {
          if (d?.player1?.isReady && d?.player2?.isReady) {
            unsub2();
            onStartGame({ roomId, playerId: 'player2' });
          }
        });
      });
    } catch (err) {
      setError('Ошибка подключения');
      setLoading(false);
    }
  };

  const handleReady = async () => {
    if (!waitingRoom || !user) return;

    const unsub = subscribeToRoom(waitingRoom, async (data) => {
      unsub();
      const isP1 = data?.player1?.uid === user.uid;
      const playerKey = isP1 ? 'player1' : 'player2';

      await updateRoom(waitingRoom, {
        [`${playerKey}/isReady`]: true,
      });

      // Check if both ready → start
      const unsub2 = subscribeToRoom(waitingRoom, (d) => {
        if (d?.player1?.isReady && d?.player2?.isReady) {
          unsub2();
          // First player to detect both ready sets the phase
          updateRoom(waitingRoom, {
            phase: 'ban',
            currentTurn: 'player1',
            turnNumber: 1,
          });
          onStartGame({ roomId: waitingRoom, playerId: isP1 ? 'player1' : 'player2' });
        }
      });
    });
  };

  const copyCode = () => {
    if (waitingRoom) {
      navigator.clipboard.writeText(waitingRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Waiting room view
  if (waitingRoom) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="rounded-2xl bg-dota-card border border-dota-border p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dota-accent/15 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-dota-accent" />
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-2">Комната создана</h2>
          <p className="text-sm font-body text-slate-400 mb-6">Отправь код другу, чтобы он подключился</p>

          {/* Room code */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="px-6 py-3 rounded-xl bg-dota-bg border border-dota-border">
              <span className="font-mono text-3xl font-bold text-dota-gold tracking-[0.3em]">
                {waitingRoom}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="p-3 rounded-xl bg-dota-bg border border-dota-border hover:border-dota-gold/30 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader2 className="w-4 h-4 text-dota-gold animate-spin" />
            <span className="text-sm font-body text-slate-400">Ожидание второго игрока...</span>
          </div>

          <button
            onClick={handleReady}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-dota-radiant to-green-700 text-white font-body font-bold hover:scale-[1.02] transition-transform"
          >
            Готов!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold gradient-text mb-3">Draft Arena</h1>
        <p className="text-sm font-body text-slate-400">
          Создай комнату или подключись к другу. Выбирайте героев по позициям и сражайтесь!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="group rounded-2xl bg-dota-card border border-dota-border p-8 text-center hover:border-dota-accent/30 hover:shadow-xl hover:shadow-dota-accent/5 transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dota-accent to-red-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Создать комнату</h3>
          <p className="text-xs font-body text-slate-500">Получи код и отправь другу</p>
        </button>

        {/* Join */}
        <div className="rounded-2xl bg-dota-card border border-dota-border p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-4">Подключиться</h3>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="КОД"
              maxLength={6}
              className="flex-1 px-4 py-3 rounded-xl bg-dota-bg border border-dota-border text-white font-mono text-center text-lg tracking-widest placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none uppercase"
            />
            <button
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-body font-bold text-sm hover:bg-blue-500 disabled:opacity-40 transition-colors"
            >
              Войти
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <span className="text-sm font-body text-red-400">{error}</span>
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 rounded-2xl bg-dota-card/50 border border-dota-border/50 p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4">Как играть</h3>
        <div className="space-y-3 text-sm font-body text-slate-400">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-dota-accent/20 text-dota-accent flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span>Создай комнату и отправь код другу</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-dota-accent/20 text-dota-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span>Каждый банит по 2 героя</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-dota-accent/20 text-dota-accent flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span>Выбирайте по 5 героев — по одному на каждую позицию (1-5)</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-dota-accent/20 text-dota-accent flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <span>AI анализирует связки, линии и матчапы — определяет победителя</span>
          </div>
        </div>
      </div>
    </div>
  );
}
