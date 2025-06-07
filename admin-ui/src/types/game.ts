export interface Game {
  _id: string;
  name: string;
  description: string;
  steam_app_id: string;
  active: boolean;
  icon_url?: string;
  banner_url?: string;
  thumbnail_url?: string;
  team_id?: string;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface GamesResponse {
  success: boolean;
  data: Game[];
  total: number;
  page: number;
  size: number; 
  pages: number;
}

export interface GameDetailResponse {
  success: boolean;
  data: Game;
}