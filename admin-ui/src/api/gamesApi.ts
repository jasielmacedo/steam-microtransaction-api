import { apiSlice } from './apiSlice';

export interface CurrencySettings {
  code: string;
  min_price_increment: number;
  fractional_unit: string;
}

export interface Game {
  _id: string;
  name: string;
  description: string;
  steam_app_id: string;
  active: boolean;
  publisher?: string;
  developer?: string;
  release_date?: string;
  image_url?: string;
  default_currency: string;
  supported_currencies?: CurrencySettings[];
  created_at: string;
  updated_at: string;
}

export interface GamesResponse {
  items: Game[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GameCreateUpdateRequest {
  name: string;
  description: string;
  steam_app_id: string;
  active?: boolean;
  publisher?: string;
  developer?: string;
  release_date?: string;
  image_url?: string;
  default_currency?: string;
  supported_currencies?: CurrencySettings[];
}

const gamesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGames: builder.query<GamesResponse, { search?: string; page?: number; size?: number }>({
      query: ({ search = '', page = 1, size = 10 }) => {
        const skip = (page - 1) * size;
        return {
          url: `/admin/games`,
          params: { search, skip, limit: size },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({ type: 'Games' as const, id: _id })),
              { type: 'Games' as const, id: 'LIST' },
            ]
          : [{ type: 'Games' as const, id: 'LIST' }],
    }),
    
    getGame: builder.query<Game, string>({
      query: (id) => `/admin/games/${id}`,
      providesTags: (result, error, id) => [{ type: 'Games' as const, id }],
    }),
    
    createGame: builder.mutation<Game, GameCreateUpdateRequest>({
      query: (body) => ({
        url: `/admin/games`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Games', id: 'LIST' }],
    }),
    
    updateGame: builder.mutation<Game, { id: string; data: Partial<GameCreateUpdateRequest> }>({
      query: ({ id, data }) => ({
        url: `/admin/games/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Games', id },
        { type: 'Games', id: 'LIST' },
      ],
    }),
    
    deleteGame: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Games', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetGameQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
} = gamesApi;