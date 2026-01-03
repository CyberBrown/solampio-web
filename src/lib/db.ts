/**
 * Type-safe D1 Database Client for Qwik Frontend
 *
 * Provides strongly-typed access to storefront data in D1.
 * Used by routeLoader$ functions for server-side data fetching.
 */

import type { D1Database } from '@cloudflare/workers-types';

// ============================================================================
// Type Definitions (matching D1 schema)
// ============================================================================

export interface Product {
  id: string;
  erpnext_name: string;
  sku: string | null;
  title: string;
  description: string | null;
  brand_id: string | null;
  item_group: string | null;
  categories: string | null;  // JSON array
  price: number | null;
  sale_price: number | null;
  stock_qty: number;
  is_visible: number;
  cf_image_id: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  weight_lbs: number | null;
  sync_source: string;
  last_synced_from_erpnext: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_visible: number;
  count: number;
  image_url: string | null;
  sync_source: string;
  last_synced_from_erpnext: string | null;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  erpnext_name: string;
  title: string;
  slug: string;
  description: string | null;
  logo_cf_image_id: string | null;
  logo_url: string | null;
  is_visible: number;
  sort_order: number;
  sync_source: string;
  last_synced_from_erpnext: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sort?: 'title' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_more: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clean slug by removing leading/trailing slashes
 */
export function cleanSlug(slug: string | null): string {
  if (!slug) return '';
  return slug.replace(/^\/+|\/+$/g, '');
}

// ============================================================================
// D1 Client Class
// ============================================================================

/**
 * Type-safe D1 client for Qwik frontend
 */
export class StorefrontDB {
  constructor(private db: D1Database) {}

  /**
   * Get products with optional filtering and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<{
    products: Product[];
    pagination: PaginationMeta;
  }> {
    const {
      category,
      brand,
      search,
      limit = 50,
      offset = 0,
      sort = 'title',
      order = 'asc'
    } = filters;

    // If category slug provided, look up the category UUID first
    let categoryId: string | null = null;
    if (category) {
      const cat = await this.getCategory(category);
      if (cat) {
        categoryId = cat.id;
      }
    }

    // Build query
    let query = 'SELECT * FROM storefront_products WHERE is_visible = 1';
    const params: any[] = [];

    if (categoryId) {
      query += ' AND categories LIKE ?';
      params.push(`%"${categoryId}"%`);
    }

    if (brand) {
      // Brand can be either ID or slug
      const brandRecord = await this.getBrand(brand);
      if (brandRecord) {
        query += ' AND brand_id = ?';
        params.push(brandRecord.id);
      }
    }

    if (search) {
      query += ' AND (title LIKE ? OR sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const orderDirection = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sort} ${orderDirection}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await this.db.prepare(query).bind(...params).all<Product>();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM storefront_products WHERE is_visible = 1';
    const countParams: any[] = [];

    if (categoryId) {
      countQuery += ' AND categories LIKE ?';
      countParams.push(`%"${categoryId}"%`);
    }

    if (brand) {
      const brandRecord = await this.getBrand(brand);
      if (brandRecord) {
        countQuery += ' AND brand_id = ?';
        countParams.push(brandRecord.id);
      }
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR sku LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await this.db.prepare(countQuery).bind(...countParams).first<{ total: number }>();
    const total = countResult?.total || 0;

    return {
      products: result.results || [],
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_more: (offset + limit) < total
      }
    };
  }

  /**
   * Get single product by ID or SKU
   */
  async getProduct(idOrSku: string): Promise<Product | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE (id = ? OR sku = ?) AND is_visible = 1
      LIMIT 1
    `).bind(idOrSku, idOrSku).first<Product>();

    return result || null;
  }

  /**
   * Get all categories with hierarchy
   */
  async getCategories(parentId?: string | null): Promise<Category[]> {
    let query = 'SELECT * FROM storefront_categories WHERE is_visible = 1';
    const params: any[] = [];

    if (parentId !== undefined) {
      if (parentId === null) {
        query += ' AND parent_id IS NULL';
      } else {
        query += ' AND parent_id = ?';
        params.push(parentId);
      }
    }

    query += ' ORDER BY sort_order ASC, title ASC';

    const result = await this.db.prepare(query).bind(...params).all<Category>();
    return result.results || [];
  }

  /**
   * Get top-level product categories (children of "All Item Groups")
   * These are the main navigation categories like Batteries, Solar Panels, etc.
   */
  async getTopLevelCategories(): Promise<Category[]> {
    // Find "All Item Groups" which is the ERPNext root
    const allItemGroups = await this.db.prepare(`
      SELECT id FROM storefront_categories
      WHERE erpnext_name = 'All Item Groups' AND is_visible = 1
      LIMIT 1
    `).first<{ id: string }>();

    if (!allItemGroups) {
      // Fallback to root categories if no "All Item Groups"
      return this.getCategories(null);
    }

    // Get children of "All Item Groups"
    const result = await this.db.prepare(`
      SELECT * FROM storefront_categories
      WHERE parent_id = ? AND is_visible = 1
      ORDER BY sort_order ASC, title ASC
    `).bind(allItemGroups.id).all<Category>();

    return result.results || [];
  }

  /**
   * Get subcategories of a category
   */
  async getSubcategories(parentId: string): Promise<Category[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_categories
      WHERE parent_id = ? AND is_visible = 1
      ORDER BY sort_order ASC, title ASC
    `).bind(parentId).all<Category>();

    return result.results || [];
  }

  /**
   * Get single category by ID or slug
   */
  async getCategory(idOrSlug: string): Promise<Category | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_categories
      WHERE (id = ? OR slug = ?) AND is_visible = 1
      LIMIT 1
    `).bind(idOrSlug, idOrSlug).first<Category>();

    return result || null;
  }

  /**
   * Get all brands sorted by title
   */
  async getBrands(): Promise<Brand[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_brands
      WHERE is_visible = 1
      ORDER BY sort_order ASC, title ASC
    `).all<Brand>();

    return result.results || [];
  }

  /**
   * Get single brand by ID or slug
   */
  async getBrand(idOrSlug: string): Promise<Brand | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_brands
      WHERE (id = ? OR slug = ?) AND is_visible = 1
      LIMIT 1
    `).bind(idOrSlug, idOrSlug).first<Brand>();

    return result || null;
  }

  /**
   * Search products by keyword
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1
        AND (title LIKE ? OR sku LIKE ? OR description LIKE ?)
      ORDER BY title ASC
      LIMIT ?
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`, limit).all<Product>();

    return result.results || [];
  }

  /**
   * Get featured products (visible, with prices, prefer in-stock)
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1
        AND price IS NOT NULL
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        created_at DESC
      LIMIT ?
    `).bind(limit).all<Product>();

    return result.results || [];
  }
}

// ============================================================================
// Helper Functions for Qwik
// ============================================================================

/**
 * Get StorefrontDB instance from Qwik request event
 * Use this in routeLoader$ functions
 */
export function getDB(platform: any): StorefrontDB {
  if (!platform?.env?.DB) {
    throw new Error('D1 database binding not found. Make sure DB is configured in wrangler.toml');
  }
  return new StorefrontDB(platform.env.DB);
}

/**
 * Parse category IDs from JSON string in products
 */
export function parseCategoryIds(categoriesJson: string | null): string[] {
  if (!categoriesJson) return [];
  try {
    return JSON.parse(categoriesJson);
  } catch {
    return [];
  }
}
