export interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  price_cents: number;
  type: string;
  active: boolean;
  game_id?: string;
  game_name?: string; // This will be populated by the backend
  steam_item_id?: number;
  steam_category?: string;
  // Image URLs
  icon_url?: string;
  icon_url_large?: string;
  // Steam attributes
  marketable?: boolean;
  tradable?: boolean;
  store_bundle?: boolean;
  quantity?: number;
  tags?: string[];
  store_tags?: string[];
  store_categories?: string[];
  background_color?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface ProductsQueryParams {
  active_only?: boolean;
  game_id?: string;
  search?: string;
  skip?: number;
  limit?: number;
}