import { apiSlice } from './apiSlice';

// Game client product types - these match the server-side schemas
export interface GameClientProduct {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  type: string;
  steam_item_id: number;
  icon_url?: string;
  icon_url_large?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  background_color?: string;
  quantity?: number;
}

export interface GameClientProductsResponse {
  success: boolean;
  count: number;
  game_id: string;
  steam_app_id: string;
  products: GameClientProduct[];
}

// Create the game client API slice
export const gameClientApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGameClientProducts: builder.query<GameClientProductsResponse, string>({
      query: (gameId) => `/game-client/products?game_id=${gameId}`,
      providesTags: ['Product'],
    }),
  }),
});

// Export the hook
export const { useGetGameClientProductsQuery } = gameClientApi;