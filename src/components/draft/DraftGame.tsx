import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToRoom, updateRoom } from '@/firebase';
import { ALL_HEROES } from '@/data/heroes';
import { getAttrColor, getAttrLabel } from '@/lib/utils';
import type { Hero, Position, DraftSlot } from '@/types';
import type { RoomInfo } from './DraftPage';
import { POSITION_LABELS } from '@/types';
import { Search, X, Ban, Clock, Shield, Swords, Zap } from 'lucide-react';

// ========== VALVE ATTR ICONS ==========
const ATTR_ICONS: Record<string, string> = {
  str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
  agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
  int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  all: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png',
};
function AttrIcon({ attr, size = 16 }: { attr: string; size?: number }) {
  return <img src={ATTR_ICONS[attr] || ATTR_ICONS.all} alt="" className="inline-block" style={{ width: size, height: size }} />;
}

// ========== CAPTAIN'S MODE SEQUENCE ==========
// Генерируется при создании комнаты (в DraftLobby)
// Формат: { type: 'ban'|'pick', player: 'player1'|'player2' }[]
// Стандарт: бан-бан-бан-бан-пик-пик-пик-пик-бан-бан-бан-бан-пик-пик-пик-пик-пик-пик
// Наш упрощённый (2 бана): бан-бан-бан-бан-пик-пик-пик-пик-пик-пик-пик-пик-пик-пик
// С рандомом: порядок генерируется с элементом случайности

interface DraftStep {
  type: 'ban' | 'pick';
  player: 'player1' | 'player2';
}

function getDefaultSequence(): DraftStep[] {
  // Captain's Mode порядок с 2 банами на игрока:
  // Рандомизируем кто начинает
  const first = Math.random() > 0.5 ? 'player1' : 'player2';
  const second = first === 'player1' ? 'player2' : 'player1';

  // Бан фаза 1: каждый банит по 2
  // Пик фаза: чередование с двойными пиками
  const seq: DraftStep[] = [
    // Баны (4 штуки)
    { type: 'ban', player: first },
    { type: 'ban', player: second },
    { type: 'ban', player: second },
    { type: 'ban', player: first },
    // Пики (10 штук) — с двойными пиками
    { type: 'pick', player: first },
    { type: 'pick', player: second },
    { type: 'pick', player: second },
    { type: 'pick', player: first },
    { type: 'pick', player: first },
    { type: 'pick', player: second },
    { type: 'pick', player: second },
    { type: 'pick', player: first },
    { type: 'pick', player: first },
    { type: 'pick', player: second },
  ];
  return seq;
}

// ========== HELPERS ==========
function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.values(val);
  return [];
}

function countBans(playerData: any): number {
  return toArray(playerData?.bans).filter((b: any) => b && b.id).length;
}

function countPicks(playerData: any): number {
  return toArray(playerData?.slots).filter((s: any) => s && s.hero && s.hero.id).length;
}

function heroToData(hero: Hero) {
  return { id: hero.id, name: hero.name, localized_name: hero.localized_name, img: hero.img, icon: hero.icon, primary_attr: hero.primary_attr, attack_type: hero.attack_type, roles: hero.roles, legs: hero.legs };
}

// ========== PROPS ==========
interface Props {
  roomInfo: RoomInfo;
  onBattleStart: (data: any) => void;
  onLeave: () => void;
}

export function DraftGame({ roomInfo, onBattleStart, onLeave }: Props) {
  const { user } = useAuth();
  const { roomId, playerId } = roomInfo;
  const [roomData, setRoomData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [attrFilter, setAttrFilter] = useState<string>('all');
  const [lastPickAnim, setLastPickAnim] = useState<Hero | null>(null);
  const battleTriggered = useRef(false);

  // Subscribe to room
  useEffect(() => {
    const unsub = subscribeToRoom(roomId, (data) => {
      if (!data) return;
      setRoomData(data);

      // Check if all picks are done
      if (!battleTriggered.current) {
        const p1Picks = countPicks(data.player1);
        const p2Picks = countPicks(data.player2);

        if (p1Picks >= 5 && p2Picks >= 5) {
          battleTriggered.current = true;
          if (playerId === 'player1') {
            updateRoom(roomId, { phase: 'battle', currentTurn: null });
          }
          setTimeout(() => onBattleStart(data), 300);
        }

        if (data.phase === 'battle') {
          battleTriggered.current = true;
          onBattleStart(data);
        }
      }
    });
    return unsub;
  }, [roomId, playerId]);

  // Current step from sequence
  const draftSequence: DraftStep[] = useMemo(() => {
    if (roomData?.draftSequence) return toArray(roomData.draftSequence);
    return [];
  }, [roomData?.draftSequence]);

  const currentStepIndex = roomData?.currentStep || 0;
  const currentStep = draftSequence[currentStepIndex] || null;
  const phase = currentStep?.type || 'ban';
  const isMyTurn = currentStep?.player === playerId;

  const myData = roomData?.[playerId];
  const opponentId = playerId === 'player1' ? 'player2' : 'player1';
  const opponentData = roomData?.[opponentId];

  // All used hero IDs
  const usedHeroIds = useMemo(() => {
    if (!roomData) return new Set<number>();
    const ids = new Set<number>();
    toArray(roomData.player1?.bans).forEach((h: any) => { if (h?.id) ids.add(h.id); });
    toArray(roomData.player2?.bans).forEach((h: any) => { if (h?.id) ids.add(h.id); });
    toArray(roomData.player1?.slots).forEach((s: any) => { if (s?.hero?.id) ids.add(s.hero.id); });
    toArray(roomData.player2?.slots).forEach((s: any) => { if (s?.hero?.id) ids.add(s.hero.id); });
    return ids;
  }, [roomData]);

  // Filter heroes
  const filteredHeroes = useMemo(() => {
    const order: Record<string, number> = { str: 0, agi: 1, int: 2, all: 3 };
    return ALL_HEROES.filter(h => {
      if (usedHeroIds.has(h.id)) return false;
      if (search && !h.localized_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (attrFilter === 'all') return true;
      if (attrFilter === 'uni') return h.primary_attr === 'all';
      return h.primary_attr === attrFilter;
    }).sort((a, b) => {
      const ao = order[a.primary_attr] ?? 4;
      const bo = order[b.primary_attr] ?? 4;
      return ao !== bo ? ao - bo : a.localized_name.localeCompare(b.localized_name);
    });
  }, [search, attrFilter, usedHeroIds]);

  // BAN handler
  const handleBan = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'ban') return;

    const currentBans = toArray(myData?.bans).filter((b: any) => b && b.id);
    const newBans = [...currentBans, heroToData(hero)];

    setLastPickAnim(hero);
    setTimeout(() => setLastPickAnim(null), 1500);

    await updateRoom(roomId, {
      [`${playerId}/bans`]: newBans,
      currentStep: currentStepIndex + 1,
    });
  };

  // PICK handler
  const handlePick = async (hero: Hero) => {
    if (!isMyTurn || phase !== 'pick' || selectedPosition === null) return;

    const currentSlots = toArray(myData?.slots);
    const newSlots = currentSlots.map((s: any) => {
      if (s && s.position === selectedPosition && !s.hero) {
        return { position: selectedPosition, hero: heroToData(hero) };
      }
      return s;
    });

    setLastPickAnim(hero);
    setTimeout(() => setLastPickAnim(null), 1500);

    await updateRoom(roomId, {
      [`${playerId}/slots`]: newSlots,
      currentStep: currentStepIndex + 1,
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
  const myPicks = countPicks(myData);
  const oppPicks = countPicks(opponentData);
  const totalSteps = draftSequence.length;
  const progress = totalSteps > 0 ? (currentStepIndex / totalSteps) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Pick animation overlay */}
      {lastPickAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="text-center" style={{ animation: 'pickReveal 1.5s ease-out forwards' }}>
            <img src={lastPickAnim.img} alt="" className="w-48 h-28 rounded-2xl object-cover mx-auto border-2 border-dota-gold/50 shadow-2xl shadow-dota-gold/20" />
            <div className="mt-3 font-display text-2xl font-black text-white">{lastPickAnim.localized_name}</div>
            <div className="text-sm font-body text-dota-gold">{phase === 'ban' ? 'ЗАБАНЕН' : 'ВЫБРАН'}</div>
          </div>
        </div>
      )}

      {/* Phase header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl font-body text-sm font-bold flex items-center gap-2 ${phase === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {phase === 'ban' ? <><Ban className="w-4 h-4" /> БАН</> : <><Shield className="w-4 h-4" /> ПИК</>}
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-sm font-body font-bold ${isMyTurn ? 'bg-dota-gold/15 text-dota-gold animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            {isMyTurn ? '⚡ Твой ход!' : '⏳ Ход соперника...'}
          </div>
          <span className="text-xs font-mono text-slate-600">Шаг {currentStepIndex + 1}/{totalSteps}</span>
        </div>
        <button onClick={onLeave} className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-body hover:bg-slate-700 transition-all duration-300">Выйти</button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-dota-gold to-emerald-500 transition-all duration-300 duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Draft sequence visualization */}
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {draftSequence.map((step, i) => {
          const isDone = i < currentStepIndex;
          const isCurrent = i === currentStepIndex;
          const isP1 = step.player === 'player1';
          return (
            <div key={i} className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-mono font-bold border transition-all duration-300 ${
              isCurrent ? 'ring-2 ring-dota-gold/50 scale-110 z-10' : ''
            } ${isDone ? 'opacity-40' : ''} ${
              step.type === 'ban'
                ? isP1 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                : isP1 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`} title={`${step.type === 'ban' ? 'Бан' : 'Пик'} — ${isP1 ? 'P1' : 'P2'}`}>
              {step.type === 'ban' ? 'B' : 'P'}
            </div>
          );
        })}
      </div>

      {/* Two teams */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_60px_1fr] gap-3">
        <TeamPanel label="Твоя команда" player={myData} isMe phase={phase} selectedPosition={selectedPosition} onSelectPosition={setSelectedPosition} />
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-red-500/20 border border-dota-border/30 flex items-center justify-center">
            <Swords className="w-5 h-5 text-dota-gold" />
          </div>
        </div>
        <TeamPanel label="Соперник" player={opponentData} phase={phase} />
      </div>

      {/* Bans display */}
      {allBans.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/5 border border-red-500/10">
          <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-2">
            {allBans.map((h: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-red-500/10">
                <img src={h.icon} alt="" className="w-6 h-6 rounded grayscale" />
                <span className="text-xs font-body text-red-400 line-through">{h.localized_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick instruction */}
      {phase === 'pick' && isMyTurn && selectedPosition === null && (
        <div className="p-3 rounded-2xl bg-dota-gold/8 border border-dota-gold/15 text-center">
          <span className="text-sm font-body text-dota-gold">👆 Нажми на позицию слева, потом выбери героя</span>
        </div>
      )}

      {/* Hero pool */}
      <div className="rounded-2xl bg-dota-card/60 border border-dota-border/20 p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск героя..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 text-white font-body text-base placeholder:text-slate-600 focus:border-white/15 focus:outline-none" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500" /></button>}
          </div>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Все' },
              { key: 'str', attr: 'str' },
              { key: 'agi', attr: 'agi' },
              { key: 'int', attr: 'int' },
              { key: 'uni', attr: 'all' },
            ].map(({ key, label, attr }) => (
              <button key={key} onClick={() => setAttrFilter(key)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${attrFilter === key ? 'bg-white/15 ring-1 ring-white/20' : 'hover:bg-white/[0.04]'}`}>
                {label ? <span className="text-xs font-bold text-white">{label}</span> : <AttrIcon attr={attr!} size={20} />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[400px] overflow-y-auto">
          {filteredHeroes.map(hero => {
            const canClick = isMyTurn && (phase === 'ban' || (phase === 'pick' && selectedPosition !== null));
            return (
              <button key={hero.id} onClick={() => handleHeroClick(hero)} disabled={!canClick}
                className={`group relative rounded-xl overflow-hidden transition-all duration-300 duration-150 ${canClick ? 'hover:scale-110 hover:z-10 hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                title={hero.localized_name}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={hero.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute top-0.5 left-0.5"><AttrIcon attr={hero.primary_attr} size={12} /></div>
                <span className="absolute bottom-0 left-0 right-0 text-[9px] font-body font-bold text-white text-center p-1 truncate drop-shadow-lg">
                  {hero.localized_name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pickReveal {
          0% { transform: scale(0.5); opacity: 0; }
          30% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

// ========== TEAM PANEL ==========
function TeamPanel({ label, player, isMe, phase, selectedPosition, onSelectPosition }: {
  label: string; player: any; isMe?: boolean; phase: string; selectedPosition?: Position | null; onSelectPosition?: (p: Position) => void;
}) {
  const slots = toArray(player?.slots);
  return (
    <div className={`rounded-2xl bg-dota-card/60 border ${isMe ? 'border-emerald-500/20' : 'border-red-500/20'} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isMe ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="font-body text-sm font-bold text-white uppercase tracking-wider">{player?.name || label}</span>
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
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 text-left ${
                hasHero ? 'bg-white/[0.04]' : isSelected ? 'bg-dota-gold/10 ring-1 ring-dota-gold/40' : canSelect ? 'bg-white/2 hover:bg-white/[0.04] cursor-pointer border border-dashed border-dota-border/30' : 'bg-white/2 border border-dota-border/20'
              }`}>
              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold ${hasHero ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-slate-500'}`}>{pos}</div>
              {hasHero ? (
                <>
                  <img src={hero.icon} alt="" className="w-8 h-8 rounded" />
                  <AttrIcon attr={hero.primary_attr} size={12} />
                  <div className="min-w-0">
                    <div className="text-xs font-body font-bold text-white truncate">{hero.localized_name}</div>
                    <div className="text-[9px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="text-[10px] font-body text-slate-500">{POSITION_LABELS[pos]}</div>
                  {isSelected && <div className="text-[9px] text-dota-gold mt-0.5">← выбери героя</div>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
