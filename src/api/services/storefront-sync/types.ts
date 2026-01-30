/**
 * Storefront Sync Schema TypeScript Definitions
 * Matches the SQL schema for storefront tables
 */

// Product stored in D1
export interface D1Product {
  id: string;
  erpnext_name: string;
  sku: string | null;
  title: string;
  description: string | null;
  brand_id: string | null;
  item_group: string | null; // ERPNext item group name
  price: number | null;
  sale_price: number | null;
  stock_qty: number;
  is_visible: number; // 0 or 1 (SQLite boolean)
  cf_image_id: string | null;
  thumbnail_url: string | null; // Thumbnail image URL
  image_url: string | null; // Full-size image URL
  weight_lbs: number | null;
  categories: string | null; // JSON array
  has_variants: number; // 0 or 1 (SQLite boolean) - parent item with variants
  variant_of: string | null; // SKU of parent item if this is a variant
  is_featured: number; // 0 or 1 - show in featured sections on homepage
  featured_category_id: string | null; // Category ID for featuring in nav/headers
  // Shipping dimensions
  shipping_weight: number | null;
  shipping_weight_uom: string | null;
  shipping_length: number | null;
  shipping_width: number | null;
  shipping_height: number | null;
  shipping_dimension_uom: string | null;
  // Shipping qualifications
  ships_usps: number;
  ships_ups: number;
  ships_ltl: number;
  ships_pickup: number;
  // Hazmat and oversized
  hazmat_flag: number;
  hazmat_class: string | null;
  oversized_flag: number;
  // Variant inheritance
  inherit_shipping_from_parent: number;
  // Search boost (for search ranking)
  search_boost: number; // Default 1.0, 0 or negative hides from search
  created_at: string;
  updated_at: string;
  synced_at: string | null;
}

// Category stored in D1
export interface D1Category {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: number; // 0 or 1
  cf_image_id: string | null;
}

// Brand stored in D1
export interface D1Brand {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  logo_cf_image_id: string | null;
  is_visible: number; // 0 or 1
}

// Sync log entry
export interface D1SyncLog {
  id: number;
  entity_type: 'product' | 'category' | 'brand';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

// Sync state for incremental sync
export interface D1SyncState {
  entity_type: string;
  last_sync_at: string | null;
  last_modified: string | null;
  cursor: string | null;
}

// Input types for creating/updating

export interface CreateD1Product {
  id: string;
  erpnext_name: string;
  sku?: string;
  title: string;
  description?: string;
  brand_id?: string;
  item_group?: string; // ERPNext item group name
  price?: number;
  sale_price?: number;
  stock_qty?: number;
  is_visible?: boolean;
  cf_image_id?: string;
  thumbnail_url?: string; // Thumbnail image URL
  image_url?: string; // Full-size image URL
  weight_lbs?: number;
  categories?: string[];
  has_variants?: boolean;
  variant_of?: string; // SKU of parent item
  is_featured?: boolean; // Show in featured sections on homepage
  featured_category_id?: string; // Category ID for featuring in nav/headers
  // Shipping dimensions
  shipping_weight?: number;
  shipping_weight_uom?: string;
  shipping_length?: number;
  shipping_width?: number;
  shipping_height?: number;
  shipping_dimension_uom?: string;
  // Shipping qualifications
  ships_usps?: boolean;
  ships_ups?: boolean;
  ships_ltl?: boolean;
  ships_pickup?: boolean;
  // Hazmat and oversized
  hazmat_flag?: boolean;
  hazmat_class?: string;
  oversized_flag?: boolean;
  // Variant inheritance
  inherit_shipping_from_parent?: boolean;
  // Search boost (for search ranking)
  search_boost?: number; // Default 1.0, 0 or negative hides from search
}

export interface CreateD1Category {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  parent_id?: string;
  sort_order?: number;
  is_visible?: boolean;
  cf_image_id?: string;
}

export interface CreateD1Brand {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  logo_cf_image_id?: string;
  is_visible?: boolean;
}
