import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToRoom, updateRoom, deleteRoom, saveMatchResult, updateUserStats } from '@/firebase';
import { ALL_HEROES } from '@/data/heroes';
import { analyzeDraft } from '@/data/matchups';
import { getAttrColor } from '@/lib/utils';
import type { Hero, Position, DraftSlot } from '@/types';
import type { RoomInfo } from './DraftPage';
import { POSITION_LABELS } from '@/types';
import { Search, X, Ban, Clock, Shield, Swords } from 'lucide-react';

interface Props {
  roomInfo: RoomInfo;
  onGameEnd: (data: any) => void;
  onLeave: () => void;
}

export function DraftGame({ roomInfo, onGameEnd, onLeave }: Props) {
  const { user } = useAuth();
  const { roomId, playerId } = roomInfo;
  const [roomData, setRoomData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [attrFilter, setAttrFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, (data) => {
      if (!data) return;
      setRoomData(data);

      // Check if all picks are done
      if (data.phase === 'pick') {
        const p1Picks = data.player1?.slots?.filter((s: any) => s.hero !== null).length || 0;
        const p2Picks = data.player2?.slots?.filter((s: any) => s.hero !== null).length || 0;

        if (p1Picks >= 5 && p2Picks >= 5 && !data.analysis) {
          // Both teams full → analyze
          const analysis = analyzeDraft(
            data.player1.slots,
            data.player2.slots,
            data.player1.name,
            data.player2.name
          );

          const winner = analysis.predictedWinner;

          updateRoom(roomId, {
            phase: 'result',
            analysis,
            winner,
            currentTurn: null,
          });

          // Save match result
          if (user) {
            saveMatchResult({
              roomId,
              player1Uid: data.player1.uid,
              player1Name: data.player1.name,
              player2Uid: data.player2.uid,
              player2Name: data.player2.name,
              player1Slots: data.player1.slots,
              player2Slots: data.player2.slots,
              winner,
              analysis,
            });

            // Update stats
            const isP1 = playerId === 'player1';
            if (winner === 'draw') {
              updateUserStats(user.uid, 'draw');
            } else if ((winner === 'player1' && isP1) || (winner === 'player2' && !isP1)) {
              updateUserStats(user.uid, 'win');
            } else {
              updateUserStats(user.uid, 'loss');
            }
          }
        }
      }

      // Navigate to results if phase changes
      if (data.phase === 'result' && data.analysis) {
        onGameEnd(data);
      }
    });

    return unsub;
  }, [roomId]);

  const phase = roomData?.phase || 'ban';
  const isMyTurn = roomData?.currentTurn === playerId;
  const myData = roomData?.[playerId];
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';
  const opponentData = roomData?.[opponentId];

  // Get all used heroes (banned + picked)
  const usedHeroIds = useMemo(() => {
    if (!roomData) return new Set<number>();
    const ids = new Set<number>();
    const bans1 = roomData.player1?.bans || [];
    const bans2 = roomData.player2?.bans || [];
    const slots1 = roomData.player1?.slots || [];
    const slots2 = roomData.player2?.slots || [];

    bans1.forEach((h: any) => h && ids.add(h.id));
    bans2.forEach((h: any) => h && ids.add(h.id));
    slots1.forEach((s: any) => s.hero && ids.add(s.hero.id));
    slots2.forEach((s: any) => s.hero && ids.add(s.hero.id));

    return ids;
  }, [roomData]);

  // Filter heroes
  const filteredHeroes = useMemo(() => {
    return ALL_HEROES.filter(h => {
      if (usedHeroIds.has(h.id)) return false;
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter !== 'all' && h.primary_attr !== attrFilter) return false;
      return true;
    });
  }, [search, attrFilter, usedHeroIds]);

  const handleBan = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'ban') return;

    const myBans = [...(myData?.bans || []), hero];
    const totalBans = (roomData.player1?.bans?.length || 0) + (roomData.player2?.bans?.length || 0) + 1;
    const maxBans = (roomData.banCount || 2) * 2;

    const updates: any = {
      [`${playerId}/bans`]: myBans,
      currentTurn: opponentId,
      turnNumber: (roomData.turnNumber || 0) + 1,
    };

    // If all bans done, switch to pick phase
    if (totalBans >= maxBans) {
      updates.phase = 'pick';
      updates.currentTurn = 'player1';
      updates.turnNumber = 1;
    }

    await updateRoom(roomId, updates);
  };

  const handlePick = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'pick' || selectedPosition === null) return;

    const newSlots = [...(myData?.slots || [])];
    const idx = newSlots.findIndex((s: DraftSlot) => s.position === selectedPosition);
    if (idx === -1 || newSlots[idx].hero !== null) return;

    newSlots[idx] = { position: selectedPosition, hero };

    const updates: any = {
      [`${playerId}/slots`]: newSlots,
      currentTurn: opponentId,
      turnNumber: (roomData.turnNumber || 0) + 1,
    };

    await updateRoom(roomId, updates);
    setSelectedPosition(null);
  };

  const handleHeroClick = (hero: Hero) => {
    if (!isMyTurn) return;
    if (phase === 'ban') handleBan(hero);
    else if (phase === 'pick' && selectedPosition !== null) handlePick(hero);
  };

  if (!roomData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Clock className="w-8 h-8 text-dota-gold animate-spin mx-auto mb-4" />
          <p className="font-body text-slate-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-body text-sm font-bold ${
            phase === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'
          }`}>
            {phase === 'ban' ? (
              <span className="flex items-center gap-2"><Ban className="w-4 h-4" /> Фаза банов</span>
            ) : (
              <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Фаза пиков</span>
            )}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-body font-bold ${
            isMyTurn ? 'bg-dota-gold/15 text-dota-gold animate-pulse' : 'bg-slate-800 text-slate-500'
          }`}>
            {isMyTurn ? 'Твой ход!' : 'Ход соперника...'}
          </div>
        </div>
        <button onClick={onLeave} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm font-body hover:bg-slate-700">
          Выйти
        </button>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
        {/* My team */}
        <TeamPanel
          label="Твоя команда"
          player={myData}
          isMe
          phase={phase}
          selectedPosition={selectedPosition}
          onSelectPosition={setSelectedPosition}
        />

        {/* VS */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-dota-card border-2 border-dota-border flex items-center justify-center">
            <Swords className="w-6 h-6 text-dota-gold" />
          </div>
        </div>

        {/* Opponent */}
        <TeamPanel
          label="Соперник"
          player={opponentData}
          phase={phase}
        />
      </div>

      {/* Bans display */}
      {(roomData.player1?.bans?.length > 0 || roomData.player2?.bans?.length > 0) && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-dota-card/50 border border-dota-border/50">
          <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {[...(roomData.player1?.bans || []), ...(roomData.player2?.bans || [])].map((h: Hero, i: number) => (
              h && (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                  <img src={h.icon} alt={h.localized_name} className="w-5 h-5 rounded" />
                  <span className="text-xs font-body text-red-400 line-through">{h.localized_name}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Pick instruction */}
      {phase === 'pick' && isMyTurn && selectedPosition === null && (
        <div className="p-3 rounded-xl bg-dota-gold/10 border border-dota-gold/20 text-center">
          <span className="text-sm font-body text-dota-gold">
            Выбери позицию в своей команде, затем выбери героя
          </span>
        </div>
      )}

      {/* Hero grid */}
      <div className="rounded-2xl bg-dota-card border border-dota-border p-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск героя..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dota-bg border border-dota-border text-white font-body text-sm placeholder:text-slate-600 focus:border-dota-accent/50 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {['all', 'str', 'agi', 'int'].map(attr => (
              <button
                key={attr}
                onClick={() => setAttrFilter(attr)}
                className={`px-3 py-2 rounded-lg text-xs font-body font-bold transition-colors ${
                  attrFilter === attr
                    ? attr === 'all'
                      ? 'bg-white/10 text-white'
                      : `bg-opacity-20 text-white`
                    : 'bg-dota-bg text-slate-500 hover:text-slate-300'
                }`}
                style={attrFilter === attr && attr !== 'all' ? { backgroundColor: getAttrColor(attr) + '20', color: getAttrColor(attr) } : {}}
              >
                {attr === 'all' ? 'Все' : attr === 'str' ? 'STR' : attr === 'agi' ? 'AGI' : 'INT'}
              </button>
            ))}
          </div>
        </div>

        {/* Heroes grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[400px] overflow-y-auto pr-1">
          {filteredHeroes.map(hero => {
            const canClick = isMyTurn && (phase === 'ban' || (phase === 'pick' && selectedPosition !== null));
            return (
              <button
                key={hero.id}
                onClick={() => handleHeroClick(hero)}
                disabled={!canClick}
                className={`group relative rounded-lg overflow-hidden border transition-all ${
                  canClick
                    ? 'border-dota-border/50 hover:border-dota-gold/50 hover:scale-105 cursor-pointer'
                    : 'border-dota-border/20 opacity-60 cursor-not-allowed'
                }`}
                title={hero.localized_name}
              >
                <img
                  src={hero.img}
                  alt={hero.localized_name}
                  className="w-full aspect-[16/9] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-body text-white leading-none block truncate text-center">
                    {hero.localized_name}
                  </span>
                </div>
                {/* Attr dot */}
                <div
                  className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: getAttrColor(hero.primary_attr) }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== TEAM PANEL ==========
function TeamPanel({
  label,
  player,
  isMe,
  phase,
  selectedPosition,
  onSelectPosition,
}: {
  label: string;
  player: any;
  isMe?: boolean;
  phase: string;
  selectedPosition?: Position | null;
  onSelectPosition?: (p: Position) => void;
}) {
  const slots: DraftSlot[] = player?.slots || [];
  const borderColor = isMe ? 'border-dota-radiant/30' : 'border-dota-dire/30';

  return (
    <div className={`rounded-2xl bg-dota-card border ${borderColor} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${isMe ? 'bg-dota-radiant' : 'bg-dota-dire'}`} />
        <span className="font-body text-sm font-bold text-white">{player?.name || label}</span>
        {isMe && <span className="text-[10px] font-body text-slate-500 ml-auto">(ты)</span>}
      </div>

      <div className="space-y-2">
        {([1, 2, 3, 4, 5] as Position[]).map(pos => {
          const slot = slots.find((s: DraftSlot) => s.position === pos);
          const hero = slot?.hero;
          const isSelected = isMe && selectedPosition === pos;
          const canSelect = isMe && phase === 'pick' && !hero && onSelectPosition;

          return (
            <button
              key={pos}
              onClick={() => canSelect && onSelectPosition?.(pos)}
              disabled={!canSelect}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                hero
                  ? 'bg-dota-bg/50 slot-filled'
                  : isSelected
                  ? 'bg-dota-gold/10 border-2 border-dota-gold/50'
                  : canSelect
                  ? 'slot-empty hover:bg-white/5 cursor-pointer'
                  : 'border border-dota-border/20 bg-dota-bg/20'
              }`}
            >
              {/* Position badge */}
              <div className="w-8 h-8 rounded-lg bg-dota-bg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-mono font-bold text-slate-400">{pos}</span>
              </div>

              {hero ? (
                <>
                  <img src={hero.icon} alt="" className="w-8 h-8 rounded-lg" />
                  <div className="text-left min-w-0">
                    <div className="text-sm font-body font-bold text-white truncate">{hero.localized_name}</div>
                    <div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos as Position]}</div>
                  </div>
                </>
              ) : (
                <div className="text-left">
                  <div className="text-xs font-body text-slate-500">{POSITION_LABELS[pos as Position]}</div>
                  {isSelected && <div className="text-[10px] text-dota-gold">Выбери героя →</div>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
