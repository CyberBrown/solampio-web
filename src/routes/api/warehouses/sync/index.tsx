/**
 * Warehouse Sync API Endpoint
 *
 * POST /api/warehouses/sync - Sync warehouses from ERPNext
 *
 * Fetches Warehouse doctype from ERPNext and syncs to D1.
 * Also fetches linked Address for each warehouse to get ship-from location.
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';

interface ERPNextWarehouse {
  name: string;
  warehouse_name: string;
  is_group: number;
  disabled: number;
  address?: string;  // Link to Address doctype
  city?: string;
  state?: string;
  pin?: string;
  country?: string;
}

interface ERPNextAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
}

// ZIP code to approximate lat/lng lookup (major US ZIP prefixes)
// For production, use a geocoding API for accuracy
const ZIP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '017': { lat: 42.48, lng: -71.43 },  // Acton, MA area
  '018': { lat: 42.36, lng: -71.06 },  // Boston, MA area
  '100': { lat: 40.71, lng: -74.01 },  // NYC area
  '750': { lat: 32.78, lng: -96.80 },  // Dallas, TX area
  '900': { lat: 34.05, lng: -118.24 }, // Los Angeles, CA area
  '941': { lat: 37.77, lng: -122.42 }, // San Francisco, CA area
  '330': { lat: 25.76, lng: -80.19 },  // Miami, FL area
  '606': { lat: 41.88, lng: -87.63 },  // Chicago, IL area
  '852': { lat: 33.45, lng: -112.07 }, // Phoenix, AZ area
  '981': { lat: 47.61, lng: -122.33 }, // Seattle, WA area
};

function getApproximateCoordinates(zip: string): { lat: number; lng: number } | null {
  if (!zip || zip.length < 3) return null;
  const prefix = zip.substring(0, 3);
  return ZIP_COORDINATES[prefix] || null;
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'warehouses/sync',
    description: 'Sync warehouses from ERPNext to D1',
    methods: ['POST'],
    notes: [
      'Fetches Warehouse doctype from ERPNext',
      'Gets linked Address for shipping origin details',
      'Skips warehouse groups (is_group=1) and disabled warehouses',
    ],
  });
};

export const onPost: RequestHandler = async ({ platform, json }) => {
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

  const headers: HeadersInit = {
    Authorization: `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  const result: SyncResult = { created: 0, updated: 0, errors: [] };

  try {
    // Fetch warehouses from ERPNext
    // Filter: not a group, not disabled
    const warehouseUrl = `${env.ERPNEXT_URL}/api/resource/Warehouse?filters=[["is_group","=",0],["disabled","=",0]]&fields=["name","warehouse_name","address","city","state","pin","country"]&limit_page_length=0`;

    console.log('[Warehouse Sync] Fetching warehouses from ERPNext...');
    const warehouseResponse = await fetch(warehouseUrl, { headers });

    if (!warehouseResponse.ok) {
      const errorText = await warehouseResponse.text();
      throw new Error(`ERPNext API error: ${warehouseResponse.status} - ${errorText}`);
    }

    const warehouseData = await warehouseResponse.json() as { data: ERPNextWarehouse[] };
    const warehouses = warehouseData.data || [];

    console.log(`[Warehouse Sync] Found ${warehouses.length} warehouses`);

    // Process each warehouse
    for (const wh of warehouses) {
      try {
        let street1 = '';
        let street2 = '';
        let city = wh.city || '';
        let state = wh.state || '';
        let zip = wh.pin || '';
        let country = wh.country || 'US';

        // If warehouse has a linked Address, fetch it for more details
        if (wh.address) {
          try {
            const addressUrl = `${env.ERPNEXT_URL}/api/resource/Address/${encodeURIComponent(wh.address)}`;
            const addressResponse = await fetch(addressUrl, { headers });

            if (addressResponse.ok) {
              const addressData = await addressResponse.json() as { data: ERPNextAddress };
              const addr = addressData.data;

              street1 = addr.address_line1 || '';
              street2 = addr.address_line2 || '';
              city = addr.city || city;
              state = addr.state || state;
              zip = addr.pincode || zip;
              country = addr.country || country;
            }
          } catch (addrError) {
            console.warn(`[Warehouse Sync] Could not fetch address for ${wh.name}:`, addrError);
          }
        }

        // Normalize country to 2-letter code
        if (country === 'United States') country = 'US';

        // Get approximate coordinates from ZIP
        const coords = getApproximateCoordinates(zip);

        // Generate stable ID
        const id = crypto.randomUUID();

        // Check if warehouse already exists
        const existing = await env.DB
          .prepare('SELECT id FROM warehouses WHERE erpnext_name = ?')
          .bind(wh.name)
          .first<{ id: string }>();

        if (existing) {
          // Update existing warehouse
          await env.DB
            .prepare(`
              UPDATE warehouses SET
                display_name = ?,
                street1 = ?,
                street2 = ?,
                city = ?,
                state = ?,
                zip = ?,
                country = ?,
                latitude = ?,
                longitude = ?,
                last_synced_at = datetime('now'),
                updated_at = datetime('now')
              WHERE erpnext_name = ?
            `)
            .bind(
              wh.warehouse_name || wh.name,
              street1,
              street2,
              city,
              state,
              zip,
              country,
              coords?.lat || null,
              coords?.lng || null,
              wh.name
            )
            .run();

          result.updated++;
        } else {
          // Create new warehouse
          await env.DB
            .prepare(`
              INSERT INTO warehouses (
                id, erpnext_name, display_name,
                street1, street2, city, state, zip, country,
                latitude, longitude,
                is_active, is_pickup_location,
                last_synced_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, datetime('now'))
            `)
            .bind(
              id,
              wh.name,
              wh.warehouse_name || wh.name,
              street1,
              street2,
              city,
              state,
              zip,
              country,
              coords?.lat || null,
              coords?.lng || null
            )
            .run();

          result.created++;
        }

        console.log(`[Warehouse Sync] Synced: ${wh.name} -> ${city}, ${state} ${zip}`);

      } catch (whError) {
        const errorMsg = `Failed to sync warehouse ${wh.name}: ${whError instanceof Error ? whError.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error('[Warehouse Sync]', errorMsg);
      }
    }

    json(200, {
      success: true,
      message: `Warehouse sync complete`,
      ...result,
      total_warehouses: warehouses.length,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Warehouse Sync] Error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
      ...result,
    });
  }
};
