import { apiSlice } from './apiSlice';

// Steam API Types
export interface GetReliableUserInfoRequest {
  steam_id: string;
  game_id?: string;
}

export interface CheckAppOwnershipRequest {
  steam_id: string;
  game_id: string;
}

export interface InitPurchaseRequest {
  product_id: string;
  steam_id: string;
  quantity?: number;
}

export interface FinalizePurchaseRequest {
  trans_id: string;
}

export interface CheckPurchaseStatusRequest {
  trans_id: string;
}

export interface PurchaseItem {
  itemid: string;
  qty: number;
  amount: string;
  vat: string;
  itemstatus: string;
}

export interface PurchaseStatusResponse {
  success: boolean;
  orderid: string;
  transid: string;
  steamid: string;
  status: string;
  currency: string;
  time: string;
  country: string;
  usstate: string;
  items: PurchaseItem[];
}

export interface InitPurchaseResponse {
  transid: string;
}

export interface SuccessResponse {
  success: boolean;
}

// Transform types to match our UI needs
export interface SteamTransaction {
  id: string; // orderid
  trans_id: string; // transid
  date: string; // time, formatted for display
  user: string; // steamid
  product: string; // items[0].description or similar
  amount: string; // total of all items
  status: 'completed' | 'pending' | 'failed'; // mapped from status
  app_id: string;
  currency: string;
  country: string;
  items: PurchaseItem[];
  raw_data?: any; // For debugging or advanced features
}

// Extended API Slice for Steam-related endpoints
export const steamApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // User reliability check
    getReliableUserInfo: builder.mutation<SuccessResponse, GetReliableUserInfoRequest>({
      query: (requestData) => ({
        url: '/steam/GetReliableUserInfo',
        method: 'POST',
        body: requestData,
      }),
    }),
    
    // App ownership verification
    checkAppOwnership: builder.mutation<SuccessResponse, CheckAppOwnershipRequest>({
      query: (requestData) => ({
        url: '/steam/CheckAppOwnership',
        method: 'POST',
        body: requestData,
      }),
    }),
    
    // Initialize purchase
    initPurchase: builder.mutation<InitPurchaseResponse, InitPurchaseRequest>({
      query: (requestData) => ({
        url: '/steam/InitPurchase',
        method: 'POST',
        body: requestData,
      }),
    }),
    
    // Finalize purchase
    finalizePurchase: builder.mutation<SuccessResponse, FinalizePurchaseRequest>({
      query: (requestData) => ({
        url: '/steam/FinalizePurchase',
        method: 'POST',
        body: requestData,
      }),
    }),
    
    // Check purchase status
    checkPurchaseStatus: builder.mutation<PurchaseStatusResponse, CheckPurchaseStatusRequest>({
      query: (requestData) => ({
        url: '/steam/CheckPurchaseStatus',
        method: 'POST',
        body: requestData,
      }),
    }),
    
    // Get all transactions (from admin/transactions endpoint)
    getSteamTransactions: builder.query<SteamTransaction[], {status?: string, startDate?: string, endDate?: string, steamId?: string, appId?: string, skip?: number, limit?: number}>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.startDate) queryParams.append('start_date', params.startDate);
        if (params.endDate) queryParams.append('end_date', params.endDate);
        if (params.steamId) queryParams.append('steam_id', params.steamId);
        if (params.appId) queryParams.append('app_id', params.appId);
        if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
        
        const queryString = queryParams.toString();
        return `/admin/transactions${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: any[] }) => {
        // Transform backend response to SteamTransaction format
        return response.data.map(transaction => ({
          id: transaction.order_id || transaction._id,
          trans_id: transaction.trans_id || '',
          date: transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] + ' ' + 
                new Date(transaction.created_at).toTimeString().split(' ')[0].substring(0, 5) : '',
          user: transaction.steam_id || '',
          product: transaction.product_name || transaction.item_description || 'Unknown Product',
          amount: transaction.amount?.toString() || '0.00',
          status: mapSteamStatus(transaction.status),
          app_id: transaction.app_id || '',
          currency: transaction.currency || 'USD',
          country: transaction.country || '',
          items: transaction.items || [],
          raw_data: transaction
        }));
      },
      providesTags: ['Transaction'],
    }),
    
    // Get transaction details
    getSteamTransaction: builder.query<SteamTransaction, string>({
      query: (id) => `/admin/transactions/${id}`,
      transformResponse: (response: { success: boolean; data: any }) => {
        const transaction = response.data;
        return {
          id: transaction.order_id || transaction._id,
          trans_id: transaction.trans_id || '',
          date: transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] + ' ' + 
                new Date(transaction.created_at).toTimeString().split(' ')[0].substring(0, 5) : '',
          user: transaction.steam_id || '',
          product: transaction.product_name || transaction.item_description || 'Unknown Product',
          amount: transaction.amount?.toString() || '0.00',
          status: mapSteamStatus(transaction.status),
          app_id: transaction.app_id || '',
          currency: transaction.currency || 'USD',
          country: transaction.country || '',
          items: transaction.items || [],
          raw_data: transaction
        };
      },
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),
  }),
});

// Helper function to map Steam status to our UI status
function mapSteamStatus(steamStatus: string): 'completed' | 'pending' | 'failed' {
  switch (steamStatus.toLowerCase()) {
    case 'complete':
    case 'completed':
    case 'success':
      return 'completed';
    case 'pending':
    case 'processing':
    case 'initialized':
      return 'pending';
    case 'failed':
    case 'declined':
    case 'error':
    case 'cancelled':
      return 'failed';
    default:
      return 'pending';
  }
}

// Dashboard related endpoints
export interface DashboardStats {
  total_count: number;
  completed_count: number;
  failed_count: number;
  pending_count: number;
  total_revenue: number;
  currency: string;
  period_days: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  count: number;
}

export interface TopProduct {
  id: string;
  product_name: string;
  revenue: number;
  count: number;
}

// Add dashboard related endpoints
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get transaction statistics
    getTransactionStats: builder.query<DashboardStats, {days?: number, appId?: string}>({  
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.days) queryParams.append('days', params.days.toString());
        if (params.appId) queryParams.append('app_id', params.appId);
        
        const queryString = queryParams.toString();
        return `/admin/transactions/stats${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: DashboardStats }) => response.data,
      providesTags: ['Transaction'],
    }),
    
    // Get revenue chart data
    getRevenueChartData: builder.query<ChartDataPoint[], {days?: number, appId?: string}>({  
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.days) queryParams.append('days', params.days.toString());
        if (params.appId) queryParams.append('app_id', params.appId);
        
        const queryString = queryParams.toString();
        return `/admin/transactions/chart/revenue${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: ChartDataPoint[] }) => response.data,
      providesTags: ['Transaction'],
    }),
    
    // Get top products
    getTopProducts: builder.query<TopProduct[], {limit?: number, days?: number, appId?: string}>({  
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.days) queryParams.append('days', params.days.toString());
        if (params.appId) queryParams.append('app_id', params.appId);
        
        const queryString = queryParams.toString();
        return `/admin/transactions/top-products${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: TopProduct[] }) => response.data,
      providesTags: ['Transaction'],
    }),
    
    // Get recent transactions
    getRecentTransactions: builder.query<SteamTransaction[], {limit?: number, appId?: string}>({  
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.appId) queryParams.append('app_id', params.appId);
        
        const queryString = queryParams.toString();
        return `/admin/transactions/recent${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: { success: boolean; data: any[] }) => {
        // Transform backend response to SteamTransaction format
        return response.data.map(transaction => ({
          id: transaction.order_id || transaction._id,
          trans_id: transaction.trans_id || '',
          date: transaction.created_at ? new Date(transaction.created_at).toISOString().split('T')[0] + ' ' + 
                new Date(transaction.created_at).toTimeString().split(' ')[0].substring(0, 5) : '',
          user: transaction.steam_id || '',
          product: transaction.product_name || transaction.item_description || 'Unknown Product',
          amount: transaction.amount?.toString() || '0.00',
          status: mapSteamStatus(transaction.status),
          app_id: transaction.app_id || '',
          currency: transaction.currency || 'USD',
          country: transaction.country || '',
          items: transaction.items || [],
          raw_data: transaction
        }));
      },
      providesTags: ['Transaction'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetReliableUserInfoMutation,
  useCheckAppOwnershipMutation,
  useInitPurchaseMutation,
  useFinalizePurchaseMutation,
  useCheckPurchaseStatusMutation,
  useGetSteamTransactionsQuery,
  useGetSteamTransactionQuery,
} = steamApi;

export const {
  useGetTransactionStatsQuery,
  useGetRevenueChartDataQuery,
  useGetTopProductsQuery,
  useGetRecentTransactionsQuery,
} = dashboardApi;