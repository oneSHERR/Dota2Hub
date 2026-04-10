import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { ref, set, get } from 'firebase/database';
import { ALL_HEROES } from '@/data/heroes';
import { HERO_ABILITIES } from '@/data/heroAbilities';
import {
  Gamepad2, Trophy, ArrowLeft, Flame, Star, Heart, RotateCcw
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
export type GameId = 'hub' | 'guess-hero' | 'who-stronger' | 'build-hero' | 'draft-puzzle' | 'attribute-battle' | 'invoker-combo' | 'pudge-hook' | 'last-hit';

export interface GameMeta {
  id: GameId;
  title: string;
  desc: string;
  icon: typeof Gamepad2;
  color: string;
  glow: string;
  difficulty: 'Легко' | 'Средне' | 'Сложно';
  type: 'quiz' | 'arcade';
}

export interface MiniGameScore {
  visibleName: string;
  score: number;
  bestCombo: number;
  gamesPlayed: number;
  lastPlayed: number;
}

export interface GameProps {
  onBack: () => void;
  onSave: (gameId: string, score: number, combo: number) => void;
  user: any;
  bestScore: number;
}

// ============================================================
// CDN HELPERS
// ============================================================
const HERO_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes';
const ABILITY_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities';
const ITEM_CDN = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items';

export function heroImg(name: string) { return `${HERO_CDN}/${name}.png`; }
export function heroCrop(name: string) { return `${HERO_CDN}/crops/${name}.png`; }
export function abilityImg(name: string) { return `${ABILITY_CDN}/${name}.png`; }
export function itemImg(name: string) { return `${ITEM_CDN}/${name}.png`; }

// ============================================================
// FIREBASE SCORE
// ============================================================
export async function saveScore(uid: string, gameId: string, score: number, combo: number) {
  const path = `miniGameScores/${uid}/${gameId}`;
  const snap = await get(ref(db, path));
  const prev: MiniGameScore = snap.val() || { visibleName: '', score: 0, bestCombo: 0, gamesPlayed: 0, lastPlayed: 0 };
  const userSnap = await get(ref(db, `users/${uid}/displayName`));
  const displayName = userSnap.val() || 'Аноним';
  await set(ref(db, path), {
    visibleName: displayName,
    score: Math.max(prev.score, score),
    bestCombo: Math.max(prev.bestCombo, combo),
    gamesPlayed: prev.gamesPlayed + 1,
    lastPlayed: Date.now(),
  });
  const allScoresSnap = await get(ref(db, `miniGameScores/${uid}`));
  const allScores = allScoresSnap.val() || {};
  const totalScore = Object.values(allScores).reduce((sum: number, g: any) => sum + (g.score || 0), 0);
  await set(ref(db, `users/${uid}/miniGameScore`), totalScore);
}

// ============================================================
// UTILITIES
// ============================================================
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[], n: number): T[] { return shuffle(arr).slice(0, n); }
export function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

// Heroes that have ability data
export const HEROES_WITH_ABILITIES = ALL_HEROES.filter(h => HERO_ABILITIES[h.name]);

// ============================================================
// GAME WRAPPER (shared UI for all games)
// ============================================================
export function GameWrapper({ children, title, icon: Icon, color, score, combo, bestScore, onBack, onRestart }: {
  children: React.ReactNode;
  title: string;
  icon: typeof Gamepad2;
  color: string;
  score: number;
  combo: number;
  bestScore: number;
  onBack: () => void;
  onRestart?: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {onRestart && (
            <button onClick={onRestart} className="p-2 rounded-lg bg-dota-card border border-dota-border hover:border-white/20 transition-colors" title="Заново">
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-4 mb-6 px-4 py-3 rounded-xl bg-dota-card/80 border border-dota-border/50">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-dota-gold" />
          <span className="text-sm font-body text-slate-400">Счёт:</span>
          <span className="font-display font-bold text-dota-gold text-lg">{score}</span>
        </div>
        <div className="w-px h-6 bg-dota-border" />
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-body text-slate-400">Комбо:</span>
          <span className="font-display font-bold text-orange-400">{combo}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Trophy className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-body text-slate-500">Рекорд: {bestScore}</span>
        </div>
      </div>

      {children}
    </div>
  );
}
