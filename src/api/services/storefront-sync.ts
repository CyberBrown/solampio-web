/**
 * Cron Job: Sync Products from ERPNext to D1
 * Polling fallback when webhooks are unavailable
 */

import type { D1Database } from '@cloudflare/workers-types';
import { StorefrontSyncManager, type SyncResult } from './storefront-sync/manager';
import type { ERPNextItem, ERPNextItemGroup, ERPNextBrand, ERPNextItemPrice } from './storefront-sync/transforms';
import { ERPNextClient } from './erpnext';

export interface CronEnv {
  DB: D1Database;
  ERPNEXT_URL: string;
  ERPNEXT_API_KEY: string;
  ERPNEXT_API_SECRET: string;
}

export interface FullSyncResult {
  brands: SyncResult;
  categories: SyncResult;
  products: SyncResult;
  totalDuration: number;
}

/**
 * Run full sync of all entities from ERPNext to D1
 */
export async function runFullSync(env: CronEnv): Promise<FullSyncResult> {
  const startTime = Date.now();
  const erpnext = new ERPNextClient(env.ERPNEXT_URL, env.ERPNEXT_API_KEY, env.ERPNEXT_API_SECRET);
  const syncManager = new StorefrontSyncManager(env.DB);

  console.log('Starting full sync from ERPNext to D1...');

  // 1. Sync brands first (products reference brands)
  console.log('Syncing brands...');
  const erpnextBrands = await erpnext.getBrands();
  const brandResult = await syncManager.syncBrands(erpnextBrands as unknown as ERPNextBrand[]);
  console.log(`Brands: ${brandResult.created} created, ${brandResult.updated} updated, ${brandResult.deleted} deleted`);

  // 2. Sync categories (products reference categories)
  console.log('Syncing categories...');
  const erpnextGroups = await erpnext.getItemGroups();
  const categoryResult = await syncManager.syncCategories(erpnextGroups as unknown as ERPNextItemGroup[]);
  console.log(`Categories: ${categoryResult.created} created, ${categoryResult.updated} updated, ${categoryResult.deleted} deleted`);

  // 3. Sync products with prices
  console.log('Syncing products...');
  const items = await fetchAllItems(erpnext);
  const prices = await fetchAllPrices(erpnext, items);
  const productResult = await syncManager.syncProducts(items, prices);
  console.log(`Products: ${productResult.created} created, ${productResult.updated} updated, ${productResult.deleted} deleted`);

  const totalDuration = Date.now() - startTime;
  console.log(`Full sync completed in ${totalDuration}ms`);

  return {
    brands: brandResult,
    categories: categoryResult,
    products: productResult,
    totalDuration,
  };
}

/**
 * Fetch all items from ERPNext with pagination
 */
async function fetchAllItems(erpnext: ERPNextClient): Promise<ERPNextItem[]> {
  const items: ERPNextItem[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const response = await erpnext.getItems({ page, limit });
    items.push(...(response.data as unknown as ERPNextItem[]));

    if (items.length >= response.pagination.total) {
      break;
    }
    page++;
  }

  return items;
}

/**
 * Fetch prices for all items
 * Returns a map of item_code → prices
 */
async function fetchAllPrices(
  erpnext: ERPNextClient,
  items: ERPNextItem[]
): Promise<Map<string, ERPNextItemPrice[]>> {
  const priceMap = new Map<string, ERPNextItemPrice[]>();

  // Batch fetch prices for efficiency
  const batchSize = 50;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const pricePromises = batch.map(item =>
      erpnext.getItemPrices(item.item_code || item.name)
        .then(prices => ({ itemCode: item.item_code || item.name, prices }))
        .catch(() => ({ itemCode: item.item_code || item.name, prices: [] }))
    );

    const results = await Promise.all(pricePromises);
    for (const { itemCode, prices } of results) {
      priceMap.set(itemCode, prices as ERPNextItemPrice[]);
    }
  }

  return priceMap;
}

/**
 * Handle scheduled cron trigger
 */
export async function handleScheduled(
  event: ScheduledEvent,
  env: CronEnv,
  ctx: ExecutionContext
): Promise<void> {
  ctx.waitUntil(
    runFullSync(env)
      .then(result => {
        console.log('Cron sync completed:', JSON.stringify({
          brands: { c: result.brands.created, u: result.brands.updated, d: result.brands.deleted },
          categories: { c: result.categories.created, u: result.categories.updated, d: result.categories.deleted },
          products: { c: result.products.created, u: result.products.updated, d: result.products.deleted },
          duration: result.totalDuration,
        }));
      })
      .catch(error => {
        console.error('Cron sync failed:', error instanceof Error ? error.message : error);
      })
  );
}

/**
 * Manual sync endpoint for testing
 */
export async function handleManualSync(
  request: Request,
  env: CronEnv
): Promise<Response> {
  try {
    const result = await runFullSync(env);

    return new Response(JSON.stringify({
      status: 'success',
      ...result,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      status: 'error',
      error: errorMessage,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Type definitions for Cloudflare Workers
declare global {
  interface ScheduledEvent {
    scheduledTime: number;
    cron: string;
  }

  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }
}
