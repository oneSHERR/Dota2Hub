import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createRoom, subscribeToRoom, updateRoom } from '@/firebase';
import { generateRoomId } from '@/lib/utils';
import type { RoomInfo } from './DraftPage';
import { Plus, Users, Copy, Check, Loader2, UserCheck, UserX } from 'lucide-react';

interface Props { onStartGame: (info: RoomInfo) => void; }

export function DraftLobby({ onStartGame }: Props) {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [waitingRoom, setWaitingRoom] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomState, setRoomState] = useState<any>(null);

  useEffect(() => {
    if (!waitingRoom) return;
    const unsub = subscribeToRoom(waitingRoom, (data) => {
      setRoomState(data);
      if (data?.player1?.isReady && data?.player2?.isReady) {
        unsub();
        const isP1 = data.player1.uid === user?.uid;
        if (isP1) updateRoom(waitingRoom, { phase: 'ban', currentTurn: 'player1', turnNumber: 1 });
        setTimeout(() => onStartGame({ roomId: waitingRoom, playerId: isP1 ? 'player1' : 'player2' }), isP1 ? 0 : 500);
      }
    });
    return unsub;
  }, [waitingRoom, user]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true); setError('');
    const roomId = generateRoomId();
    try {
      await createRoom(roomId, {
        roomId, phase: 'lobby',
        player1: { uid: user.uid, name: user.displayName || 'Player 1', isReady: false, slots: [{ position: 1, hero: null },{ position: 2, hero: null },{ position: 3, hero: null },{ position: 4, hero: null },{ position: 5, hero: null }], bans: [] },
        player2: null, currentTurn: null, turnNumber: 0, banCount: 2, timer: 30, winner: null, analysis: null, createdAt: Date.now(),
      });
      setWaitingRoom(roomId); setIsCreator(true);
    } catch { setError('Не удалось создать комнату'); }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true); setError('');
    const roomId = joinCode.trim().toUpperCase();
    try {
      const unsub = subscribeToRoom(roomId, async (data) => {
        unsub();
        if (!data) { setError('Комната не найдена'); setLoading(false); return; }
        if (data.player1?.uid === user.uid) { setError('Нельзя подключиться к своей комнате'); setLoading(false); return; }
        if (data.player2) { setError('Комната уже заполнена'); setLoading(false); return; }
        await updateRoom(roomId, { player2: { uid: user.uid, name: user.displayName || 'Player 2', isReady: false, slots: [{ position: 1, hero: null },{ position: 2, hero: null },{ position: 3, hero: null },{ position: 4, hero: null },{ position: 5, hero: null }], bans: [] } });
        setWaitingRoom(roomId); setIsCreator(false); setLoading(false);
      });
    } catch { setError('Ошибка подключения'); setLoading(false); }
  };

  const handleReady = async () => {
    if (!waitingRoom || !user) return;
    const isP1 = roomState?.player1?.uid === user.uid;
    await updateRoom(waitingRoom, { [`${isP1 ? 'player1' : 'player2'}/isReady`]: true });
  };

  const copyCode = () => { if (waitingRoom) { navigator.clipboard.writeText(waitingRoom); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  if (waitingRoom && roomState) {
    const p1 = roomState.player1, p2 = roomState.player2;
    const meReady = isCreator ? p1?.isReady : p2?.isReady;
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="rounded-2xl bg-[#111827] border border-white/8 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dota-accent/12 flex items-center justify-center mx-auto mb-6"><Users className="w-8 h-8 text-dota-accent" /></div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">{isCreator ? 'Комната создана' : 'Вы подключились!'}</h2>
          <p className="text-sm font-body text-slate-400 mb-6">{isCreator ? 'Отправь код другу' : `Комната: ${waitingRoom}`}</p>
          {isCreator && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="px-6 py-3 rounded-xl bg-black/30 border border-white/10"><span className="font-mono text-3xl font-bold text-dota-gold tracking-[0.3em]">{waitingRoom}</span></div>
              <button onClick={copyCode} className="p-3 rounded-xl bg-black/30 border border-white/10 hover:border-dota-gold/30 transition-colors">{copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-slate-400" />}</button>
            </div>
          )}
          <div className="space-y-2 mb-6">
            <PlayerStatus name={p1?.name || 'Игрок 1'} isReady={p1?.isReady || false} connected={true} isYou={isCreator} />
            <PlayerStatus name={p2?.name || 'Ожидание...'} isReady={p2?.isReady || false} connected={!!p2} isYou={!isCreator && !!p2} />
          </div>
          {p2 && !meReady && <button onClick={handleReady} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-body font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20">Готов!</button>}
          {meReady && <div className="py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15"><span className="text-sm font-body text-emerald-400">{p1?.isReady && p2?.isReady ? 'Оба готовы! Запуск...' : 'Ждём соперника...'}</span></div>}
          {!p2 && isCreator && <div className="flex items-center justify-center gap-3 py-3"><Loader2 className="w-4 h-4 text-dota-gold animate-spin" /><span className="text-sm font-body text-slate-400">Ожидание второго игрока...</span></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-5xl font-black gradient-text mb-3">DRAFT ARENA</h1>
        <p className="text-sm font-body text-slate-400">1v1 драфт с AI-анализом и анимацией боя</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={handleCreate} disabled={loading} className="group rounded-2xl bg-[#111827] border border-white/8 p-8 text-center hover:border-emerald-500/20 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20"><Plus className="w-7 h-7 text-white" /></div>
          <h3 className="font-display text-xl font-bold text-white mb-2">Создать</h3>
          <p className="text-xs font-body text-slate-500">Получи код и отправь другу</p>
        </button>
        <div className="rounded-2xl bg-[#111827] border border-white/8 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg"><Users className="w-7 h-7 text-white" /></div>
          <h3 className="font-display text-xl font-bold text-white mb-4">Подключиться</h3>
          <div className="flex gap-2">
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="КОД" maxLength={6} className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white font-mono text-center text-lg tracking-widest placeholder:text-slate-700 focus:border-blue-500/40 focus:outline-none uppercase" />
            <button onClick={handleJoin} disabled={loading || !joinCode.trim()} className="px-5 py-3 rounded-xl bg-blue-600 text-white font-body font-bold text-sm hover:bg-blue-500 disabled:opacity-40 transition-colors">Войти</button>
          </div>
        </div>
      </div>
      {error && <div className="mt-4 p-3 rounded-lg bg-red-500/8 border border-red-500/15 text-center"><span className="text-sm font-body text-red-400">{error}</span></div>}
      <div className="mt-10 rounded-2xl bg-white/2 border border-white/5 p-6">
        <h3 className="font-display text-lg font-bold text-white mb-4">Как играть</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {['Создай комнату', 'Забань 2 героя', 'Пикни 5 героев', 'AI определит победу'].map((t, i) => (
            <div key={i}><div className="w-8 h-8 rounded-full bg-dota-gold/10 text-dota-gold flex items-center justify-center mx-auto mb-2 font-mono text-sm font-bold">{i + 1}</div><span className="text-xs font-body text-slate-400">{t}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerStatus({ name, isReady, connected, isYou }: { name: string; isReady: boolean; connected: boolean; isYou: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${connected ? 'bg-white/3' : 'bg-white/1'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${connected ? isReady ? 'bg-emerald-500/15' : 'bg-dota-gold/15' : 'bg-slate-800'}`}>
        {connected ? isReady ? <UserCheck className="w-4 h-4 text-emerald-400" /> : <Users className="w-4 h-4 text-dota-gold" /> : <UserX className="w-4 h-4 text-slate-600" />}
      </div>
      <span className={`font-body text-sm flex-1 text-left ${connected ? 'text-white' : 'text-slate-600'}`}>{name} {isYou && <span className="text-slate-500">(ты)</span>}</span>
      {connected && <span className={`text-[10px] font-body px-2 py-0.5 rounded ${isReady ? 'bg-emerald-500/12 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>{isReady ? 'Готов' : 'Не готов'}</span>}
    </div>
  );
}
