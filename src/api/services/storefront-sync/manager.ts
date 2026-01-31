/**
 * Storefront Sync Logic
 * Full and incremental sync from ERPNext to D1
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { D1Product, D1Category, D1Brand, D1SyncState, CreateD1Product, CreateD1Category, CreateD1Brand } from './types';
import {
  transformItem,
  transformItemGroup,
  transformBrand,
  hasProductChanged,
  hasCategoryChanged,
  hasBrandChanged,
  type ERPNextItem,
  type ERPNextItemGroup,
  type ERPNextBrand,
  type ERPNextItemPrice,
} from './transforms';

export interface SyncResult {
  entity_type: 'product' | 'category' | 'brand';
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: Array<{ id: string; error: string }>;
  duration_ms: number;
}

export interface FullSyncOptions {
  batchSize?: number;
  dryRun?: boolean;
}

/**
 * Storefront Sync Manager
 * Handles full and incremental sync operations
 */
export class StorefrontSyncManager {
  constructor(private db: D1Database) {}

  // ============================================================================
  // Brand Sync
  // ============================================================================

  async syncBrands(
    brands: ERPNextBrand[],
    options: FullSyncOptions = {}
  ): Promise<SyncResult> {
    const { dryRun = false } = options;
    const start = Date.now();
    const result: SyncResult = {
      entity_type: 'brand',
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: [],
      duration_ms: 0,
    };

    // Get existing brands
    const existingBrands = await this.db
      .prepare('SELECT * FROM storefront_brands')
      .all<D1Brand>();
    const existingMap = new Map(
      existingBrands.results.map(b => [b.erpnext_name, b])
    );

    // Track which ERPNext brands we've seen
    const seenErpnextNames = new Set<string>();

    for (const brand of brands) {
      try {
        seenErpnextNames.add(brand.name);
        const existing = existingMap.get(brand.name);

        const transformed = transformBrand(brand, {
          existingId: existing?.id,
        });

        if (existing) {
          // Check if update needed
          if (hasBrandChanged(existing, transformed)) {
            if (!dryRun) {
              await this.upsertBrand(transformed);
              await this.logSync('brand', transformed.id, 'update', 'success');
            }
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          // Create new
          if (!dryRun) {
            await this.upsertBrand(transformed);
            await this.logSync('brand', transformed.id, 'create', 'success');
          }
          result.created++;
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        result.errors.push({ id: brand.name, error: errMsg });
        if (!dryRun) {
          await this.logSync('brand', brand.name, 'update', 'error', errMsg);
        }
      }
    }

    // Handle deletions (brands in D1 but not in ERPNext)
    for (const [erpnextName, existing] of existingMap) {
      if (!seenErpnextNames.has(erpnextName)) {
        if (!dryRun) {
          await this.db
            .prepare('DELETE FROM storefront_brands WHERE id = ?')
            .bind(existing.id)
            .run();
          await this.logSync('brand', existing.id, 'delete', 'success');
        }
        result.deleted++;
      }
    }

    // Update sync state
    if (!dryRun) {
      await this.updateSyncState('brand', new Date().toISOString());
    }

    result.duration_ms = Date.now() - start;
    return result;
  }

  // ============================================================================
  // Category Sync
  // ============================================================================

  async syncCategories(
    groups: ERPNextItemGroup[],
    options: FullSyncOptions = {}
  ): Promise<SyncResult> {
    const { dryRun = false } = options;
    const start = Date.now();
    const result: SyncResult = {
      entity_type: 'category',
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: [],
      duration_ms: 0,
    };

    // Get existing categories
    const existingCats = await this.db
      .prepare('SELECT * FROM storefront_categories')
      .all<D1Category>();
    const existingMap = new Map(
      existingCats.results.map(c => [c.erpnext_name, c])
    );

    // Build parent ID map (ERPNext name → D1 ID)
    // First pass: assign IDs to all categories
    const parentMap = new Map<string, string>();
    for (const group of groups) {
      const existing = existingMap.get(group.name);
      const id = existing?.id || crypto.randomUUID();
      parentMap.set(group.name, id);
    }

    // Sort groups so parents come before children (topological sort)
    // This is required because of FOREIGN KEY constraint on parent_id
    const sortedGroups = this.sortCategoriesByHierarchy(groups);

    // Track which ERPNext groups we've seen
    const seenErpnextNames = new Set<string>();

    // Second pass: transform and collect for batch upsert (parent-first order)
    const toUpsert: CreateD1Category[] = [];

    for (const group of sortedGroups) {
      seenErpnextNames.add(group.name);
      const existing = existingMap.get(group.name);

      const transformed = transformItemGroup(group, {
        existingId: parentMap.get(group.name),
        parentMap,
      });

      if (existing) {
        if (hasCategoryChanged(existing, transformed)) {
          toUpsert.push(transformed);
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        toUpsert.push(transformed);
        result.created++;
      }
    }

    // Batch upsert categories (in parent-first order)
    if (!dryRun && toUpsert.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
        const batch = toUpsert.slice(i, i + BATCH_SIZE);
        const statements = batch.map(cat =>
          this.db.prepare(`
            INSERT INTO storefront_categories (id, erpnext_name, title, slug, parent_id, sort_order, is_visible, cf_image_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              slug = excluded.slug,
              parent_id = excluded.parent_id,
              sort_order = excluded.sort_order,
              is_visible = excluded.is_visible,
              cf_image_id = excluded.cf_image_id
          `).bind(
            cat.id,
            cat.erpnext_name,
            cat.title,
            cat.slug,
            cat.parent_id || null,
            cat.sort_order || 0,
            cat.is_visible ? 1 : 0,
            cat.cf_image_id || null
          )
        );
        try {
          await this.db.batch(statements);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({ id: `batch-${i}`, error: errMsg });
        }
      }
    }

    // Handle deletions (children first to respect foreign key)
    // First, collect categories to delete
    const toDelete: Array<{ id: string; erpnext_name: string; parent_id: string | null }> = [];
    for (const [erpnextName, existing] of existingMap) {
      if (!seenErpnextNames.has(erpnextName)) {
        toDelete.push({
          id: existing.id,
          erpnext_name: erpnextName,
          parent_id: existing.parent_id,
        });
      }
    }

    // Sort so children come before parents (reverse of insertion order)
    // Categories with parent_id pointing to another deleted category should come first
    const deleteIds = new Set(toDelete.map(d => d.id));
    toDelete.sort((a, b) => {
      const aHasDeletedParent = a.parent_id && deleteIds.has(a.parent_id) ? 1 : 0;
      const bHasDeletedParent = b.parent_id && deleteIds.has(b.parent_id) ? 1 : 0;
      return bHasDeletedParent - aHasDeletedParent; // Children first
    });

    // Delete in sorted order
    for (const cat of toDelete) {
      if (!dryRun) {
        try {
          // First, set parent_id to NULL for any children referencing this category
          await this.db
            .prepare('UPDATE storefront_categories SET parent_id = NULL WHERE parent_id = ?')
            .bind(cat.id)
            .run();
          // Then delete
          await this.db
            .prepare('DELETE FROM storefront_categories WHERE id = ?')
            .bind(cat.id)
            .run();
          await this.logSync('category', cat.id, 'delete', 'success');
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({ id: cat.erpnext_name, error: `Delete failed: ${errMsg}` });
        }
      }
      result.deleted++;
    }

    if (!dryRun) {
      await this.updateSyncState('category', new Date().toISOString());
    }

    result.duration_ms = Date.now() - start;
    return result;
  }

  // ============================================================================
  // Product Sync
  // ============================================================================

  async syncProducts(
    items: ERPNextItem[],
    prices: Map<string, ERPNextItemPrice[]>,
    options: FullSyncOptions = {}
  ): Promise<SyncResult> {
    const { batchSize = 100, dryRun = false } = options;
    const start = Date.now();
    const result: SyncResult = {
      entity_type: 'product',
      created: 0,
      updated: 0,
      deleted: 0,
      skipped: 0,
      errors: [],
      duration_ms: 0,
    };

    // Get existing products
    const existingProducts = await this.db
      .prepare('SELECT * FROM storefront_products')
      .all<D1Product>();
    const existingMap = new Map(
      existingProducts.results.map(p => [p.erpnext_name, p])
    );

    // Get brand and category maps for foreign key resolution
    const brandMap = await this.getBrandMap();
    const categoryMap = await this.getCategoryMap();

    // Track which ERPNext items we've seen
    const seenErpnextNames = new Set<string>();

    // Collect all products to upsert
    const toUpsert: CreateD1Product[] = [];

    for (const item of items) {
      seenErpnextNames.add(item.name);
      const existing = existingMap.get(item.name);
      const itemPrices = prices.get(item.item_code) || [];

      const transformed = transformItem(item, {
        existingId: existing?.id,
        prices: itemPrices,
        brandMap,
        categoryMap,
      });

      if (existing) {
        if (hasProductChanged(existing, transformed)) {
          toUpsert.push(transformed);
          result.updated++;
        } else {
          result.skipped++;
        }
      } else {
        toUpsert.push(transformed);
        result.created++;
      }
    }

    // Batch upsert products
    if (!dryRun && toUpsert.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
        const batch = toUpsert.slice(i, i + BATCH_SIZE);
        const statements = batch.map(product =>
          this.db.prepare(`
            INSERT INTO storefront_products (
              id, erpnext_name, sku, title, description, brand_id, item_group, categories,
              price, sale_price, stock_qty, is_visible, cf_image_id, thumbnail_url, image_url, weight_lbs,
              has_variants, variant_of, is_featured, featured_category_id,
              shipping_weight, shipping_weight_uom, shipping_length, shipping_width, shipping_height, shipping_dimension_uom,
              ships_usps, ships_ups, ships_ltl, ships_pickup,
              hazmat_flag, hazmat_class, oversized_flag, inherit_shipping_from_parent, search_boost
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              sku = excluded.sku,
              title = excluded.title,
              description = excluded.description,
              brand_id = excluded.brand_id,
              item_group = excluded.item_group,
              categories = excluded.categories,
              price = excluded.price,
              sale_price = excluded.sale_price,
              stock_qty = excluded.stock_qty,
              is_visible = excluded.is_visible,
              cf_image_id = excluded.cf_image_id,
              thumbnail_url = excluded.thumbnail_url,
              image_url = excluded.image_url,
              weight_lbs = excluded.weight_lbs,
              has_variants = excluded.has_variants,
              variant_of = excluded.variant_of,
              is_featured = excluded.is_featured,
              featured_category_id = excluded.featured_category_id,
              shipping_weight = excluded.shipping_weight,
              shipping_weight_uom = excluded.shipping_weight_uom,
              shipping_length = excluded.shipping_length,
              shipping_width = excluded.shipping_width,
              shipping_height = excluded.shipping_height,
              shipping_dimension_uom = excluded.shipping_dimension_uom,
              ships_usps = excluded.ships_usps,
              ships_ups = excluded.ships_ups,
              ships_ltl = excluded.ships_ltl,
              ships_pickup = excluded.ships_pickup,
              hazmat_flag = excluded.hazmat_flag,
              hazmat_class = excluded.hazmat_class,
              oversized_flag = excluded.oversized_flag,
              inherit_shipping_from_parent = excluded.inherit_shipping_from_parent,
              search_boost = excluded.search_boost,
              updated_at = CURRENT_TIMESTAMP
          `).bind(
            product.id,
            product.erpnext_name,
            product.sku || null,
            product.title,
            product.description || null,
            product.brand_id || null,
            product.item_group || null,
            product.categories ? JSON.stringify(product.categories) : null,
            product.price || null,
            product.sale_price || null,
            product.stock_qty || 0,
            product.is_visible ? 1 : 0,
            product.cf_image_id || null,
            product.thumbnail_url || null,
            product.image_url || null,
            product.weight_lbs || null,
            product.has_variants ? 1 : 0,
            product.variant_of || null,
            product.is_featured ? 1 : 0,
            product.featured_category_id || null,
            product.shipping_weight || null,
            product.shipping_weight_uom || null,
            product.shipping_length || null,
            product.shipping_width || null,
            product.shipping_height || null,
            product.shipping_dimension_uom || null,
            product.ships_usps ? 1 : 0,
            product.ships_ups ? 1 : 0,
            product.ships_ltl ? 1 : 0,
            product.ships_pickup ? 1 : 0,
            product.hazmat_flag ? 1 : 0,
            product.hazmat_class || null,
            product.oversized_flag ? 1 : 0,
            product.inherit_shipping_from_parent ? 1 : 0,
            product.search_boost ?? 1.0
          )
        );
        try {
          await this.db.batch(statements);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({ id: `product-batch-${i}`, error: errMsg });
        }
      }
    }

    // Handle deletions (batch)
    const toDeleteIds: string[] = [];
    for (const [erpnextName, existing] of existingMap) {
      if (!seenErpnextNames.has(erpnextName)) {
        toDeleteIds.push(existing.id);
        result.deleted++;
      }
    }

    if (!dryRun && toDeleteIds.length > 0) {
      const BATCH_SIZE = 50;
      for (let i = 0; i < toDeleteIds.length; i += BATCH_SIZE) {
        const batch = toDeleteIds.slice(i, i + BATCH_SIZE);
        const statements = batch.map(id =>
          this.db.prepare('DELETE FROM storefront_products WHERE id = ?').bind(id)
        );
        try {
          await this.db.batch(statements);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          result.errors.push({ id: `delete-batch-${i}`, error: errMsg });
        }
      }
    }

    if (!dryRun) {
      await this.updateSyncState('product', new Date().toISOString());
    }

    result.duration_ms = Date.now() - start;
    return result;
  }

  // ============================================================================
  // Single Item Sync (for webhook-triggered updates)
  // ============================================================================

  async syncSingleProduct(
    item: ERPNextItem,
    prices: ERPNextItemPrice[]
  ): Promise<{ action: 'created' | 'updated' | 'skipped'; id: string }> {
    const existing = await this.db
      .prepare('SELECT * FROM storefront_products WHERE erpnext_name = ?')
      .bind(item.name)
      .first<D1Product>();

    const brandMap = await this.getBrandMap();
    const categoryMap = await this.getCategoryMap();

    const transformed = transformItem(item, {
      existingId: existing?.id,
      prices,
      brandMap,
      categoryMap,
    });

    if (existing) {
      if (hasProductChanged(existing, transformed)) {
        await this.upsertProduct(transformed);
        await this.logSync('product', transformed.id, 'update', 'success');
        return { action: 'updated', id: transformed.id };
      }
      return { action: 'skipped', id: existing.id };
    }

    await this.upsertProduct(transformed);
    await this.logSync('product', transformed.id, 'create', 'success');
    return { action: 'created', id: transformed.id };
  }

  async syncSingleBrand(brand: ERPNextBrand): Promise<{ action: 'created' | 'updated' | 'skipped'; id: string }> {
    const existing = await this.db
      .prepare('SELECT * FROM storefront_brands WHERE erpnext_name = ?')
      .bind(brand.name)
      .first<D1Brand>();

    const transformed = transformBrand(brand, { existingId: existing?.id });

    if (existing) {
      if (hasBrandChanged(existing, transformed)) {
        await this.upsertBrand(transformed);
        await this.logSync('brand', transformed.id, 'update', 'success');
        return { action: 'updated', id: transformed.id };
      }
      return { action: 'skipped', id: existing.id };
    }

    await this.upsertBrand(transformed);
    await this.logSync('brand', transformed.id, 'create', 'success');
    return { action: 'created', id: transformed.id };
  }

  async syncSingleCategory(group: ERPNextItemGroup): Promise<{ action: 'created' | 'updated' | 'skipped'; id: string }> {
    const existing = await this.db
      .prepare('SELECT * FROM storefront_categories WHERE erpnext_name = ?')
      .bind(group.name)
      .first<D1Category>();

    // Get parent map for foreign key resolution
    const allCats = await this.db
      .prepare('SELECT id, erpnext_name FROM storefront_categories')
      .all<{ id: string; erpnext_name: string }>();
    const parentMap = new Map(allCats.results.map(c => [c.erpnext_name, c.id]));

    const transformed = transformItemGroup(group, {
      existingId: existing?.id,
      parentMap,
    });

    if (existing) {
      if (hasCategoryChanged(existing, transformed)) {
        await this.upsertCategory(transformed);
        await this.logSync('category', transformed.id, 'update', 'success');
        return { action: 'updated', id: transformed.id };
      }
      return { action: 'skipped', id: existing.id };
    }

    await this.upsertCategory(transformed);
    await this.logSync('category', transformed.id, 'create', 'success');
    return { action: 'created', id: transformed.id };
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private async getBrandMap(): Promise<Map<string, string>> {
    const brands = await this.db
      .prepare('SELECT id, erpnext_name FROM storefront_brands')
      .all<{ id: string; erpnext_name: string }>();
    return new Map(brands.results.map(b => [b.erpnext_name, b.id]));
  }

  private async getCategoryMap(): Promise<Map<string, string>> {
    const cats = await this.db
      .prepare('SELECT id, erpnext_name FROM storefront_categories')
      .all<{ id: string; erpnext_name: string }>();
    return new Map(cats.results.map(c => [c.erpnext_name, c.id]));
  }

  private async upsertProduct(product: CreateD1Product): Promise<void> {
    const now = new Date().toISOString();
    await this.db
      .prepare(`
        INSERT INTO storefront_products (
          id, erpnext_name, sku, title, description, brand_id, price, sale_price, stock_qty, is_visible,
          cf_image_id, weight_lbs, categories, has_variants, variant_of, is_featured, featured_category_id,
          shipping_weight, shipping_weight_uom, shipping_length, shipping_width, shipping_height, shipping_dimension_uom,
          ships_usps, ships_ups, ships_ltl, ships_pickup,
          hazmat_flag, hazmat_class, oversized_flag, inherit_shipping_from_parent, search_boost,
          updated_at, synced_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          sku = excluded.sku,
          title = excluded.title,
          description = excluded.description,
          brand_id = excluded.brand_id,
          price = excluded.price,
          sale_price = excluded.sale_price,
          stock_qty = excluded.stock_qty,
          is_visible = excluded.is_visible,
          cf_image_id = excluded.cf_image_id,
          weight_lbs = excluded.weight_lbs,
          categories = excluded.categories,
          has_variants = excluded.has_variants,
          variant_of = excluded.variant_of,
          is_featured = excluded.is_featured,
          featured_category_id = excluded.featured_category_id,
          shipping_weight = excluded.shipping_weight,
          shipping_weight_uom = excluded.shipping_weight_uom,
          shipping_length = excluded.shipping_length,
          shipping_width = excluded.shipping_width,
          shipping_height = excluded.shipping_height,
          shipping_dimension_uom = excluded.shipping_dimension_uom,
          ships_usps = excluded.ships_usps,
          ships_ups = excluded.ships_ups,
          ships_ltl = excluded.ships_ltl,
          ships_pickup = excluded.ships_pickup,
          hazmat_flag = excluded.hazmat_flag,
          hazmat_class = excluded.hazmat_class,
          oversized_flag = excluded.oversized_flag,
          inherit_shipping_from_parent = excluded.inherit_shipping_from_parent,
          search_boost = excluded.search_boost,
          updated_at = excluded.updated_at,
          synced_at = excluded.synced_at
      `)
      .bind(
        product.id,
        product.erpnext_name,
        product.sku || null,
        product.title,
        product.description || null,
        product.brand_id || null,
        product.price || null,
        product.sale_price || null,
        product.stock_qty || 0,
        product.is_visible ? 1 : 0,
        product.cf_image_id || null,
        product.weight_lbs || null,
        product.categories ? JSON.stringify(product.categories) : null,
        product.has_variants ? 1 : 0,
        product.variant_of || null,
        product.is_featured ? 1 : 0,
        product.featured_category_id || null,
        product.shipping_weight || null,
        product.shipping_weight_uom || null,
        product.shipping_length || null,
        product.shipping_width || null,
        product.shipping_height || null,
        product.shipping_dimension_uom || null,
        product.ships_usps ? 1 : 0,
        product.ships_ups ? 1 : 0,
        product.ships_ltl ? 1 : 0,
        product.ships_pickup ? 1 : 0,
        product.hazmat_flag ? 1 : 0,
        product.hazmat_class || null,
        product.oversized_flag ? 1 : 0,
        product.inherit_shipping_from_parent ? 1 : 0,
        product.search_boost ?? 1.0,
        now,
        now
      )
      .run();
  }

  private async upsertCategory(category: CreateD1Category): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO storefront_categories (id, erpnext_name, title, slug, parent_id, sort_order, is_visible, cf_image_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          parent_id = excluded.parent_id,
          sort_order = excluded.sort_order,
          is_visible = excluded.is_visible,
          cf_image_id = excluded.cf_image_id
      `)
      .bind(
        category.id,
        category.erpnext_name,
        category.title,
        category.slug,
        category.parent_id || null,
        category.sort_order || 0,
        category.is_visible ? 1 : 0,
        category.cf_image_id || null
      )
      .run();
  }

  private async upsertBrand(brand: CreateD1Brand): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO storefront_brands (id, erpnext_name, title, slug, logo_cf_image_id, is_visible)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          logo_cf_image_id = excluded.logo_cf_image_id,
          is_visible = excluded.is_visible
      `)
      .bind(
        brand.id,
        brand.erpnext_name,
        brand.title,
        brand.slug,
        brand.logo_cf_image_id || null,
        brand.is_visible ? 1 : 0
      )
      .run();
  }

  private async logSync(
    entityType: string,
    entityId: string,
    action: string,
    status: string,
    errorMessage?: string
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO sync_log (entity_type, entity_id, action, status, error_message)
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(entityType, entityId, action, status, errorMessage || null)
      .run();
  }

  private async updateSyncState(entityType: string, timestamp: string): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO sync_state (entity_type, last_sync_at)
        VALUES (?, ?)
        ON CONFLICT(entity_type) DO UPDATE SET
          last_sync_at = excluded.last_sync_at
      `)
      .bind(entityType, timestamp)
      .run();
  }

  async getSyncState(entityType: string): Promise<D1SyncState | null> {
    return this.db
      .prepare('SELECT * FROM sync_state WHERE entity_type = ?')
      .bind(entityType)
      .first<D1SyncState>();
  }

  async getSyncStats(): Promise<{
    products: number;
    categories: number;
    brands: number;
    lastSync: { [key: string]: string | null };
  }> {
    const [products, categories, brands, syncStates] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM storefront_products').first<{ count: number }>(),
      this.db.prepare('SELECT COUNT(*) as count FROM storefront_categories').first<{ count: number }>(),
      this.db.prepare('SELECT COUNT(*) as count FROM storefront_brands').first<{ count: number }>(),
      this.db.prepare('SELECT * FROM sync_state').all<D1SyncState>(),
    ]);

    const lastSync: { [key: string]: string | null } = {};
    for (const state of syncStates.results) {
      lastSync[state.entity_type] = state.last_sync_at;
    }

    return {
      products: products?.count || 0,
      categories: categories?.count || 0,
      brands: brands?.count || 0,
      lastSync,
    };
  }

  /**
   * Sort categories so parents come before children (topological sort)
   * Required for FOREIGN KEY constraint on parent_id
   */
  private sortCategoriesByHierarchy(groups: ERPNextItemGroup[]): ERPNextItemGroup[] {
    // Build a map of name -> group for quick lookup
    const groupMap = new Map<string, ERPNextItemGroup>();
    for (const group of groups) {
      groupMap.set(group.name, group);
    }

    // Build adjacency: parent -> children
    const childrenOf = new Map<string, string[]>();
    const roots: string[] = [];

    for (const group of groups) {
      const parentName = group.parent_item_group;
      if (!parentName || parentName === 'All Item Groups' || !groupMap.has(parentName)) {
        // Root category (no parent or parent not in our list)
        roots.push(group.name);
      } else {
        // Has a parent in our list
        if (!childrenOf.has(parentName)) {
          childrenOf.set(parentName, []);
        }
        childrenOf.get(parentName)!.push(group.name);
      }
    }

    // BFS from roots to get parent-first order
    const sorted: ERPNextItemGroup[] = [];
    const queue = [...roots];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const name = queue.shift()!;
      if (visited.has(name)) continue;
      visited.add(name);

      const group = groupMap.get(name);
      if (group) {
        sorted.push(group);
      }

      // Add children to queue
      const children = childrenOf.get(name) || [];
      for (const child of children) {
        if (!visited.has(child)) {
          queue.push(child);
        }
      }
    }

    // Add any orphans that weren't visited (shouldn't happen, but just in case)
    for (const group of groups) {
      if (!visited.has(group.name)) {
        sorted.push(group);
      }
    }

    return sorted;
  }
}
