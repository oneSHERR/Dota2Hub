// ========== HERO ==========
export interface Hero {
  id: number;
  name: string;              // internal name e.g. "antimage"
  localized_name: string;    // display name e.g. "Anti-Mage"
  primary_attr: 'str' | 'agi' | 'int' | 'all';
  attack_type: 'Melee' | 'Ranged';
  roles: string[];
  legs: number;
  img: string;               // full CDN URL
  icon: string;              // small icon CDN URL
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

// Lane assignments: which positions go on which lane
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
  banCount: number;        // bans per player
  timer: number;           // seconds per turn
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

// ========== MATCHUP DATA ==========
export interface HeroMatchup {
  heroId: number;
  vsHeroId: number;
  winRate: number;       // 0-1
  gamesPlayed: number;
}

export interface HeroSynergy {
  heroId: number;
  withHeroId: number;
  winRate: number;
  gamesPlayed: number;
}

// ========== USER ==========
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

// ========== QUIZ ==========
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
