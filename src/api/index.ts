/**
 * Hono API Router
 *
 * Handles /api/* routes for solampio-web.
 * Integrated into the Qwik City entry point.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { D1Database, Ai } from '@cloudflare/workers-types';

// Environment bindings type
export interface Env {
  // D1 Database
  DB: D1Database;
  // Workers AI
  AI: Ai;
  // Cloudflare Pages assets (required by Qwik City)
  ASSETS: { fetch: (req: Request) => Response };
  // ERPNext credentials (secrets)
  ERPNEXT_URL?: string;
  ERPNEXT_API_KEY?: string;
  ERPNEXT_API_SECRET?: string;
  // Environment
  ENVIRONMENT?: string;
}

export const api = new Hono<{ Bindings: Env }>().basePath('/api');

// CORS middleware for API routes
api.use('*', cors({
  origin: [
    'http://localhost:5173',        // Local Qwik dev server
    'http://localhost:8788',        // Local Pages preview
    'https://solampio.com',         // Production website
    'https://solampio.pages.dev',   // Cloudflare Pages preview
  ],
  credentials: true,
}));

// ============================================================================
// Health Check
// ============================================================================

api.get('/health', async (c) => {
  // Verify D1 is accessible
  let dbStatus = 'unknown';
  try {
    const result = await c.env.DB.prepare('SELECT 1').first();
    dbStatus = result ? 'connected' : 'error';
  } catch {
    dbStatus = 'error';
  }

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'production',
    bindings: {
      db: dbStatus,
      ai: c.env.AI ? 'available' : 'missing',
    },
  });
});

// ============================================================================
// Storefront API - Products
// ============================================================================

/**
 * GET /api/products
 * List products with filtering and pagination
 */
api.get('/products', async (c) => {
  const {
    category,
    brand,
    search,
    page = '1',
    limit = '50',
    sort = 'title',
    order = 'asc'
  } = c.req.query();

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Build query - exclude templates (has_variants=1) from listings
  let query = 'SELECT * FROM storefront_products WHERE is_visible = 1 AND has_variants = 0';
  const params: unknown[] = [];

  if (category) {
    query += ' AND categories LIKE ?';
    params.push(`%"${category}"%`);
  }

  if (brand) {
    query += ' AND brand_id = ?';
    params.push(brand);
  }

  if (search) {
    query += ' AND (title LIKE ? OR sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // Add sorting
  const validSorts = ['title', 'price', 'created_at'];
  const sortColumn = validSorts.includes(sort) ? sort : 'title';
  const orderDirection = order === 'desc' ? 'DESC' : 'ASC';
  query += ` ORDER BY ${sortColumn} ${orderDirection}`;

  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const result = await c.env.DB.prepare(query).bind(...params).all();

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM storefront_products WHERE is_visible = 1 AND has_variants = 0';
  const countParams: unknown[] = [];

  if (category) {
    countQuery += ' AND categories LIKE ?';
    countParams.push(`%"${category}"%`);
  }

  if (brand) {
    countQuery += ' AND brand_id = ?';
    countParams.push(brand);
  }

  if (search) {
    countQuery += ' AND (title LIKE ? OR sku LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }

  const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();
  const total = countResult?.total || 0;

  return c.json({
    success: true,
    data: result.results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      total_pages: Math.ceil(total / limitNum),
      has_more: (pageNum * limitNum) < total
    }
  });
});

/**
 * GET /api/products/:id
 * Get single product by ID or SKU
 */
api.get('/products/:id', async (c) => {
  const id = c.req.param('id');

  const product = await c.env.DB.prepare(`
    SELECT * FROM storefront_products
    WHERE (id = ? OR sku = ? OR bc_url_slug = ?) AND is_visible = 1
    LIMIT 1
  `).bind(id, id, id).first();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  return c.json({ success: true, data: product });
});

/**
 * GET /api/products/:id/images
 * Get all images for a product
 */
api.get('/products/:id/images', async (c) => {
  const id = c.req.param('id');

  // First get the product to find its ID
  const product = await c.env.DB.prepare(`
    SELECT id FROM storefront_products
    WHERE (id = ? OR sku = ?) AND is_visible = 1
    LIMIT 1
  `).bind(id, id).first<{ id: string }>();

  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }

  // Get all images for this product
  const images = await c.env.DB.prepare(`
    SELECT cf_image_id, thumbnail_url, image_url, sort_order, is_primary
    FROM storefront_product_images
    WHERE product_id = ?
    ORDER BY is_primary DESC, sort_order ASC
  `).bind(product.id).all();

  return c.json({
    success: true,
    data: images.results,
    count: images.results?.length || 0
  });
});

// ============================================================================
// Storefront API - Categories
// ============================================================================

/**
 * GET /api/categories
 * List all categories
 */
api.get('/categories', async (c) => {
  const { parent_id, tree } = c.req.query();

  let query = 'SELECT * FROM storefront_categories WHERE is_visible = 1';
  const params: unknown[] = [];

  if (parent_id !== undefined) {
    if (parent_id === 'null') {
      query += ' AND parent_id IS NULL';
    } else {
      query += ' AND parent_id = ?';
      params.push(parent_id);
    }
  }

  query += ' ORDER BY sort_order ASC, title ASC';

  const result = await c.env.DB.prepare(query).bind(...params).all();

  // Build tree if requested
  if (tree === 'true' || tree === '1') {
    const categories = result.results || [];
    const treeData = buildCategoryTree(categories);
    return c.json({ success: true, data: treeData });
  }

  return c.json({ success: true, data: result.results });
});

// Helper to build category tree
interface CategoryNode {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  children: CategoryNode[];
  [key: string]: unknown;
}

function buildCategoryTree(categories: unknown[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  // First pass: create all nodes
  for (const cat of categories as CategoryNode[]) {
    categoryMap.set(cat.id, { ...cat, children: [] });
  }

  // Second pass: build tree
  for (const cat of categories as CategoryNode[]) {
    const node = categoryMap.get(cat.id)!;
    if (!cat.parent_id) {
      rootNodes.push(node);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  }

  // Sort children
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.title.localeCompare(b.title);
    });
    for (const node of nodes) {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };
  sortNodes(rootNodes);

  return rootNodes;
}

/**
 * GET /api/categories/:id
 * Get single category
 */
api.get('/categories/:id', async (c) => {
  const id = c.req.param('id');

  const category = await c.env.DB.prepare(`
    SELECT * FROM storefront_categories
    WHERE (id = ? OR slug = ?) AND is_visible = 1
    LIMIT 1
  `).bind(id, id).first();

  if (!category) {
    return c.json({ success: false, error: 'Category not found' }, 404);
  }

  return c.json({ success: true, data: category });
});

// ============================================================================
// Storefront API - Brands
// ============================================================================

/**
 * GET /api/brands
 * List all brands
 */
api.get('/brands', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM storefront_brands
    WHERE is_visible = 1
    ORDER BY sort_order ASC, title ASC
  `).all();

  return c.json({ success: true, data: result.results });
});

/**
 * GET /api/brands/:id
 * Get single brand
 */
api.get('/brands/:id', async (c) => {
  const id = c.req.param('id');

  const brand = await c.env.DB.prepare(`
    SELECT * FROM storefront_brands
    WHERE (id = ? OR slug = ?) AND is_visible = 1
    LIMIT 1
  `).bind(id, id).first();

  if (!brand) {
    return c.json({ success: false, error: 'Brand not found' }, 404);
  }

  return c.json({ success: true, data: brand });
});

// ============================================================================
// Search API
// ============================================================================

/**
 * GET /api/search
 * Search products
 */
api.get('/search', async (c) => {
  const { q, limit = '20' } = c.req.query();

  if (!q) {
    return c.json({ success: false, error: 'Search query required' }, 400);
  }

  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  const result = await c.env.DB.prepare(`
    SELECT * FROM storefront_products
    WHERE is_visible = 1 AND has_variants = 0
      AND (title LIKE ? OR sku LIKE ? OR description LIKE ?)
    ORDER BY
      CASE
        WHEN title LIKE ? THEN 1
        WHEN sku LIKE ? THEN 2
        ELSE 3
      END,
      title ASC
    LIMIT ?
  `).bind(
    `%${q}%`, `%${q}%`, `%${q}%`,
    `${q}%`, `${q}%`,
    limitNum
  ).all();

  return c.json({
    success: true,
    data: result.results,
    count: result.results?.length || 0
  });
});
