import { useState } from 'react';
import type { DraftAnalysis, Position } from '@/types';
import { POSITION_LABELS } from '@/types';
import { Trophy, Swords, ArrowRight, RotateCcw, TrendingUp, Map, Share2, Copy, Check, Shield, Package, AlertTriangle } from 'lucide-react';

function toArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

// ========== ITEM RECOMMENDATIONS ==========
const ITEM_COUNTERS: Record<string, { item: string; reason: string }[]> = {
  Disabler: [{ item: 'BKB (Black King Bar)', reason: 'Иммунитет к магии против стунов и дизейблов' }],
  Nuker: [{ item: 'Pipe of Insight', reason: 'Щит от магического урона для команды' }, { item: 'BKB', reason: 'Иммунитет к магии' }],
  Escape: [{ item: 'Orchid Malevolence', reason: 'Сайленс не даёт сбежать' }, { item: 'Rod of Atos', reason: 'Рут не даёт использовать мобильность' }],
  Durable: [{ item: 'Spirit Vessel', reason: 'Снижает реген танков' }, { item: 'Diffusal Blade', reason: 'Манабёрн против толстых героев' }],
  Pusher: [{ item: 'Crimson Guard', reason: 'Защита от пуш-юнитов' }, { item: 'Glyph + TP', reason: 'Быстрая ротация на пуш' }],
  Carry: [{ item: 'Heaven\'s Halberd', reason: 'Дизарм против физ-керри' }, { item: 'Ghost Scepter', reason: 'Временная неуязвимость к физ.урону' }],
  Initiator: [{ item: 'Linken\'s Sphere', reason: 'Блокирует инициацию' }, { item: 'Aeon Disk', reason: 'Спасает от бёрста при инициации' }],
};

function getItemRecommendations(enemySlots: any[]): { item: string; reason: string }[] {
  const roles = new Set<string>();
  toArray(enemySlots).forEach((s: any) => {
    if (s?.hero?.roles) {
      toArray(s.hero.roles).forEach((r: string) => roles.add(r));
    }
  });

  const items: { item: string; reason: string }[] = [];
  const seen = new Set<string>();

  for (const role of roles) {
    const counters = ITEM_COUNTERS[role];
    if (counters) {
      for (const c of counters) {
        if (!seen.has(c.item)) {
          seen.add(c.item);
          items.push(c);
        }
      }
    }
  }

  // Всегда добавляем Force Staff если много инициаторов
  if (roles.has('Initiator') && roles.has('Disabler')) {
    if (!seen.has('Force Staff')) items.push({ item: 'Force Staff', reason: 'Спасение союзника из инициации' });
  }

  return items.slice(0, 6);
}

// ========== DRAFT DANGERS ==========
function getDraftWeaknesses(slots: any[]): string[] {
  const heroes = toArray(slots).filter((s: any) => s?.hero).map((s: any) => s.hero);
  const roles = heroes.flatMap((h: any) => toArray(h.roles));
  const weaknesses: string[] = [];

  if (!roles.includes('Disabler')) weaknesses.push('Нет стунов/дизейблов');
  if (!roles.includes('Support')) weaknesses.push('Нет саппорта');
  if (!roles.includes('Initiator')) weaknesses.push('Нет инициации');
  if (!roles.includes('Pusher')) weaknesses.push('Слабый пуш');
  if (heroes.filter((h: any) => h.attack_type === 'Melee').length >= 4) weaknesses.push('Слишком много мили');
  if (heroes.filter((h: any) => toArray(h.roles).includes('Carry')).length >= 3) weaknesses.push('Слишком много керри');

  return weaknesses;
}

// ========== MAIN COMPONENT ==========
interface Props {
  data: any;
  onNewGame: () => void;
  onRematch?: () => void;
}

export function DraftResult({ data, onNewGame, onRematch }: Props) {
  const analysis: DraftAnalysis = data.analysis;
  const p1 = data.player1, p2 = data.player2;
  const winner = data.winner;
  const winnerName = winner === 'player1' ? p1?.name : p2?.name;
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lanes' | 'items'>('overview');

  const p1Weaknesses = getDraftWeaknesses(toArray(p1?.slots));
  const p2Weaknesses = getDraftWeaknesses(toArray(p2?.slots));
  const itemRecs1 = getItemRecommendations(toArray(p2?.slots)); // items for p1 against p2
  const itemRecs2 = getItemRecommendations(toArray(p1?.slots)); // items for p2 against p1

  // Шаринг
  const shareDraft = () => {
    const p1Heroes = toArray(p1?.slots).filter((s: any) => s?.hero).map((s: any) => s.hero.localized_name).join(', ');
    const p2Heroes = toArray(p2?.slots).filter((s: any) => s?.hero).map((s: any) => s.hero.localized_name).join(', ');
    const text = `🏆 Dota 2 Hub Draft Result\n\n${p1?.name}: ${p1Heroes}\n${p2?.name}: ${p2Heroes}\n\nПобедитель: ${winnerName} (${analysis.player1Score}% vs ${analysis.player2Score}%)\n${analysis.summary}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Winner banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#111827] to-[#0f172a] border border-white/5 p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-transparent to-red-500/3" />
        <div className="relative z-10">
          <Trophy className="w-14 h-14 text-dota-gold mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-2">{winnerName} побеждает!</h1>
          <p className="font-body text-slate-400 text-base mb-6">{analysis.summary}</p>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="font-body text-base font-bold text-emerald-400">{p1?.name} — {analysis.player1Score}%</span>
              <span className="font-body text-base font-bold text-red-400">{analysis.player2Score}% — {p2?.name}</span>
            </div>
            <div className="h-4 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-1000" style={{ width: `${analysis.player1Score}%` }} />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-r-full transition-all duration-1000" style={{ width: `${analysis.player2Score}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#111827] border border-white/5 w-fit">
        {[
          { key: 'overview' as const, label: 'Обзор', icon: Swords },
          { key: 'lanes' as const, label: 'Линии', icon: Map },
          { key: 'items' as const, label: 'Айтемы', icon: Package },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-bold transition-all ${
              activeTab === key ? 'bg-dota-gold/15 text-dota-gold' : 'text-slate-500 hover:text-white'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === 'overview' && (
        <>
          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TeamSummary player={p1} color="emerald" advantages={analysis.player1Advantages} weaknesses={p1Weaknesses} />
            <TeamSummary player={p2} color="red" advantages={analysis.player2Advantages} weaknesses={p2Weaknesses} />
          </div>

          {/* Key matchups */}
          {analysis.keyMatchups && analysis.keyMatchups.length > 0 && (
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4"><Swords className="w-5 h-5 text-dota-accent" /><h3 className="font-display text-xl font-bold text-white">Ключевые матчапы</h3></div>
              <div className="space-y-2">
                {analysis.keyMatchups.map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/2">
                    <span className={`font-body text-base font-bold ${m.advantage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero1}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className={`font-body text-base font-bold ${m.advantage < 0 ? 'text-emerald-400' : 'text-red-400'}`}>{m.hero2}</span>
                    <span className="text-sm font-body text-slate-500 ml-auto">{m.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synergy scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#111827] border border-white/5 p-5 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-white">{analysis.synergyScore?.team1 || 0}</div>
              <div className="text-sm font-body text-slate-500">Синергия {p1?.name}</div>
            </div>
            <div className="rounded-xl bg-[#111827] border border-white/5 p-5 text-center">
              <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <div className="font-display text-3xl font-bold text-white">{analysis.synergyScore?.team2 || 0}</div>
              <div className="text-sm font-body text-slate-500">Синергия {p2?.name}</div>
            </div>
          </div>
        </>
      )}

      {/* ===== LANES TAB ===== */}
      {activeTab === 'lanes' && (
        <>
          {analysis.laneBreakdown && analysis.laneBreakdown.length > 0 && (
            <div className="rounded-2xl bg-[#111827] border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4"><Map className="w-5 h-5 text-dota-gold" /><h3 className="font-display text-xl font-bold text-white">Анализ линий</h3></div>
              <div className="space-y-3">
                {analysis.laneBreakdown.map((lane: any, i: number) => (
                  <div key={i} className={`rounded-xl p-4 border ${
                    lane.advantage === 'team1' ? 'bg-emerald-500/5 border-emerald-500/15' :
                    lane.advantage === 'team2' ? 'bg-red-500/5 border-red-500/15' :
                    'bg-white/2 border-white/5'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-base font-bold text-white">{lane.lane}</span>
                      <span className={`text-sm font-body font-bold px-3 py-1 rounded-full ${
                        lane.advantage === 'team1' ? 'bg-emerald-500/15 text-emerald-400' :
                        lane.advantage === 'team2' ? 'bg-red-500/15 text-red-400' :
                        'bg-white/5 text-slate-400'
                      }`}>
                        {lane.advantage === 'team1' ? `✓ ${p1?.name}` : lane.advantage === 'team2' ? `✓ ${p2?.name}` : 'Равно'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-body text-emerald-400/70 mb-1 block">{p1?.name}</span>
                        <span className="text-sm font-body text-white">{toArray(lane.team1Heroes).join(', ') || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-body text-red-400/70 mb-1 block">{p2?.name}</span>
                        <span className="text-sm font-body text-white">{toArray(lane.team2Heroes).join(', ') || '—'}</span>
                      </div>
                    </div>
                    <p className="text-xs font-body text-slate-500 mt-2">{lane.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== ITEMS TAB ===== */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#111827] border border-emerald-500/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display text-lg font-bold text-white">Айтемы для {p1?.name}</h3>
            </div>
            <p className="text-xs font-body text-slate-500 mb-3">Против драфта {p2?.name}</p>
            {itemRecs1.length > 0 ? (
              <div className="space-y-2">
                {itemRecs1.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5">
                    <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-body font-bold text-white">{item.item}</span>
                      <p className="text-xs font-body text-slate-400 mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm font-body text-slate-500">Нет специфических рекомендаций</p>}
          </div>

          <div className="rounded-2xl bg-[#111827] border border-red-500/15 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-red-400" />
              <h3 className="font-display text-lg font-bold text-white">Айтемы для {p2?.name}</h3>
            </div>
            <p className="text-xs font-body text-slate-500 mb-3">Против драфта {p1?.name}</p>
            {itemRecs2.length > 0 ? (
              <div className="space-y-2">
                {itemRecs2.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-body font-bold text-white">{item.item}</span>
                      <p className="text-xs font-body text-slate-400 mt-0.5">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm font-body text-slate-500">Нет специфических рекомендаций</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button onClick={onNewGame} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-dota-accent to-red-600 text-white font-body font-bold text-lg shadow-xl shadow-dota-accent/20 hover:scale-105 transition-all">
          <RotateCcw className="w-5 h-5" /> Новая игра
        </button>
        <button onClick={shareDraft} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-body font-bold hover:bg-white/10 transition-all">
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
          {copied ? 'Скопировано!' : 'Поделиться'}
        </button>
      </div>
    </div>
  );
}

// ========== TEAM SUMMARY ==========
function TeamSummary({ player, color, advantages, weaknesses }: {
  player: any; color: 'emerald' | 'red'; advantages: string[]; weaknesses: string[];
}) {
  const slots = toArray(player?.slots);
  const borderClass = color === 'emerald' ? 'border-emerald-500/15' : 'border-red-500/15';
  const dotClass = color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400';

  return (
    <div className={`rounded-2xl bg-[#111827] border ${borderClass} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${dotClass}`} />
        <span className="font-body text-base font-bold text-white">{player?.name}</span>
      </div>

      {/* Heroes */}
      <div className="space-y-1 mb-4">
        {slots.map((slot: any, i: number) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/2">
            <span className="text-xs font-mono text-slate-500 w-5">{slot?.position}</span>
            {slot?.hero ? (
              <>
                <img src={slot.hero.icon} alt="" className="w-7 h-7 rounded" />
                <span className="text-sm font-body font-bold text-white">{slot.hero.localized_name}</span>
              </>
            ) : <span className="text-sm font-body text-slate-600">—</span>}
          </div>
        ))}
      </div>

      {/* Advantages */}
      {advantages?.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-body text-slate-500 uppercase tracking-wider block mb-1.5">Преимущества</span>
          {advantages.map((a: string, i: number) => (
            <div key={i} className="text-sm font-body text-slate-300 flex items-start gap-1.5 mb-1">
              <span className="text-emerald-400 mt-0.5">✓</span> {a}
            </div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div>
          <span className="text-xs font-body text-slate-500 uppercase tracking-wider block mb-1.5">Слабости</span>
          {weaknesses.map((w, i) => (
            <div key={i} className="text-sm font-body text-amber-400/70 flex items-start gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
