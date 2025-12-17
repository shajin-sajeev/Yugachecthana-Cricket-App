
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
  BOX = 'Box Cricket',
  THE_HUNDRED = 'The Hundred',
  PAIR_CRICKET = 'Pair Cricket'
}

export enum MatchStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  COMPLETED = 'Completed'
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  SCORER = 'scorer'
}

export enum BallType {
  TENNIS = 'Tennis',
  LEATHER = 'Leather',
  VICKY = 'Vicky',
  PLASTIC = 'Plastic',
  WIND = 'Wind Ball',
  OTHER = 'Other'
}

export enum PitchType {
  ROUGH = 'Rough',
  CEMENT = 'Cement',
  TURF = 'Turf',
  ASTRO_TURF = 'Astro Turf',
  MATTING = 'Matting'
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
  isPlaying?: boolean; // For squad selection
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  location?: string;
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

export interface MatchSettings {
  wagonWheel: boolean;
  addExtrasToWide: boolean;
  addExtrasToNoBall: boolean;
  ballsPerOver: number; // 4, 5, 6
  maxBallsPerOver: number; // 6, 7, 8 (with extras)
  addWideBallsToBatsman: boolean;
  addWideRunsToBatsman: boolean;
  addNoBallExtrasToBatsman: boolean;
  wickets: number;
  playersPerTeam: number;
  oversPerBowler: number;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  date: string;
  time: string;
  venue: string;
  status: MatchStatus;
  format: MatchFormat;
  season?: string;
  matchTitle?: string;
  tournamentId?: string;
  tossResult?: string;
  scoreA?: string;
  scoreB?: string;
  result?: string;
  settings?: MatchSettings;
  innings?: Inning[]; 
  ballType?: BallType;
  pitchType?: PitchType;
  
  // Transient state for setup
  currentBatters?: { strikerId: string; nonStrikerId: string };
  currentBowlerId?: string;
  battingTeamId?: string;
  bowlingTeamId?: string;
}

export interface Tournament {
  id: string;
  name: string;
  season: string;
  status: string;
  startDate: string;
  endDate: string;
  format: 'League' | 'Knockout' | 'Groups';
  organizer: string;
  teams: Team[];
}
