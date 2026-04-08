import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToRoom, updateRoom } from '@/firebase';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor } from '@/lib/utils';
import type { Hero, Position, DraftSlot } from '@/types';
import type { RoomInfo } from './DraftPage';
import { POSITION_LABELS } from '@/types';
import { Search, X, Ban, Clock, Shield, Swords } from 'lucide-react';

interface Props {
  roomInfo: RoomInfo;
  onBattleStart: (data: any) => void;
  onLeave: () => void;
}

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.values(val);
  return [];
}

function countBans(playerData: any): number {
  const bans = toArray(playerData?.bans);
  return bans.filter((b: any) => b && b.id).length;
}

function countPicks(playerData: any): number {
  const slots = toArray(playerData?.slots);
  return slots.filter((s: any) => s && s.hero && s.hero.id).length;
}

export function DraftGame({ roomInfo, onBattleStart, onLeave }: Props) {
  const { user } = useAuth();
  const { roomId, playerId } = roomInfo;
  const [roomData, setRoomData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [attrFilter, setAttrFilter] = useState<string>('all');
  const battleTriggered = useRef(false);

  useEffect(() => {
    const unsub = subscribeToRoom(roomId, (data) => {
      if (!data) return;
      setRoomData(data);

      // Check if both players finished picking (5 heroes each with actual hero data)
      if (data.phase === 'pick' && !battleTriggered.current) {
        console.log('DRAFT UPDATE:', data.phase, 'p1picks:', countPicks(data.player1), 'p2picks:', countPicks(data.player2), 'bans:', countBans(data.player1), countBans(data.player2));
        const p1Picks = countPicks(data.player1);
        const p2Picks = countPicks(data.player2);

        if (p1Picks >= 5 && p2Picks >= 5) {
          battleTriggered.current = true;
          // Only player1 writes phase change
          if (playerId === 'player1') {
            updateRoom(roomId, { phase: 'battle', currentTurn: null });
          }
          // Both players transition to battle
          setTimeout(() => onBattleStart(data), 300);
        }
      }

      if (data.phase === 'battle' && !battleTriggered.current) {
        battleTriggered.current = true;
        onBattleStart(data);
      }
    });
    return unsub;
  }, [roomId, playerId]);

  const phase = roomData?.phase || 'ban';
  const isMyTurn = roomData?.currentTurn === playerId;
  const myData = roomData?.[playerId];
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';
  const opponentData = roomData?.[opponentId];

  // All used hero IDs (banned + picked)
  const usedHeroIds = useMemo(() => {
    if (!roomData) return new Set<number>();
    const ids = new Set<number>();
    toArray(roomData.player1?.bans).forEach((h: any) => { if (h?.id) ids.add(h.id); });
    toArray(roomData.player2?.bans).forEach((h: any) => { if (h?.id) ids.add(h.id); });
    toArray(roomData.player1?.slots).forEach((s: any) => { if (s?.hero?.id) ids.add(s.hero.id); });
    toArray(roomData.player2?.slots).forEach((s: any) => { if (s?.hero?.id) ids.add(s.hero.id); });
    return ids;
  }, [roomData]);

  // Filter and sort heroes
  const filteredHeroes = useMemo(() => {
    const order: Record<string, number> = { str: 0, agi: 1, int: 2, all: 3 };
    return ALL_HEROES
      .filter(h => {
        if (usedHeroIds.has(h.id)) return false;
        if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (attrFilter === 'all') return true;
        if (attrFilter === 'uni') return h.primary_attr === 'all';
        return h.primary_attr === attrFilter;
      })
      .sort((a, b) => {
        const ao = order[a.primary_attr] ?? 4;
        const bo = order[b.primary_attr] ?? 4;
        return ao !== bo ? ao - bo : a.localized_name.localeCompare(b.localized_name);
      });
  }, [search, attrFilter, usedHeroIds]);

  // BAN handler
  const handleBan = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'ban') return;

    const currentBans = toArray(myData?.bans).filter((b: any) => b && b.id);
    const newBans = [...currentBans, { id: hero.id, name: hero.name, localized_name: hero.localized_name, img: hero.img, icon: hero.icon, primary_attr: hero.primary_attr, attack_type: hero.attack_type, roles: hero.roles, legs: hero.legs }];

    // Count total bans AFTER this ban
    const myBansAfter = newBans.length;
    const oppBans = countBans(roomData[opponentId]);
    const totalAfter = myBansAfter + oppBans;
    const maxBans = (roomData.banCount || 2) * 2; // 2 per player = 4 total

    const updates: any = {
      [`${playerId}/bans`]: newBans,
    };

    if (totalAfter >= maxBans) {
      // All bans done → switch to pick phase
      updates.phase = 'pick';
      updates.currentTurn = 'player1';
      updates.turnNumber = 1;
    } else {
      // Next player's turn to ban
      updates.currentTurn = opponentId;
      updates.turnNumber = (roomData.turnNumber || 0) + 1;
    }

    await updateRoom(roomId, updates);
  };

  // PICK handler
  const handlePick = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'pick' || selectedPosition === null) return;

    const currentSlots = toArray(myData?.slots);
    const newSlots = currentSlots.map((s: any) => {
      if (s && s.position === selectedPosition && !s.hero) {
        return { position: selectedPosition, hero: { id: hero.id, name: hero.name, localized_name: hero.localized_name, img: hero.img, icon: hero.icon, primary_attr: hero.primary_attr, attack_type: hero.attack_type, roles: hero.roles, legs: hero.legs } };
      }
      return s;
    });

    await updateRoom(roomId, {
      [`${playerId}/slots`]: newSlots,
      currentTurn: opponentId,
      turnNumber: (roomData.turnNumber || 0) + 1,
    });
    setSelectedPosition(null);
  };

  const handleHeroClick = (hero: Hero) => {
    if (!isMyTurn) return;
    if (phase === 'ban') handleBan(hero);
    else if (phase === 'pick' && selectedPosition !== null) handlePick(hero);
  };

  if (!roomData) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Clock className="w-8 h-8 text-dota-gold animate-spin mx-auto" /></div>;
  }

  const allBans = [...toArray(roomData.player1?.bans), ...toArray(roomData.player2?.bans)].filter((b: any) => b && b.id);
  const maxBans = (roomData.banCount || 2) * 2;
  const myPicks = countPicks(myData);
  const oppPicks = countPicks(opponentData);

  return (
    <div className="space-y-4">
      {/* Phase header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg font-body text-sm font-bold flex items-center gap-2 ${phase === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {phase === 'ban' ? <><Ban className="w-4 h-4" /> БАНЫ ({allBans.length}/{maxBans})</> : <><Shield className="w-4 h-4" /> ПИКИ ({myPicks + oppPicks}/10)</>}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-body font-bold ${isMyTurn ? 'bg-dota-gold/15 text-dota-gold animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            {isMyTurn ? '⚡ Твой ход!' : '⏳ Ход соперника...'}
          </div>
        </div>
        <button onClick={onLeave} className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-400 text-xs font-body hover:bg-slate-700 transition-colors">Выйти</button>
      </div>

      {/* Two teams */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] gap-3">
        <TeamPanel label="Твоя команда" player={myData} isMe phase={phase} selectedPosition={selectedPosition} onSelectPosition={setSelectedPosition} />
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-red-500/20 border border-white/10 flex items-center justify-center">
            <Swords className="w-5 h-5 text-dota-gold" />
          </div>
        </div>
        <TeamPanel label="Соперник" player={opponentData} phase={phase} />
      </div>

      {/* Bans display */}
      {allBans.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {allBans.map((h: any, i: number) => (
              <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10">
                <img src={h.icon} alt="" className="w-4 h-4 rounded" />
                <span className="text-[10px] font-body text-red-400 line-through">{h.localized_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick instruction */}
      {phase === 'pick' && isMyTurn && selectedPosition === null && (
        <div className="p-3 rounded-xl bg-dota-gold/8 border border-dota-gold/15 text-center">
          <span className="text-sm font-body text-dota-gold">👆 Нажми на позицию слева, потом выбери героя</span>
        </div>
      )}

      {/* Hero pool */}
      <div className="rounded-2xl bg-[#111827] border border-white/5 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/8 text-white font-body text-sm placeholder:text-slate-600 focus:border-white/15 focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-500" /></button>}
          </div>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'ВСЕ', color: '#fff' },
              { key: 'str', label: 'СИЛ', color: '#EC3D06' },
              { key: 'agi', label: 'ЛОВ', color: '#26E030' },
              { key: 'int', label: 'ИНТ', color: '#00B4F0' },
              { key: 'uni', label: 'УНИ', color: '#B8B8B8' },
            ].map(({ key, label, color }) => (
              <button key={key} onClick={() => setAttrFilter(key)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-body font-bold uppercase tracking-wider transition-all"
                style={{
                  backgroundColor: attrFilter === key ? color + '18' : 'transparent',
                  color: attrFilter === key ? color : '#475569',
                  border: attrFilter === key ? `1px solid ${color}30` : '1px solid transparent',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 lg:grid-cols-13 gap-1 max-h-[350px] overflow-y-auto">
          {filteredHeroes.map(hero => {
            const canClick = isMyTurn && (phase === 'ban' || (phase === 'pick' && selectedPosition !== null));
            return (
              <button key={hero.id} onClick={() => handleHeroClick(hero)} disabled={!canClick}
                className={`group relative aspect-[16/9] rounded overflow-hidden transition-all duration-150 ${canClick ? 'hover:scale-110 hover:z-10 hover:shadow-xl cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                title={hero.localized_name}>
                <img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-0 left-0 right-0 text-[8px] font-body text-white text-center p-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">{hero.localized_name}</span>
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hero.primary_attr === 'all' ? '#B8B8B8' : getAttrColor(hero.primary_attr) }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamPanel({ label, player, isMe, phase, selectedPosition, onSelectPosition }: {
  label: string; player: any; isMe?: boolean; phase: string; selectedPosition?: Position | null; onSelectPosition?: (p: Position) => void;
}) {
  const slots = toArray(player?.slots);
  return (
    <div className={`rounded-xl bg-[#111827] border ${isMe ? 'border-emerald-500/20' : 'border-red-500/20'} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isMe ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="font-body text-xs font-bold text-white uppercase tracking-wider">{player?.name || label}</span>
        {isMe && <span className="text-[9px] font-body text-slate-600 ml-auto">ты</span>}
      </div>
      <div className="space-y-1.5">
        {([1, 2, 3, 4, 5] as Position[]).map(pos => {
          const slot = slots.find((s: any) => s?.position === pos);
          const hero = slot?.hero;
          const hasHero = hero && hero.id;
          const isSelected = isMe && selectedPosition === pos;
          const canSelect = isMe && phase === 'pick' && !hasHero && onSelectPosition;
          return (
            <button key={pos} onClick={() => canSelect && onSelectPosition?.(pos)} disabled={!canSelect}
              className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all text-left ${
                hasHero ? 'bg-white/5' : isSelected ? 'bg-dota-gold/10 ring-1 ring-dota-gold/40' : canSelect ? 'bg-white/2 hover:bg-white/5 cursor-pointer border border-dashed border-white/10' : 'bg-white/2 border border-white/5'
              }`}>
              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hasHero ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'}`}>{pos}</div>
              {hasHero ? (
                <><img src={hero.icon} alt="" className="w-7 h-7 rounded" /><div className="min-w-0"><div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div><div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div></div></>
              ) : (
                <div><div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>{isSelected && <div className="text-[9px] text-dota-gold mt-0.5">← выбери героя</div>}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
