
export enum PlayerRole {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket Keeper',
}

export enum MatchFormat {
  T20 = 'T20',
  ODI = 'ODI',
  TEST = 'Test',
  BOX = 'Box Cricket'
}

export enum MatchStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  COMPLETED = 'Completed'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SCORER = 'scorer'
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// Points Engine Types
export interface PointsRule {
  id: string;
  category: 'BATTING' | 'BOWLING' | 'FIELDING' | 'IMPACT';
  event: string;
  points: number;
  description?: string;
  isActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  battingStyle: string;
  bowlingStyle: string;
  matches: number;
  runs: number;
  wickets: number;
  avatarUrl: string;
  mvpPoints: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  players: Player[];
}

// New Interfaces for Detailed Match Centre
export interface BattingStats {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isNotOut: boolean;
  dismissalText?: string; // e.g., "b Sarath" or "c & b Seetharam"
  onStrike?: boolean;
}

export interface BowlingStats {
  playerId: string;
  playerName: string;
  overs: string; // "3.2"
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface Inning {
  teamId: string;
  teamName: string;
  shortName: string;
  batting: BattingStats[];
  bowling: BowlingStats[];
  extras: number;
  wide: number;
  noBall: number;
  byes: number;
  legByes: number;
  totalRuns: number;
  totalWickets: number;
  oversPlayed: string;
  runRate: number;
  didNotBat: string[];
}

export interface BallEvent {
  ball: number; // 1 to 6
  over: number; 
  bowler: string;
  batsman: string;
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  isExtra: boolean;
  commentary: string;
  scoreDisplay: string; // "142-3"
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  date: string;
  venue: string;
  status: MatchStatus;
  format: MatchFormat;
  season?: string;
  matchTitle?: string;
  tossResult?: string;
  scoreA?: string;
  scoreB?: string;
  result?: string;
  innings?: Inning[]; // Array of innings details
}

export interface Tournament {
  id: string;
  name: string;
  season: string;
  status: string;
  teams: number;
}
