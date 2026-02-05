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
  description_clean: string | null;  // Cleaned description (HTML stripped, formatted)
  description_summary: string | null;  // AI-generated short summary (~500 chars)
  brand_id: string | null;
  item_group: string | null;
  categories: string | null;  // JSON array
  price: number | null;
  sale_price: number | null;
  stock_qty: number;
  low_stock_threshold: number | null;  // Quantity at which "Low Stock" displays
  show_stock_status: number;  // 1 to show stock status, 0 to hide (default: 0)
  is_visible: number;
  cf_image_id: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  weight_lbs: number | null;
  has_variants: number;  // 1 if this is a parent product with variants
  variant_of: string | null;  // SKU of parent product if this is a variant
  is_featured: number;  // 1 if this product should appear in featured sections
  featured_category_id: string | null;  // Category ID where this product is featured (for nav, hero, etc.)
  featured_in_subcategory_id: string | null;  // Subcategory ID for subcategory-specific featuring
  // Shipping dimensions (packaged dimensions for carrier rates)
  shipping_weight: number | null;
  shipping_weight_uom: string | null;  // 'lb' or 'kg'
  shipping_length: number | null;
  shipping_width: number | null;
  shipping_height: number | null;
  shipping_dimension_uom: string | null;  // 'in' or 'cm'
  // Shipping qualification flags
  ships_usps: number;  // 1 if qualifies for USPS
  ships_ups: number;  // 1 if qualifies for UPS
  ships_ltl: number;  // 1 if qualifies for LTL freight
  ships_pickup: number;  // 1 if available for pickup
  // Hazmat and oversized flags
  hazmat_flag: number;  // 1 if hazardous material
  hazmat_class: string | null;  // UN number and proper shipping name
  oversized_flag: number;  // 1 if oversized
  // Variant inheritance
  inherit_shipping_from_parent: number;  // 1 to use parent's shipping specs
  // Search boost (for search ranking)
  search_boost: number;  // Default 1.0, 0 or negative hides from search
  // SEO optimization fields
  seo_title: string | null;
  seo_meta_description: string | null;
  seo_description_summary: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_keywords: string | null;  // JSON array in D1
  seo_robots: string | null;
  seo_faqs: string | null;  // JSON array in D1
  seo_related_searches: string | null;  // JSON array in D1
  seo_use_cases: string | null;  // JSON array in D1
  description_original: string | null;
  seo_last_optimized: string | null;
  seo_competitor_data: string | null;  // JSON array in D1
  // Google Merchant Center fields
  gmc_google_category: string | null;
  gmc_product_type: string | null;
  gmc_condition: string | null;
  gmc_availability: string | null;
  gmc_shipping_label: string | null;
  gmc_custom_label_0: string | null;
  gmc_custom_label_1: string | null;
  gmc_custom_label_2: string | null;
  gmc_custom_label_3: string | null;
  gmc_custom_label_4: string | null;
  gmc_additional_images: string | null;  // JSON string in DB
  gtin: string | null;
  mpn: string | null;
  // Review/rating data (from Yotpo or similar)
  rating_value: number | null;
  rating_count: number | null;
  // BigCommerce URL slug for 301 redirects
  bc_url_slug: string | null;
  sync_source: string;
  last_synced_from_erpnext: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Stock Status Types and Helpers
// ============================================================================

export type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock' | null;

export interface StockStatusInfo {
  status: StockStatus;
  label: string;
  showBadge: boolean;
  badgeClass: string;
  textClass: string;
}

/**
 * Get stock status information for a product
 * Returns null status if show_stock_status is disabled
 *
 * Logic:
 * - If show_stock_status = 0 → show nothing (status: null)
 * - If stock_qty = 0 → "Out of Stock" (red)
 * - If stock_qty <= low_stock_threshold → "Low Stock" (orange)
 * - Otherwise → "In Stock" (green, but not shown by default)
 */
export function getStockStatus(product: Product, showInStock = false): StockStatusInfo {
  // Stock status display is OFF by default - only show if explicitly enabled (show_stock_status === 1)
  if (product.show_stock_status !== 1) {
    return {
      status: null,
      label: '',
      showBadge: false,
      badgeClass: '',
      textClass: '',
    };
  }

  const qty = product.stock_qty;
  const threshold = product.low_stock_threshold ?? 0;

  if (qty <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of Stock',
      showBadge: true,
      badgeClass: 'bg-red-100 text-red-700 border border-red-200',
      textClass: 'text-red-600',
    };
  }

  if (threshold > 0 && qty <= threshold) {
    return {
      status: 'low_stock',
      label: `Low Stock${qty <= 5 ? ` (${qty} left)` : ''}`,
      showBadge: true,
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      textClass: 'text-amber-600',
    };
  }

  // In stock - optionally show badge
  return {
    status: 'in_stock',
    label: 'In Stock',
    showBadge: showInStock,
    badgeClass: 'bg-[#56c270]/10 text-[#042e0d] border border-[#56c270]/30',
    textClass: 'text-[#042e0d]',
  };
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
  cf_image_id: string | null;
  cf_category_image_url: string | null;  // Full Cloudflare Images URL for direct editing in ERPNext
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
  logo_thumb_cf_id: string | null;
  logo_greyscale_cf_id: string | null;
  logo_source_url: string | null;
  is_featured: number;
  is_visible: number;
  sort_order: number;
  sync_source: string;
  last_synced_from_erpnext: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandCategoryAssociation {
  id: string;
  brand_id: string;
  category_id: string;
  association_type: 'category' | 'subcategory';
  created_at: string;
}

export interface BrandWithCategories extends Brand {
  associated_categories: Category[];
  associated_subcategories: Category[];
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

export interface ProductImage {
  cf_image_id: string;
  thumbnail_url: string;
  image_url: string;
  sort_order: number;
  is_primary: number;
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

/**
 * Encode SKU for use in URLs
 * Handles SKUs with slashes and other special characters
 */
export function encodeSkuForUrl(sku: string | null): string {
  if (!sku) return '';
  return encodeURIComponent(sku);
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
   * Fill in missing images for variants by looking up their parent product.
   * Variants share images with their parent template product.
   */
  async fillVariantImages(products: Product[]): Promise<Product[]> {
    const variantsNeedingImages = products.filter(
      p => p.variant_of && !p.cf_image_id && !p.image_url && !p.thumbnail_url
    );
    if (variantsNeedingImages.length === 0) return products;

    // Get unique parent erpnext_names
    const parentNames = [...new Set(variantsNeedingImages.map(p => p.variant_of!))];
    const placeholders = parentNames.map(() => '?').join(',');
    const parents = await this.db
      .prepare(`SELECT erpnext_name, cf_image_id, image_url, thumbnail_url FROM storefront_products WHERE erpnext_name IN (${placeholders})`)
      .bind(...parentNames)
      .all<{ erpnext_name: string; cf_image_id: string | null; image_url: string | null; thumbnail_url: string | null }>();

    const parentMap = new Map(
      (parents.results || []).map(p => [p.erpnext_name, p])
    );

    return products.map(p => {
      if (p.variant_of && !p.cf_image_id && !p.image_url && !p.thumbnail_url) {
        const parent = parentMap.get(p.variant_of);
        if (parent) {
          return {
            ...p,
            cf_image_id: parent.cf_image_id,
            image_url: parent.image_url,
            thumbnail_url: parent.thumbnail_url,
          };
        }
      }
      return p;
    });
  }

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

    // Build query - show standalone products and parents with children, hide individual variants and childless parents
    let query = 'SELECT * FROM storefront_products WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = \'\') AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))';
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

    // Get total count - standalone + parents with children only
    let countQuery = 'SELECT COUNT(*) as total FROM storefront_products WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = \'\') AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))';
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

    const products = await this.fillVariantImages(result.results || []);

    return {
      products,
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
   * Get single product by ID, SKU, or BigCommerce URL slug
   */
  async getProduct(idOrSku: string): Promise<Product | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE (id = ? OR sku = ? OR bc_url_slug = ?) AND is_visible = 1
      LIMIT 1
    `).bind(idOrSku, idOrSku, idOrSku).first<Product>();

    return result || null;
  }

  /**
   * Get variants for a parent product
   * Returns all products where variant_of matches the parent's SKU
   */
  async getVariants(parentSku: string): Promise<Product[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE variant_of = ? AND is_visible = 1
      ORDER BY title ASC
    `).bind(parentSku).all<Product>();

    return result.results || [];
  }

  /**
   * Get parent product for a variant
   * Returns the parent product if this is a variant
   */
  async getParentProduct(variantOf: string): Promise<Product | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE sku = ? AND is_visible = 1
      LIMIT 1
    `).bind(variantOf).first<Product>();

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
   * Get category IDs that have at least one visible product (excludes templates)
   */
  async getCategoryIdsWithProducts(): Promise<Set<string>> {
    const result = await this.db.prepare(`
      SELECT categories FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND categories IS NOT NULL
    `).all<{ categories: string }>();

    const categoryIds = new Set<string>();
    for (const row of result.results || []) {
      try {
        const ids = JSON.parse(row.categories) as string[];
        ids.forEach(id => categoryIds.add(id));
      } catch {
        // Skip invalid JSON
      }
    }
    return categoryIds;
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
   * Get subcategories of a category (direct children only)
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
   * Get all descendant category IDs recursively (children, grandchildren, etc.)
   */
  async getAllDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const allIds: string[] = [];
    const queue: string[] = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await this.getSubcategories(currentId);
      for (const child of children) {
        allIds.push(child.id);
        queue.push(child.id);
      }
    }

    return allIds;
  }

  /**
   * Get products from a category AND all its subcategories (including nested)
   * Used for top-level category pages to show all products in that tree
   */
  async getProductsInCategoryTree(categoryId: string, limit: number = 50): Promise<Product[]> {
    // Get all descendant category IDs recursively
    const descendantIds = await this.getAllDescendantCategoryIds(categoryId);
    const allCategoryIds = [categoryId, ...descendantIds];

    // Build a query that matches any of these category IDs in the JSON array
    // We use multiple LIKE conditions joined with OR
    const conditions = allCategoryIds.map(() => 'categories LIKE ?').join(' OR ');
    const params = allCategoryIds.map(id => `%"${id}"%`);

    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND (${conditions})
      ORDER BY title ASC
      LIMIT ?
    `).bind(...params, limit).all<Product>();

    return this.fillVariantImages(result.results || []);
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
   * Get brands that have at least one visible product (excludes templates)
   */
  async getBrandsWithProducts(): Promise<Brand[]> {
    const result = await this.db.prepare(`
      SELECT DISTINCT b.* FROM storefront_brands b
      INNER JOIN storefront_products p ON p.brand_id = b.id
      WHERE b.is_visible = 1 AND p.is_visible = 1 AND (p.variant_of IS NULL OR p.variant_of = '')
        AND (p.has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = p.sku AND v.is_visible = 1))
      ORDER BY b.sort_order ASC, b.title ASC
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
   * Get featured brands for the brand scroll component
   * Returns brands marked as is_featured=1 with logo images
   */
  async getFeaturedBrands(limit: number = 12): Promise<Brand[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_brands
      WHERE is_visible = 1 AND is_featured = 1
        AND (logo_cf_image_id IS NOT NULL OR logo_url IS NOT NULL)
      ORDER BY sort_order ASC, title ASC
      LIMIT ?
    `).bind(limit).all<Brand>();

    return result.results || [];
  }

  /**
   * Search products using FTS5 full-text search with BM25 relevance ranking.
   * Falls back to LIKE search if FTS5 table doesn't exist.
   * Uses search_boost field for ranking control.
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    // Build FTS5 match expression
    const cleaned = query.replace(/['"*^${}[\]()]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);

    if (words.length === 0) return [];

    // Try FTS5 search first
    try {
      // For single word: prefix match. For multi-word: phrase prefix match.
      const ftsMatch = words.length === 1
        ? `"${words[0]}"*`
        : `"${words.join(' ')}"*`;

      const result = await this.db.prepare(`
        SELECT p.*,
          (bm25(products_fts) * COALESCE(p.search_boost, 1.0)) as _rank
        FROM products_fts fts
        JOIN storefront_products p ON fts.rowid = p.rowid
        WHERE products_fts MATCH ?
          AND p.is_visible = 1
          AND p.has_variants = 0
          AND COALESCE(p.search_boost, 1.0) > 0
        ORDER BY _rank
        LIMIT ?
      `).bind(ftsMatch, limit).all<Product>();

      const products = result.results || [];
      if (products.length > 0) {
        return this.fillVariantImages(products);
      }

      // If FTS returned nothing, try individual word matching (OR logic)
      if (words.length > 1) {
        const orMatch = words.map(w => `"${w}"*`).join(' OR ');
        const orResult = await this.db.prepare(`
          SELECT p.*,
            (bm25(products_fts) * COALESCE(p.search_boost, 1.0)) as _rank
          FROM products_fts fts
          JOIN storefront_products p ON fts.rowid = p.rowid
          WHERE products_fts MATCH ?
            AND p.is_visible = 1
            AND p.has_variants = 0
            AND COALESCE(p.search_boost, 1.0) > 0
          ORDER BY _rank
          LIMIT ?
        `).bind(orMatch, limit).all<Product>();

        const orProducts = orResult.results || [];
        if (orProducts.length > 0) {
          return this.fillVariantImages(orProducts);
        }
      }
    } catch {
      // FTS5 table might not exist - fall back to LIKE
    }

    // Fallback: LIKE search with relevance ordering (title > SKU > description)
    const likePattern = `%${query}%`;
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND has_variants = 0
        AND COALESCE(search_boost, 1.0) > 0
        AND (title LIKE ? OR sku LIKE ? OR item_group LIKE ?)
      ORDER BY
        COALESCE(search_boost, 1.0) DESC,
        CASE
          WHEN title LIKE ? THEN 1
          WHEN sku LIKE ? THEN 2
          ELSE 3
        END,
        title ASC
      LIMIT ?
    `).bind(likePattern, likePattern, likePattern, `${query}%`, `${query}%`, limit).all<Product>();

    return this.fillVariantImages(result.results || []);
  }

  /**
   * Get featured products (products marked as is_featured=1 in ERPNext)
   * Falls back to products with prices if no featured products exist
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    // First try to get explicitly featured products
    const featured = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND is_featured = 1
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        title ASC
      LIMIT ?
    `).bind(limit).all<Product>();

    if (featured.results && featured.results.length > 0) {
      return this.fillVariantImages(featured.results);
    }

    // Fallback: get products with prices and images, prefer in-stock
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND price IS NOT NULL
        AND cf_image_id IS NOT NULL
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        created_at DESC
      LIMIT ?
    `).bind(limit).all<Product>();

    return this.fillVariantImages(result.results || []);
  }

  /**
   * Get featured product for a specific category (for nav, hero sections, etc.)
   * Returns the product marked as featured_category_id matching the category
   */
  async getFeaturedProductForCategory(categoryId: string): Promise<Product | null> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND featured_category_id = ?
      ORDER BY stock_qty DESC
      LIMIT 1
    `).bind(categoryId).first<Product>();

    return result || null;
  }

  /**
   * Get all featured products by category (keyed by category ID)
   * Useful for building nav or category grids with featured product images
   */
  async getFeaturedProductsByCategory(): Promise<Map<string, Product>> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND featured_category_id IS NOT NULL
      ORDER BY stock_qty DESC
    `).all<Product>();

    const map = new Map<string, Product>();
    for (const product of result.results || []) {
      if (product.featured_category_id && !map.has(product.featured_category_id)) {
        map.set(product.featured_category_id, product);
      }
    }
    return map;
  }

  /**
   * Get all images for a product
   * Returns images sorted by is_primary DESC, sort_order ASC
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    const result = await this.db.prepare(`
      SELECT cf_image_id, thumbnail_url, image_url, sort_order, is_primary
      FROM storefront_product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC
    `).bind(productId).all<ProductImage>();

    return result.results || [];
  }

  // ============================================================================
  // Featured Products for Mega Menu
  // ============================================================================

  /**
   * Get featured products for a category (for mega menu display)
   *
   * Logic:
   * - Returns up to 3 featured products where:
   *   1. is_featured = 1 AND product belongs to that category, OR
   *   2. is_featured = 1 AND featured_category_id matches the category
   * - Category-level = union of featured from category + all subcategories (deduplicated)
   * - Prioritizes in-stock products
   */
  async getFeaturedProductsForCategoryMenu(categoryId: string, limit: number = 3): Promise<Product[]> {
    // Get all descendant category IDs recursively
    const descendantIds = await this.getAllDescendantCategoryIds(categoryId);
    const allCategoryIds = [categoryId, ...descendantIds];

    // Build conditions for category membership or featured_category_id
    const categoryConditions = allCategoryIds.map(() => 'categories LIKE ?').join(' OR ');
    const featuredCategoryConditions = allCategoryIds.map(() => 'featured_category_id = ?').join(' OR ');

    const categoryParams = allCategoryIds.map(id => `%"${id}"%`);
    const featuredParams = allCategoryIds;

    // Query for featured products in category tree or explicitly featured for these categories
    const result = await this.db.prepare(`
      SELECT DISTINCT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND is_featured = 1
        AND (
          (${categoryConditions})
          OR (${featuredCategoryConditions})
        )
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        title ASC
      LIMIT ?
    `).bind(...categoryParams, ...featuredParams, limit).all<Product>();

    return result.results || [];
  }

  /**
   * Get featured products for a specific subcategory (for mega menu display)
   *
   * Logic:
   * - Returns up to 3 featured products where:
   *   1. is_featured = 1 AND product belongs to that subcategory, OR
   *   2. is_featured = 1 AND featured_in_subcategory_id matches
   * - Does NOT inherit from parent category
   */
  async getFeaturedProductsForSubcategoryMenu(subcategoryId: string, limit: number = 3): Promise<Product[]> {
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND (variant_of IS NULL OR variant_of = '')
        AND (has_variants = 0 OR EXISTS (SELECT 1 FROM storefront_products v WHERE v.variant_of = storefront_products.sku AND v.is_visible = 1))
        AND is_featured = 1
        AND (
          categories LIKE ?
          OR featured_in_subcategory_id = ?
        )
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        title ASC
      LIMIT ?
    `).bind(`%"${subcategoryId}"%`, subcategoryId, limit).all<Product>();

    return result.results || [];
  }

  /**
   * Get all featured products for mega menu (keyed by category ID)
   * Useful for preloading featured products for all categories at once
   * Products featured in subcategories also appear in their parent category
   */
  async getAllFeaturedProductsForMenu(): Promise<Map<string, Product[]>> {
    // Get all categories to build parent lookup
    const categoriesResult = await this.db.prepare(`
      SELECT id, parent_id FROM storefront_categories
    `).all<{ id: string; parent_id: string | null }>();

    // Build a map of category ID -> parent ID for propagation
    const parentLookup = new Map<string, string>();
    for (const cat of categoriesResult.results || []) {
      if (cat.parent_id) {
        parentLookup.set(cat.id, cat.parent_id);
      }
    }

    // Get all featured products with their categories
    // Note: We include products with variants (has_variants = 1) in featured sections
    // because template products are the main display items that link to variant selection
    const result = await this.db.prepare(`
      SELECT * FROM storefront_products
      WHERE is_visible = 1 AND is_featured = 1
      ORDER BY
        CASE WHEN stock_qty > 0 THEN 0 ELSE 1 END,
        stock_qty DESC,
        title ASC
    `).all<Product>();

    const categoryMap = new Map<string, Product[]>();

    // Helper to add product to a category and propagate to parent
    const addToCategory = (categoryId: string, product: Product) => {
      const existing = categoryMap.get(categoryId) || [];
      if (existing.length < 3 && !existing.some(p => p.id === product.id)) {
        existing.push(product);
        categoryMap.set(categoryId, existing);
      }

      // Also add to parent category (if exists)
      const parentId = parentLookup.get(categoryId);
      if (parentId) {
        const parentExisting = categoryMap.get(parentId) || [];
        if (parentExisting.length < 3 && !parentExisting.some(p => p.id === product.id)) {
          parentExisting.push(product);
          categoryMap.set(parentId, parentExisting);
        }
      }
    };

    for (const product of result.results || []) {
      // Add to explicitly featured categories (and propagate to parent)
      if (product.featured_category_id) {
        addToCategory(product.featured_category_id, product);
      }

      // Add to subcategory if explicitly featured there (and propagate to parent)
      if (product.featured_in_subcategory_id) {
        addToCategory(product.featured_in_subcategory_id, product);
      }

      // Add to all categories the product belongs to (and propagate to parents)
      if (product.categories) {
        try {
          const categoryIds = JSON.parse(product.categories) as string[];
          for (const catId of categoryIds) {
            addToCategory(catId, product);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    return categoryMap;
  }

  // ============================================================================
  // Brand-Category Associations
  // ============================================================================

  /**
   * Get brands associated with a category
   */
  async getBrandsForCategory(categoryId: string): Promise<Brand[]> {
    const result = await this.db.prepare(`
      SELECT b.* FROM storefront_brands b
      INNER JOIN brand_category_associations bca ON bca.brand_id = b.id
      WHERE bca.category_id = ? AND bca.association_type = 'category' AND b.is_visible = 1
      ORDER BY b.sort_order ASC, b.title ASC
    `).bind(categoryId).all<Brand>();

    return result.results || [];
  }

  /**
   * Get all brand-category associations in a single query (for mega menu)
   * Returns a map of categoryId -> Brand[]
   */
  async getAllCategoryBrands(): Promise<Map<string, Brand[]>> {
    const result = await this.db.prepare(`
      SELECT b.*, bca.category_id FROM storefront_brands b
      INNER JOIN brand_category_associations bca ON bca.brand_id = b.id
      WHERE bca.association_type = 'category' AND b.is_visible = 1
      ORDER BY b.sort_order ASC, b.title ASC
    `).all<Brand & { category_id: string }>();

    const map = new Map<string, Brand[]>();
    for (const row of result.results || []) {
      const categoryId = row.category_id;
      if (!map.has(categoryId)) {
        map.set(categoryId, []);
      }
      // Remove category_id from brand object before adding
      const { category_id: _, ...brand } = row;
      map.get(categoryId)!.push(brand as Brand);
    }

    return map;
  }

  /**
   * Get brands associated with a subcategory
   */
  async getBrandsForSubcategory(subcategoryId: string): Promise<Brand[]> {
    const result = await this.db.prepare(`
      SELECT b.* FROM storefront_brands b
      INNER JOIN brand_category_associations bca ON bca.brand_id = b.id
      WHERE bca.category_id = ? AND bca.association_type = 'subcategory' AND b.is_visible = 1
      ORDER BY b.sort_order ASC, b.title ASC
    `).bind(subcategoryId).all<Brand>();

    return result.results || [];
  }

  /**
   * Get categories associated with a brand
   */
  async getCategoriesForBrand(brandId: string): Promise<{ categories: Category[]; subcategories: Category[] }> {
    const categoriesResult = await this.db.prepare(`
      SELECT c.* FROM storefront_categories c
      INNER JOIN brand_category_associations bca ON bca.category_id = c.id
      WHERE bca.brand_id = ? AND bca.association_type = 'category' AND c.is_visible = 1
      ORDER BY c.sort_order ASC, c.title ASC
    `).bind(brandId).all<Category>();

    const subcategoriesResult = await this.db.prepare(`
      SELECT c.* FROM storefront_categories c
      INNER JOIN brand_category_associations bca ON bca.category_id = c.id
      WHERE bca.brand_id = ? AND bca.association_type = 'subcategory' AND c.is_visible = 1
      ORDER BY c.sort_order ASC, c.title ASC
    `).bind(brandId).all<Category>();

    return {
      categories: categoriesResult.results || [],
      subcategories: subcategoriesResult.results || [],
    };
  }

  /**
   * Set brand-category associations (replaces existing)
   */
  async setBrandCategoryAssociations(
    brandId: string,
    categoryIds: string[],
    subcategoryIds: string[]
  ): Promise<void> {
    // Delete existing associations
    await this.db.prepare('DELETE FROM brand_category_associations WHERE brand_id = ?')
      .bind(brandId).run();

    // Insert category associations
    for (const categoryId of categoryIds) {
      const id = crypto.randomUUID().replace(/-/g, '');
      await this.db.prepare(`
        INSERT INTO brand_category_associations (id, brand_id, category_id, association_type)
        VALUES (?, ?, ?, 'category')
      `).bind(id, brandId, categoryId).run();
    }

    // Insert subcategory associations
    for (const subcategoryId of subcategoryIds) {
      const id = crypto.randomUUID().replace(/-/g, '');
      await this.db.prepare(`
        INSERT INTO brand_category_associations (id, brand_id, category_id, association_type)
        VALUES (?, ?, ?, 'subcategory')
      `).bind(id, brandId, subcategoryId).run();
    }
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
// Article Types and Methods (for /learn/archives/ section)
// ============================================================================

export type ArticleSection = 'knowledge-base' | 'guides' | 'faq' | 'videos' | 'payments';

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  section: ArticleSection;
  category: string | null;
  tags: string | null; // JSON array
  related_articles: string | null; // JSON array of slugs
  related_products: string | null; // JSON array of SKUs
  source_url: string | null;
  source_id: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Parse JSON array fields from Article
 */
export function parseArticleTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

export function parseRelatedArticles(relatedJson: string | null): string[] {
  if (!relatedJson) return [];
  try {
    return JSON.parse(relatedJson);
  } catch {
    return [];
  }
}

export function parseRelatedProducts(relatedJson: string | null): string[] {
  if (!relatedJson) return [];
  try {
    return JSON.parse(relatedJson);
  } catch {
    return [];
  }
}

/**
 * Get articles by section with optional limit
 */
export async function getArticlesBySection(
  db: D1Database,
  section: ArticleSection,
  limit = 50
): Promise<Article[]> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE section = ? ORDER BY updated_at DESC LIMIT ?')
    .bind(section, limit)
    .all<Article>();
  return result.results || [];
}

/**
 * Get all articles across all sections
 */
export async function getAllArticles(
  db: D1Database,
  limit = 100
): Promise<Article[]> {
  const result = await db
    .prepare('SELECT * FROM articles ORDER BY updated_at DESC LIMIT ?')
    .bind(limit)
    .all<Article>();
  return result.results || [];
}

/**
 * Get single article by slug
 */
export async function getArticleBySlug(
  db: D1Database,
  slug: string
): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE slug = ?')
    .bind(slug)
    .first<Article>();
  return result || null;
}

/**
 * Get article by source URL (for redirects from old Intercom URLs)
 */
export async function getArticleBySourceUrl(
  db: D1Database,
  sourceUrl: string
): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE source_url = ?')
    .bind(sourceUrl)
    .first<Article>();
  return result || null;
}

/**
 * Get article by source ID (Intercom article ID)
 */
export async function getArticleBySourceId(
  db: D1Database,
  sourceId: string
): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE source_id = ?')
    .bind(sourceId)
    .first<Article>();
  return result || null;
}

/**
 * Search articles by title or content
 */
export async function searchArticles(
  db: D1Database,
  query: string,
  limit = 20
): Promise<Article[]> {
  const result = await db
    .prepare(`
      SELECT * FROM articles
      WHERE title LIKE ? OR content LIKE ? OR excerpt LIKE ?
      ORDER BY updated_at DESC
      LIMIT ?
    `)
    .bind(`%${query}%`, `%${query}%`, `%${query}%`, limit)
    .all<Article>();
  return result.results || [];
}

/**
 * Get related articles by slugs
 */
export async function getRelatedArticlesBySlugs(
  db: D1Database,
  slugs: string[]
): Promise<Article[]> {
  if (slugs.length === 0) return [];

  const placeholders = slugs.map(() => '?').join(', ');
  const result = await db
    .prepare(`SELECT * FROM articles WHERE slug IN (${placeholders})`)
    .bind(...slugs)
    .all<Article>();
  return result.results || [];
}

/**
 * Upsert article (for sync from ERPNext or migration)
 */
export async function upsertArticle(
  db: D1Database,
  article: Omit<Article, 'created_at' | 'updated_at'>
): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(`
      INSERT INTO articles (
        id, slug, title, content, excerpt, section, category, tags,
        related_articles, related_products, source_url, source_id, author,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        content = excluded.content,
        excerpt = excluded.excerpt,
        section = excluded.section,
        category = excluded.category,
        tags = excluded.tags,
        related_articles = excluded.related_articles,
        related_products = excluded.related_products,
        source_url = excluded.source_url,
        source_id = excluded.source_id,
        author = excluded.author,
        updated_at = excluded.updated_at
    `)
    .bind(
      article.id,
      article.slug,
      article.title,
      article.content,
      article.excerpt,
      article.section,
      article.category,
      article.tags,
      article.related_articles,
      article.related_products,
      article.source_url,
      article.source_id,
      article.author,
      now,
      now
    )
    .run();
}

/**
 * Get article count by section
 */
export async function getArticleCountBySection(
  db: D1Database
): Promise<Record<ArticleSection, number>> {
  const result = await db
    .prepare(`
      SELECT section, COUNT(*) as count
      FROM articles
      GROUP BY section
    `)
    .all<{ section: ArticleSection; count: number }>();

  const counts: Record<ArticleSection, number> = {
    'knowledge-base': 0,
    'guides': 0,
    'faq': 0,
    'videos': 0,
    'payments': 0,
  };

  for (const row of result.results || []) {
    counts[row.section] = row.count;
  }

  return counts;
}
