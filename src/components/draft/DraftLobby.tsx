import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, subscribeToRoom, updateRoom } from '@/firebase';
import { generateRoomId } from '@/lib/utils';
import type { RoomInfo } from './DraftPage';
import { Plus, Users, Copy, Check, Loader2, UserCheck, UserX } from 'lucide-react';

interface Props {
  onStartGame: (info: RoomInfo) => void;
}

export function DraftLobby({ onStartGame }: Props) {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [waitingRoom, setWaitingRoom] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomState, setRoomState] = useState<any>(null);

  // Subscribe to room changes when in waiting room
  useEffect(() => {
    if (!waitingRoom) return;
    const unsub = subscribeToRoom(waitingRoom, (data) => {
      setRoomState(data);
      // Auto-start when both ready
      if (data?.player1?.isReady && data?.player2?.isReady) {
        unsub();
        const isP1 = data.player1.uid === user?.uid;
        // Only creator sets the phase to avoid double-write
        if (isP1) {
          updateRoom(waitingRoom, {
            phase: 'ban',
            currentTurn: 'player1',
            turnNumber: 1,
          });
        }
        // Small delay for player2 so phase is set
        setTimeout(() => {
          onStartGame({ roomId: waitingRoom, playerId: isP1 ? 'player1' : 'player2' });
        }, isP1 ? 0 : 500);
      }
    });
    return unsub;
  }, [waitingRoom, user]);

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
      setIsCreator(true);
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
      const unsub = subscribeToRoom(roomId, async (data) => {
        unsub();

        if (!data) {
          setError('Комната не найдена');
          setLoading(false);
          return;
        }
        if (data.player1?.uid === user.uid) {
          setError('Нельзя подключиться к своей комнате');
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
        setIsCreator(false);
        setLoading(false);
      });
    } catch (err) {
      setError('Ошибка подключения');
      setLoading(false);
    }
  };

  const handleReady = async () => {
    if (!waitingRoom || !user) return;
    const isP1 = roomState?.player1?.uid === user.uid;
    const playerKey = isP1 ? 'player1' : 'player2';

    await updateRoom(waitingRoom, {
      [`${playerKey}/isReady`]: true,
    });
  };

  const copyCode = () => {
    if (waitingRoom) {
      navigator.clipboard.writeText(waitingRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ====== WAITING ROOM VIEW ======
  if (waitingRoom && roomState) {
    const p1 = roomState.player1;
    const p2 = roomState.player2;
    const meReady = isCreator ? p1?.isReady : p2?.isReady;

    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="rounded-2xl bg-dota-card border border-dota-border p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dota-accent/15 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-dota-accent" />
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-2">
            {isCreator ? 'Комната создана' : 'Вы подключились!'}
          </h2>
          <p className="text-sm font-body text-slate-400 mb-6">
            {isCreator ? 'Отправь код другу, чтобы он подключился' : `Комната: ${waitingRoom}`}
          </p>

          {/* Room code */}
          {isCreator && (
            <div className="flex items-center justify-center gap-2 mb-6">
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
          )}

          {/* Players status */}
          <div className="space-y-2 mb-6">
            <PlayerStatus
              name={p1?.name || 'Игрок 1'}
              isReady={p1?.isReady || false}
              connected={true}
              isYou={isCreator}
            />
            <PlayerStatus
              name={p2?.name || 'Ожидание...'}
              isReady={p2?.isReady || false}
              connected={!!p2}
              isYou={!isCreator && !!p2}
            />
          </div>

          {/* Ready button */}
          {p2 && !meReady && (
            <button
              onClick={handleReady}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-dota-radiant to-green-700 text-white font-body font-bold hover:scale-[1.02] transition-transform"
            >
              Готов!
            </button>
          )}

          {meReady && (
            <div className="py-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-sm font-body text-green-400">
                {p1?.isReady && p2?.isReady
                  ? 'Оба готовы! Запускаем...'
                  : 'Ждём готовности соперника...'}
              </span>
            </div>
          )}

          {!p2 && isCreator && (
            <div className="flex items-center justify-center gap-3 py-3">
              <Loader2 className="w-4 h-4 text-dota-gold animate-spin" />
              <span className="text-sm font-body text-slate-400">Ожидание второго игрока...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====== MAIN LOBBY VIEW ======
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

// ====== PLAYER STATUS COMPONENT ======
function PlayerStatus({ name, isReady, connected, isYou }: {
  name: string;
  isReady: boolean;
  connected: boolean;
  isYou: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${
      connected ? 'bg-dota-bg/50' : 'bg-dota-bg/20'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        connected
          ? isReady ? 'bg-green-500/20' : 'bg-dota-gold/20'
          : 'bg-slate-700/50'
      }`}>
        {connected ? (
          isReady ? <UserCheck className="w-4 h-4 text-green-400" /> : <Users className="w-4 h-4 text-dota-gold" />
        ) : (
          <UserX className="w-4 h-4 text-slate-600" />
        )}
      </div>
      <span className={`font-body text-sm flex-1 text-left ${connected ? 'text-white' : 'text-slate-600'}`}>
        {name} {isYou && <span className="text-slate-500">(ты)</span>}
      </span>
      {connected && (
        <span className={`text-xs font-body px-2 py-0.5 rounded ${
          isReady ? 'bg-green-500/15 text-green-400' : 'bg-slate-700 text-slate-400'
        }`}>
          {isReady ? 'Готов' : 'Не готов'}
        </span>
      )}
    </div>
  );
}
