/**
 * Warehouse Stock Sync API Endpoint
 *
 * POST /api/warehouses/stock-sync - Sync product stock levels from ERPNext Bin
 *
 * Fetches Bin doctype from ERPNext (stock levels per item per warehouse)
 * and syncs to product_warehouse_stock table in D1.
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

interface ERPNextBin {
  name: string;
  item_code: string;
  warehouse: string;
  actual_qty: number;      // Physical stock on hand
  reserved_qty: number;    // Reserved for orders
  projected_qty: number;   // Projected after all transactions
  ordered_qty: number;     // Ordered but not received
  planned_qty: number;     // Planned for production
}

interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'warehouses/stock-sync',
    description: 'Sync product stock levels per warehouse from ERPNext Bin',
    methods: ['POST'],
    queryParams: {
      warehouse: 'string (optional) - Filter to specific warehouse ERPNext name',
      item_code: 'string (optional) - Filter to specific item SKU',
    },
    notes: [
      'Fetches Bin doctype from ERPNext',
      'Maps item_code to product_id via SKU',
      'Maps warehouse to warehouse_id via erpnext_name',
      'Only syncs items that exist in D1 products table',
    ],
  });
};

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  const env = platform?.env as {
    DB?: D1Database;
    ERPNEXT_URL?: string;
    ERPNEXT_API_KEY?: string;
    ERPNEXT_API_SECRET?: string;
  } | undefined;

  if (!env?.DB) {
    json(500, { success: false, error: 'Database not configured' });
    return;
  }

  if (!env.ERPNEXT_URL || !env.ERPNEXT_API_KEY || !env.ERPNEXT_API_SECRET) {
    json(500, { success: false, error: 'ERPNext not configured' });
    return;
  }

  // Parse query params for optional filters
  const url = new URL(request.url);
  const warehouseFilter = url.searchParams.get('warehouse');
  const itemFilter = url.searchParams.get('item_code');

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  const result: SyncResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  try {
    // Build filters for ERPNext Bin query
    const filters: string[] = [];
    if (warehouseFilter) {
      filters.push(`["warehouse","=","${warehouseFilter}"]`);
    }
    if (itemFilter) {
      filters.push(`["item_code","=","${itemFilter}"]`);
    }

    const filterString = filters.length > 0 ? `&filters=[${filters.join(',')}]` : '';

    // Fetch bins from ERPNext
    const binUrl = `${env.ERPNEXT_URL}/api/resource/Bin?fields=["name","item_code","warehouse","actual_qty","reserved_qty","projected_qty"]${filterString}&limit_page_length=0`;

    console.log('[Stock Sync] Fetching stock levels from ERPNext...');
    const binResponse = await fetch(binUrl, { headers });

    if (!binResponse.ok) {
      const errorText = await binResponse.text();
      throw new Error(`ERPNext API error: ${binResponse.status} - ${errorText}`);
    }

    const binData = await binResponse.json() as { data: ERPNextBin[] };
    const bins = binData.data || [];

    console.log(`[Stock Sync] Found ${bins.length} bin records`);

    // Build lookup maps for products and warehouses
    // Get all products
    const productsResult = await env.DB
      .prepare('SELECT id, sku FROM storefront_products WHERE sku IS NOT NULL')
      .all<{ id: string; sku: string }>();
    const productMap = new Map(
      (productsResult.results || []).map(p => [p.sku, p.id])
    );

    // Get all warehouses
    const warehousesResult = await env.DB
      .prepare('SELECT id, erpnext_name FROM warehouses')
      .all<{ id: string; erpnext_name: string }>();
    const warehouseMap = new Map(
      (warehousesResult.results || []).map(w => [w.erpnext_name, w.id])
    );

    console.log(`[Stock Sync] Loaded ${productMap.size} products, ${warehouseMap.size} warehouses`);

    // Process each bin record
    for (const bin of bins) {
      try {
        // Map item_code to product_id
        const productId = productMap.get(bin.item_code);
        if (!productId) {
          result.skipped++;
          continue; // Skip items not in our products table
        }

        // Map warehouse to warehouse_id
        const warehouseId = warehouseMap.get(bin.warehouse);
        if (!warehouseId) {
          result.skipped++;
          continue; // Skip unknown warehouses
        }

        // Calculate available qty (actual minus reserved)
        const qtyAvailable = Math.max(0, bin.actual_qty - bin.reserved_qty);

        // Check if stock record already exists
        const existing = await env.DB
          .prepare('SELECT id FROM product_warehouse_stock WHERE product_id = ? AND warehouse_id = ?')
          .bind(productId, warehouseId)
          .first<{ id: string }>();

        if (existing) {
          // Update existing stock record
          await env.DB
            .prepare(`
              UPDATE product_warehouse_stock SET
                qty_available = ?,
                qty_reserved = ?,
                qty_on_hand = ?,
                last_synced_at = datetime('now'),
                updated_at = datetime('now')
              WHERE id = ?
            `)
            .bind(
              qtyAvailable,
              bin.reserved_qty,
              bin.actual_qty,
              existing.id
            )
            .run();

          result.updated++;
        } else {
          // Create new stock record
          const id = crypto.randomUUID();
          await env.DB
            .prepare(`
              INSERT INTO product_warehouse_stock (
                id, product_id, warehouse_id,
                qty_available, qty_reserved, qty_on_hand,
                last_synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `)
            .bind(
              id,
              productId,
              warehouseId,
              qtyAvailable,
              bin.reserved_qty,
              bin.actual_qty
            )
            .run();

          result.created++;
        }

      } catch (binError) {
        const errorMsg = `Failed to sync bin ${bin.item_code}@${bin.warehouse}: ${binError instanceof Error ? binError.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error('[Stock Sync]', errorMsg);
      }
    }

    // Also update the total stock_qty on the storefront_products table (sum across all warehouses)
    console.log('[Stock Sync] Updating product total stock quantities...');
    await env.DB
      .prepare(`
        UPDATE storefront_products SET
          stock_qty = COALESCE((
            SELECT SUM(qty_available)
            FROM product_warehouse_stock
            WHERE product_warehouse_stock.product_id = storefront_products.id
          ), 0),
          updated_at = datetime('now')
        WHERE id IN (SELECT DISTINCT product_id FROM product_warehouse_stock)
      `)
      .run();

    json(200, {
      success: true,
      message: 'Stock sync complete',
      ...result,
      total_bins: bins.length,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Stock Sync] Error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
      ...result,
    });
  }
};
