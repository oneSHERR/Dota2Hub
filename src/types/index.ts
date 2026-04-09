// ========== HERO ==========
export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: 'str' | 'agi' | 'int' | 'all';
  attack_type: 'Melee' | 'Ranged';
  roles: string[];
  legs: number;
  img: string;
  icon: string;
}

// ========== HERO ABILITIES (OpenDota) ==========
export interface HeroAbility {
  dname: string;
  behavior: string | string[];
  dmg_type?: string;
  bkbpierce?: string;
  desc: string;
  attrib: AbilityAttribute[];
  mc: number[] | boolean;
  cd: number[] | boolean;
  img: string;
  lore?: string;
}

export interface AbilityAttribute {
  key: string;
  header: string;
  value: string | string[];
}

// ========== TIER LIST (STRATZ) ==========
export type TierRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface TierHeroData {
  heroId: number;
  name: string;
  localized_name: string;
  winRate: number;
  pickRate: number;
  tier: TierRank;
  position?: string;
  img: string;
  icon: string;
}

// ========== DRAFT ==========
export type Position = 1 | 2 | 3 | 4 | 5;

export const POSITION_NAMES: Record<Position, string> = {
  1: 'Carry',
  2: 'Mid',
  3: 'Offlane',
  4: 'Soft Support',
  5: 'Hard Support',
};

export const POSITION_LABELS: Record<Position, string> = {
  1: 'Pos 1 — Carry',
  2: 'Pos 2 — Mid',
  3: 'Pos 3 — Offlane',
  4: 'Pos 4 — Soft Support',
  5: 'Pos 5 — Hard Support',
};

export const LANE_POSITIONS: Record<string, Position[]> = {
  'Safe Lane': [1, 5],
  'Mid Lane': [2],
  'Off Lane': [3, 4],
};

export interface DraftSlot {
  position: Position;
  hero: Hero | null;
}

export interface DraftPlayer {
  uid: string;
  name: string;
  isReady: boolean;
  slots: DraftSlot[];
  bans: Hero[];
}

export type DraftPhase = 'lobby' | 'ban' | 'pick' | 'analysis' | 'result';

export interface DraftState {
  roomId: string;
  player1: DraftPlayer | null;
  player2: DraftPlayer | null;
  currentTurn: 'player1' | 'player2' | null;
  phase: DraftPhase;
  turnNumber: number;
  banCount: number;
  timer: number;
  winner: 'player1' | 'player2' | 'draw' | null;
  analysis: DraftAnalysis | null;
}

export interface DraftAnalysis {
  player1Score: number;
  player2Score: number;
  player1Advantages: string[];
  player2Advantages: string[];
  laneBreakdown: LaneAnalysis[];
  synergyScore: { team1: number; team2: number };
  keyMatchups: KeyMatchup[];
  predictedWinner: 'player1' | 'player2' | 'draw';
  confidence: number;
  summary: string;
}

export interface LaneAnalysis {
  lane: string;
  team1Heroes: string[];
  team2Heroes: string[];
  advantage: 'team1' | 'team2' | 'even';
  reason: string;
}

export interface KeyMatchup {
  hero1: string;
  hero2: string;
  advantage: number;
  reason: string;
}

export interface HeroMatchup {
  heroId: number;
  vsHeroId: number;
  winRate: number;
  gamesPlayed: number;
}

export interface HeroSynergy {
  heroId: number;
  withHeroId: number;
  winRate: number;
  gamesPlayed: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: number;
  stats: UserStats;
  friends: Record<string, boolean>;
}

export interface UserStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface FriendRequest {
  from: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  text: string;
  scores: Partial<Record<Position, number>>;
}

export interface QuizResult {
  position: Position;
  scores: Record<Position, number>;
  date: number;
}
