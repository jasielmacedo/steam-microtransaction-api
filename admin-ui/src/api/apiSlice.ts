import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from './authApi';
import { 
  ProfileUpdateRequest, 
  PasswordUpdateRequest, 
  ApiKeyResponse, 
  ApiKey,
  ApiKeyWithKey,
  ApiKeyCreateRequest,
  ApiKeysResponse,
  ApiKeyCreateResponse,
  ApiKeyRotateResponse,
  ApiKeyDeleteResponse,
  AppSettings, 
  UpdateSettingsRequest,
  TeamMember,
  TeamMemberInvite
} from '../types/settings';
import { GamesResponse, Game } from '../types/game';
import { Product, ProductsResponse, ProductResponse, ProductsQueryParams } from '../types/product';

// Query parameter interfaces
export interface GamesQueryParams {
  active_only?: boolean;
  search?: string;
  skip?: number;
  limit?: number;
}

// Define the base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('microtrax_token');
      
      // Get API key for game client API
      const apiKey = localStorage.getItem('microtrax_api_key');
      
      // If we have a token set in localStorage, include it in request headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // If we have an API key set in localStorage, include it in request headers
      if (apiKey) {
        headers.set('x-api-key', apiKey);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Transaction', 'Settings', 'TeamMember', 'ApiKey', 'Currency', 'Game'],
  endpoints: (builder) => ({
    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<User, ProfileUpdateRequest>({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: { success: boolean; data: User }) => response.data,
    }),
    
    updatePassword: builder.mutation<{ success: boolean }, PasswordUpdateRequest>({
      query: (passwordData) => ({
        url: '/auth/updatepassword',
        method: 'PUT',
        body: passwordData,
      }),
      transformResponse: (response: { success: boolean }) => response,
    }),
    
    // Legacy API key generation endpoint (kept for backward compatibility)
    generateApiKey: builder.mutation<ApiKeyResponse, void>({
      query: () => ({
        url: '/auth/generateapikey',
        method: 'POST',
      }),
      invalidatesTags: ['ApiKey'],
    }),
    
    // New API key endpoints
    getApiKeys: builder.query<ApiKey[], void>({
      query: () => '/api-keys',
      transformResponse: (response: ApiKeysResponse) => response.data,
      providesTags: ['ApiKey'],
    }),
    
    createApiKey: builder.mutation<ApiKeyWithKey, ApiKeyCreateRequest>({
      query: (keyData) => ({
        url: '/api-keys',
        method: 'POST',
        body: keyData,
      }),
      invalidatesTags: ['ApiKey'],
      transformResponse: (response: ApiKeyCreateResponse) => response.data,
    }),
    
    rotateApiKey: builder.mutation<ApiKeyWithKey, string>({
      query: (keyId) => ({
        url: `/api-keys/${keyId}/rotate`,
        method: 'POST',
      }),
      invalidatesTags: ['ApiKey'],
      transformResponse: (response: ApiKeyRotateResponse) => response.data,
    }),
    
    deleteApiKey: builder.mutation<ApiKeyDeleteResponse, string>({
      query: (keyId) => ({
        url: `/api-keys/${keyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiKey'],
    }),
    
    // Team member endpoints
    getTeamMembers: builder.query<TeamMember[], void>({
      query: () => '/admin/team',
      transformResponse: (response: { success: boolean; data: TeamMember[] }) => response.data,
      providesTags: ['TeamMember'],
    }),
    
    inviteTeamMember: builder.mutation<{ success: boolean }, TeamMemberInvite>({
      query: (inviteData) => ({
        url: '/admin/team/invite',
        method: 'POST',
        body: inviteData,
      }),
      invalidatesTags: ['TeamMember'],
    }),
    
    removeTeamMember: builder.mutation<{ success: boolean }, string>({
      query: (memberId) => ({
        url: `/admin/team/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeamMember'],
    }),
    
    // Settings endpoints
    getSettings: builder.query<AppSettings, void>({
      query: () => '/admin/settings',
      transformResponse: (response: { success: boolean; data: AppSettings }) => response.data,
      providesTags: ['Settings'],
    }),
    
    updateSettings: builder.mutation<AppSettings, UpdateSettingsRequest>({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
      transformResponse: (response: { success: boolean; data: AppSettings }) => response.data,
    }),
    
    testNotification: builder.mutation<any, any>({
      query: (data) => ({
        url: '/admin/settings/test-notification',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Product endpoints
    getProducts: builder.query<Product[], ProductsQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.active_only) queryParams.append('active_only', 'true');
        if (params?.game_id) queryParams.append('game_id', params.game_id);
        if (params?.steam_app_id) queryParams.append('steam_app_id', params.steam_app_id);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        return `/products${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ProductsResponse) => response.data,
      providesTags: ['Product'],
    }),
    
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (response: ProductResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
      transformResponse: (response: ProductResponse) => response.data,
    }),
    
    updateProduct: builder.mutation<Product, { id: string; product: Partial<Product> }>({
      query: ({ id, product }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, 'Product'],
      transformResponse: (response: ProductResponse) => response.data,
    }),
    
    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    
    // Transaction endpoints
    getTransactions: builder.query<any[], void>({
      query: () => '/transactions',
      transformResponse: (response: { success: boolean; data: any[] }) => response.data,
      providesTags: ['Transaction'],
    }),
    
    getTransaction: builder.query<any, string>({
      query: (id) => `/transactions/${id}`,
      transformResponse: (response: { success: boolean; data: any }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),
    
    // Currency endpoints
    getCurrencies: builder.query<any, void>({
      query: () => '/admin/currencies',
      providesTags: ['Currency'],
    }),
    
    getCurrencySettings: builder.query<any, string>({
      query: (code) => `/admin/currencies/${code}/settings`,
      providesTags: (result, error, code) => [{ type: 'Currency', id: code }],
    }),
    
    // Game endpoints
    getGames: builder.query<GamesResponse, GamesQueryParams>({
      query: (params) => {
        let url = '/admin/games';
        const queryParams = new URLSearchParams();
        
        if (params?.active_only) queryParams.append('active_only', 'true');
        if (params?.search) queryParams.append('search', params.search);
        if (params?.skip) queryParams.append('skip', params.skip.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      transformResponse: (response: GamesResponse) => response,
      providesTags: ['Game'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGenerateApiKeyMutation,
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRotateApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useTestNotificationMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useGetCurrenciesQuery,
  useGetCurrencySettingsQuery,
  useGetGamesQuery,
} = apiSlice;