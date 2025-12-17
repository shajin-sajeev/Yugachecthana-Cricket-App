export enum PlayerRole {
  BATSMAN = "Batsman",
  BOWLER = "Bowler",
  ALL_ROUNDER = "All-Rounder",
  WICKET_KEEPER = "Wicket Keeper",
}

export enum MatchFormat {
  T20 = "T20",
  ODI = "ODI",
  TEST = "Test",
  BOX = "Box Cricket",
}

export enum MatchStatus {
  UPCOMING = "Upcoming",
  LIVE = "Live",
  COMPLETED = "Completed",
}

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
  SCORER = "scorer",
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  season?: string;
  start_date?: string;
  end_date?: string;
  status: "upcoming" | "ongoing" | "completed";
  created_by?: string;
  created_at?: string;
}

export interface Team {
  id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  created_by?: string;
}

export interface Player {
  id: string;
  team_id?: string;
  name: string;
  role?: string;
  batting_style?: string;
  bowling_style?: string;
  avatar_url?: string;
}

export interface Match {
  id: string;
  tournament_id?: string;
  team_a_id: string;
  team_b_id: string;
  date?: string;
  venue?: string;
  status: MatchStatus;
  format?: string;
  toss_winner_id?: string;
  toss_decision?: string;
  winner_team_id?: string;
  result_description?: string;

  // Joins
  team_a?: Team;
  team_b?: Team;
  tournament?: Tournament;
}

export interface Inning {
  id: string;
  match_id: string;
  team_id: string;
  inning_number: number;
  total_runs: number;
  wickets: number;
  overs: number;

  // Join
  team?: Team;
}

export interface Ball {
  id: string;
  inning_id: string;
  over_number: number;
  ball_number: number;
  bowler_id: string;
  batsman_id: string;
  non_striker_id?: string;
  runs_scored: number;
  extras: number;
  extra_type?: string;
  is_wicket: boolean;
  dismissal_type?: string;
  dismissed_player_id?: string;
  commentary?: string;

  // Joins
  bowler?: Player;
  batsman?: Player;
}

// Stats Helpers
export interface BattingStats {
  player_id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_out: boolean;
  dismissal_text?: string;
}

export interface BowlingStats {
  player_id: string;
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}
