/**
 * Cart Shipping Rates API Endpoint
 *
 * POST /api/shipping/cart-rates - Get shipping rates for cart items
 *
 * Analyzes cart items to determine available shipping methods and fetches
 * rates from appropriate carriers (EasyPost for USPS/UPS, uShip for LTL).
 *
 * Now supports multi-warehouse: finds the nearest warehouse with stock for all items.
 *
 * Request body:
 * {
 *   items: Array<{ product_id: string, quantity: number }>,
 *   destination_zip: string,
 *   destination_city?: string,
 *   destination_state?: string,
 *   residential?: boolean
 * }
 *
 * Response:
 * {
 *   success: true,
 *   ship_from_warehouse: { name: 'Acton, MA', zip: '01720' },
 *   shipping_methods: [...],
 *   cart_shipping_profile: {...}
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import type { Product } from '~/lib/db';
import type { EasyPostAddress } from '~/lib/easypost';
import { getEasyPost, lbsToOunces } from '~/lib/easypost';
import { getUShip, buildLTLConnectRequest, applyMarkup, LTL_MARKUP } from '~/lib/uship';
import { getLtlFallbackQuote, isStateSupported } from '~/lib/ltl-fallback-rates';

// Warehouse with address info
interface Warehouse {
  id: string;
  erpnext_name: string;
  display_name: string;
  street1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_pickup_location: number;
}

// Fallback warehouse if none configured
const DEFAULT_WAREHOUSE: Warehouse = {
  id: 'default',
  erpnext_name: 'Default',
  display_name: 'Acton, MA',
  street1: '3 Post Office Sq',
  city: 'Acton',
  state: 'MA',
  zip: '01720',
  country: 'US',
  latitude: 42.48,
  longitude: -71.43,
  is_pickup_location: 1,
};

interface CartRatesRequestBody {
  items: Array<{ product_id: string; quantity: number }>;
  destination_zip: string;
  destination_city?: string;
  destination_state?: string;
  destination_address?: string;
  residential?: boolean;
}

interface ShippingMethod {
  method: string;
  carrier: string;
  service: string;
  rate: number;
  transit_days: number | null;
  delivery_date?: string;
  guaranteed?: boolean;
}

interface CartShippingProfile {
  total_weight_lbs: number;
  total_length_in: number;
  total_width_in: number;
  total_height_in: number;
  total_items: number;
  requires_ltl: boolean;
  requires_liftgate: boolean;
  has_hazmat: boolean;
  has_oversized: boolean;
  pickup_available: boolean;
  usps_eligible: boolean;
  ups_eligible: boolean;
  // Products that used fallback detection (no carrier flags set in ERPNext)
  fallback_products?: Array<{ sku: string; title: string }>;
  used_fallback_detection?: boolean;
}

// Weight threshold for LTL (in lbs) - over this needs freight
const LTL_WEIGHT_THRESHOLD = 150;

// Dimension threshold for LTL (any dimension over this in inches)
const LTL_DIMENSION_THRESHOLD = 48;

// ZIP code to approximate lat/lng (for distance calculation)
const ZIP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '017': { lat: 42.48, lng: -71.43 },  // MA
  '018': { lat: 42.36, lng: -71.06 },  // Boston
  '100': { lat: 40.71, lng: -74.01 },  // NYC
  '750': { lat: 32.78, lng: -96.80 },  // Dallas
  '900': { lat: 34.05, lng: -118.24 }, // LA
  '941': { lat: 37.77, lng: -122.42 }, // SF
  '330': { lat: 25.76, lng: -80.19 },  // Miami
  '606': { lat: 41.88, lng: -87.63 },  // Chicago
  '852': { lat: 33.45, lng: -112.07 }, // Phoenix
  '981': { lat: 47.61, lng: -122.33 }, // Seattle
};

function getZipCoordinates(zip: string): { lat: number; lng: number } | null {
  if (!zip || zip.length < 3) return null;
  return ZIP_COORDINATES[zip.substring(0, 3)] || null;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula for distance in miles
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'shipping/cart-rates',
    description: 'Get shipping rates for cart items based on product shipping profiles',
    methods: ['POST'],
    expectedPayload: {
      items: 'Array<{ product_id: string, quantity: number }> (required)',
      destination_zip: 'string (required) - Destination ZIP code',
      destination_city: 'string (optional) - Destination city',
      destination_state: 'string (optional) - Destination state (2-letter)',
      destination_address: 'string (optional) - Street address',
      residential: 'boolean (optional) - Is residential delivery (default: false)',
    },
    notes: [
      'Analyzes product shipping flags to determine eligible carriers',
      'Aggregates dimensions and weight for rate calculation',
      'Returns sorted shipping options from cheapest to most expensive',
      'LTL freight includes 25% markup',
    ],
  });
};

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  const env = platform?.env as {
    DB?: D1Database;
    EASYPOST_PRODUCTION_API_KEY?: string;
    EASYPOST_TESTING_API_KEY?: string;
    USHIP_API_KEY?: string;
  } | undefined;

  if (!env?.DB) {
    json(500, { success: false, error: 'Database not configured' });
    return;
  }

  let body: CartRatesRequestBody;
  try {
    body = await request.json();
  } catch {
    json(400, { success: false, error: 'Invalid JSON body' });
    return;
  }

  // Validate required fields
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    json(400, { success: false, error: 'items array is required and must not be empty' });
    return;
  }

  if (!body.destination_zip) {
    json(400, { success: false, error: 'destination_zip is required' });
    return;
  }

  if (!/^\d{5}(-\d{4})?$/.test(body.destination_zip)) {
    json(400, { success: false, error: 'Invalid destination_zip format. Use 5-digit ZIP' });
    return;
  }

  try {
    // Fetch products with shipping data from D1
    const productIds = body.items.map(item => item.product_id);
    const placeholders = productIds.map(() => '?').join(',');

    const productsResult = await env.DB.prepare(`
      SELECT
        id, sku, title,
        shipping_weight, shipping_weight_uom,
        shipping_length, shipping_width, shipping_height, shipping_dimension_uom,
        ships_usps, ships_ups, ships_ltl, ships_pickup,
        hazmat_flag, hazmat_class, oversized_flag,
        variant_of, inherit_shipping_from_parent
      FROM storefront_products
      WHERE id IN (${placeholders})
    `).bind(...productIds).all();

    const products = productsResult.results as unknown as Product[];

    if (products.length === 0) {
      json(400, { success: false, error: 'No valid products found' });
      return;
    }

    // Create quantity lookup
    const quantityMap = new Map(body.items.map(item => [item.product_id, item.quantity]));

    // Collect unique parent SKUs for variants that inherit shipping
    const parentSkusNeeded = new Set<string>();
    for (const product of products) {
      if (product.variant_of && product.inherit_shipping_from_parent) {
        parentSkusNeeded.add(product.variant_of);
      }
    }

    // Fetch parent products in single query for shipping data inheritance
    const parentMap = new Map<string, Product>();
    if (parentSkusNeeded.size > 0) {
      const parentPlaceholders = [...parentSkusNeeded].map(() => '?').join(',');
      const parentsResult = await env.DB.prepare(`
        SELECT id, sku, shipping_weight, shipping_weight_uom,
               shipping_length, shipping_width, shipping_height, shipping_dimension_uom,
               ships_usps, ships_ups, ships_ltl, ships_pickup,
               hazmat_flag, oversized_flag
        FROM storefront_products
        WHERE sku IN (${parentPlaceholders})
      `).bind(...parentSkusNeeded).all();

      for (const parent of parentsResult.results as unknown as Product[]) {
        if (parent.sku) {
          parentMap.set(parent.sku, parent);
        }
      }
    }

    // Find the best warehouse to ship from (nearest with stock for all items)
    const shipFromWarehouse = await findBestWarehouse(
      env.DB,
      body.items,
      body.destination_zip
    );

    // Build origin address from warehouse
    const originAddress: EasyPostAddress = {
      street1: shipFromWarehouse.street1 || '',
      city: shipFromWarehouse.city || '',
      state: shipFromWarehouse.state || '',
      zip: shipFromWarehouse.zip || '01720',
      country: shipFromWarehouse.country || 'US',
    };

    // Calculate cart shipping profile
    const profile = calculateShippingProfile(products, quantityMap, parentMap);

    // Collect shipping methods
    const shippingMethods: ShippingMethod[] = [];

    // Offer local pickup if warehouse is a pickup location
    if (profile.pickup_available && shipFromWarehouse.is_pickup_location) {
      shippingMethods.push({
        method: 'pickup',
        carrier: 'Will Call',
        service: `Local Pickup - ${shipFromWarehouse.city || 'Warehouse'}, ${shipFromWarehouse.state || ''}`,
        rate: 0,
        transit_days: 0,
      });
    }

    // Determine which rate APIs to call based on cart profile
    const shouldGetParcelRates = (profile.usps_eligible || profile.ups_eligible) &&
                                  !profile.requires_ltl &&
                                  !profile.has_hazmat;
    const shouldGetLTLRates = profile.requires_ltl || profile.has_oversized;

    // Get parcel rates (USPS/UPS) via EasyPost
    const hasEasyPostKey = env.EASYPOST_PRODUCTION_API_KEY || env.EASYPOST_TESTING_API_KEY;
    if (shouldGetParcelRates && hasEasyPostKey) {
      try {
        const easypost = getEasyPost(env);

        const parcelRatesResult = await easypost.getSimplifiedRates({
          from_address: originAddress,
          to_address: {
            street1: body.destination_address || '',
            zip: body.destination_zip,
            city: body.destination_city || '',
            state: body.destination_state || '',
            country: 'US',
          },
          parcel: {
            length: profile.total_length_in,
            width: profile.total_width_in,
            height: profile.total_height_in,
            weight: lbsToOunces(profile.total_weight_lbs),
          },
        });

        // Filter to only eligible carriers and specific services
        for (const rate of parcelRatesResult.rates) {
          const carrierLower = rate.carrier.toLowerCase();
          const serviceLower = rate.service.toLowerCase();

          // Check carrier eligibility
          if (carrierLower === 'usps' && !profile.usps_eligible) continue;
          if (carrierLower === 'ups' && !profile.ups_eligible) continue;

          // Only offer specific services:
          // - USPS: Ground Advantage only
          // - UPS: Ground only (carrier can be 'ups' or 'upsdap')
          if (carrierLower === 'usps' && !serviceLower.includes('ground advantage')) continue;
          if ((carrierLower === 'ups' || carrierLower === 'upsdap') && serviceLower !== 'ground') continue;

          // Clean up carrier/service names for display
          let displayCarrier = rate.carrier;
          let displayService = rate.service;

          if (carrierLower === 'ups' || carrierLower === 'upsdap') {
            displayCarrier = 'UPS';
            displayService = 'Ground';
          }
          if (carrierLower === 'usps') {
            displayCarrier = 'USPS';
            displayService = 'Ground Advantage';
          }

          shippingMethods.push({
            method: `${carrierLower}_${rate.service.toLowerCase().replace(/\s+/g, '_')}`,
            carrier: displayCarrier,
            service: displayService,
            rate: parseFloat(rate.rate),
            transit_days: rate.delivery_days,
            guaranteed: rate.delivery_date_guaranteed,
          });
        }
      } catch (error) {
        console.error('EasyPost rate error:', error);
        // Continue without parcel rates
      }
    }

    // Get LTL freight rates via uShip, with fallback to static rate table
    let ltlError: string | null = null;
    let usedFallbackLtlRates = false;
    if (shouldGetLTLRates) {
      let gotLtlRates = false;

      // Try uShip API first if configured
      if (env.USHIP_API_KEY) {
        try {
          const uship = getUShip(env);

          const ltlRequest = buildLTLConnectRequest({
            fromZip: originAddress.zip,
            fromCity: originAddress.city,
            fromState: originAddress.state,
            toZip: body.destination_zip,
            toCity: body.destination_city,
            toState: body.destination_state,
            toAddress: body.destination_address,
            weightLbs: profile.total_weight_lbs,
            lengthIn: profile.total_length_in,
            widthIn: profile.total_width_in,
            heightIn: profile.total_height_in,
            description: 'Solar equipment',
            liftgateDelivery: profile.requires_liftgate || body.residential,
            residentialDelivery: body.residential,
          });

          const ltlResponse = await uship.getQuotes(ltlRequest);

          if (ltlResponse.quotes && ltlResponse.quotes.length > 0) {
            // Add top 3 LTL quotes
            const topQuotes = ltlResponse.quotes
              .sort((a, b) => a.price.total - b.price.total)
              .slice(0, 3);

            for (const quote of topQuotes) {
              shippingMethods.push({
                method: `ltl_${quote.carrierId}`,
                carrier: quote.carrierName,
                service: quote.serviceType || 'LTL Freight',
                rate: applyMarkup(quote.price.total),
                transit_days: quote.transitDays || null,
                delivery_date: quote.estimatedDeliveryDate,
                guaranteed: quote.guaranteedDelivery,
              });
            }
            gotLtlRates = true;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('uShip LTL rate error:', errorMsg);
          ltlError = errorMsg;
          // Will try fallback rates below
        }
      }

      // Use fallback LTL rates if uShip failed or not configured
      if (!gotLtlRates && body.destination_state) {
        // Check if destination state is supported for fallback rates (48 contiguous + DC)
        if (isStateSupported(body.destination_state)) {
          const fallbackQuote = getLtlFallbackQuote({
            destinationState: body.destination_state,
            weightLbs: profile.total_weight_lbs,
            // Origin is always our warehouse which has a loading dock
            liftgatePickup: false,
            // Delivery accessorials based on request
            liftgateDelivery: profile.requires_liftgate || body.residential,
            residentialDelivery: body.residential,
            hazmat: profile.has_hazmat,
          });

          if (fallbackQuote.success) {
            console.log('[Cart Rates] Using fallback LTL rates for zone:', fallbackQuote.zone);
            shippingMethods.push({
              method: 'ltl_fallback',
              carrier: 'LTL Freight',
              service: `Standard Freight (${fallbackQuote.zoneDescription})`,
              rate: fallbackQuote.totalRate,
              transit_days: fallbackQuote.transitDaysEstimate,
              guaranteed: false,
            });
            usedFallbackLtlRates = true;
            // Clear the API error since we have fallback rates
            ltlError = null;
          } else {
            // Fallback also failed (e.g., weight over 5000 lbs or non-contiguous state)
            console.error('[Cart Rates] Fallback LTL rate error:', fallbackQuote.error);
            if (!ltlError) {
              ltlError = fallbackQuote.error;
            }
          }
        } else {
          // Non-contiguous state (AK, HI, PR) - needs contact for quote
          console.log('[Cart Rates] Destination state requires contact for LTL quote:', body.destination_state);
          if (!ltlError) {
            ltlError = `Shipping to ${body.destination_state} requires a custom quote. Please contact us for pricing.`;
          }
        }
      } else if (!gotLtlRates && !body.destination_state) {
        // No state provided - can't use fallback
        console.error('[Cart Rates] Cannot use fallback LTL rates - destination_state not provided');
      }
    }

    // Sort by rate (cheapest first), with pickup always first if available
    shippingMethods.sort((a, b) => {
      if (a.method === 'pickup') return -1;
      if (b.method === 'pickup') return 1;
      return a.rate - b.rate;
    });

    // Determine if free shipping applies (over $2500 to commercial)
    // This would need subtotal passed in - for now just note the threshold
    const freeShippingNote = !body.residential
      ? 'Free shipping available on orders over $2,500 to commercial addresses'
      : null;

    // Build warnings array for issues that need attention
    const warnings: string[] = [];

    // Warn if LTL is required but no rates available (API and fallback both failed)
    if (shouldGetLTLRates && ltlError && !usedFallbackLtlRates) {
      console.error('[Cart Rates] ERROR: LTL freight rates unavailable:', ltlError);
      warnings.push(`LTL freight: ${ltlError}`);
    }

    // Note when using fallback rates (informational, not a warning)
    // This is transparent to the customer - we don't need to expose this detail

    // Warn if parcel shipping needed but EasyPost not configured
    if (shouldGetParcelRates && !hasEasyPostKey) {
      console.error('[Cart Rates] ERROR: Parcel shipping required but EASYPOST_API_KEY not configured');
      warnings.push('Parcel shipping rates unavailable - shipping API not configured.');
    }

    // Warn about fallback detection being used
    if (profile.used_fallback_detection) {
      console.error('[Cart Rates] ERROR: Products missing carrier flags, using fallback detection:',
        profile.fallback_products?.map(p => p.sku).join(', '));
      warnings.push(`Product shipping configuration incomplete: ${profile.fallback_products?.map(p => p.sku).join(', ')}`);
    }

    // If no shipping methods available but LTL is required, always offer pickup
    if (shippingMethods.length === 0 && profile.requires_ltl && shipFromWarehouse.is_pickup_location) {
      shippingMethods.push({
        method: 'pickup',
        carrier: 'Will Call',
        service: `Local Pickup - ${shipFromWarehouse.city || 'Warehouse'}, ${shipFromWarehouse.state || ''}`,
        rate: 0,
        transit_days: 0,
      });
    }

    json(200, {
      success: true,
      ship_from_warehouse: {
        name: shipFromWarehouse.display_name,
        city: shipFromWarehouse.city,
        state: shipFromWarehouse.state,
        zip: shipFromWarehouse.zip,
      },
      shipping_methods: shippingMethods,
      cart_shipping_profile: profile,
      free_shipping_note: freeShippingNote,
      ltl_markup: shouldGetLTLRates ? `${LTL_MARKUP * 100}%` : null,
      ltl_rate_source: usedFallbackLtlRates ? 'fallback' : (shouldGetLTLRates ? 'api' : null),
      warnings: warnings.length > 0 ? warnings : undefined,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cart shipping rates error:', errorMessage);
    json(500, { success: false, error: errorMessage });
  }
};

/**
 * Calculate aggregate shipping profile for cart items
 *
 * Carrier eligibility logic:
 * 1. If products have explicit carrier flags set, use those
 * 2. If NO carrier flags are set (all 0), auto-detect based on weight/dimensions:
 *    - Items under 70 lbs and small dims → UPS eligible
 *    - Items over weight/size thresholds → LTL eligible
 *    - All items → Pickup available
 */
function calculateShippingProfile(
  products: Product[],
  quantityMap: Map<string, number>,
  parentMap: Map<string, Product>
): CartShippingProfile {
  let totalWeightLbs = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;
  let totalItems = 0;

  let allShipUsps = true;
  let allShipUps = true;
  let anyShipLtl = false;
  let anyPickup = false;
  let anyHazmat = false;
  let anyOversized = false;

  // Track products without carrier flags configured
  const productsWithoutFlags: Array<{ sku: string; title: string }> = [];

  for (const product of products) {
    const quantity = quantityMap.get(product.id) || 1;
    totalItems += quantity;

    // Resolve parent for variants that inherit shipping data
    const shippingSource = (product.variant_of && product.inherit_shipping_from_parent)
      ? (parentMap.get(product.variant_of) || product)
      : product;

    // Get shipping dimensions - fallback chain: variant value > parent value > default
    const weight = product.shipping_weight || shippingSource.shipping_weight || 1;
    const length = product.shipping_length || shippingSource.shipping_length || 12;
    const width = product.shipping_width || shippingSource.shipping_width || 12;
    const height = product.shipping_height || shippingSource.shipping_height || 6;

    // Aggregate weight
    totalWeightLbs += weight * quantity;

    // For dimensions, take max of length/width, stack heights
    maxLength = Math.max(maxLength, length);
    maxWidth = Math.max(maxWidth, width);
    totalHeight += height * quantity;

    // Check if this product has any carrier flags set
    const hasAnyFlag = product.ships_usps || product.ships_ups || product.ships_ltl || product.ships_pickup;
    if (!hasAnyFlag) {
      productsWithoutFlags.push({ sku: product.sku || 'unknown', title: product.title || 'Unknown Product' });
    }

    // Check carrier flags - ALL items must support carrier for it to be eligible
    if (!product.ships_usps) allShipUsps = false;
    if (!product.ships_ups) allShipUps = false;

    // ANY item supporting LTL or pickup makes those available
    if (product.ships_ltl) anyShipLtl = true;
    if (product.ships_pickup) anyPickup = true;

    // ANY hazmat or oversized affects the whole cart
    if (product.hazmat_flag) anyHazmat = true;
    if (product.oversized_flag) anyOversized = true;
  }

  // Determine if LTL is required based on weight/dimensions
  const requiresLtl = totalWeightLbs > LTL_WEIGHT_THRESHOLD ||
                      maxLength > LTL_DIMENSION_THRESHOLD ||
                      maxWidth > LTL_DIMENSION_THRESHOLD ||
                      totalHeight > LTL_DIMENSION_THRESHOLD ||
                      anyOversized;

  // Require liftgate if residential or oversized
  const requiresLiftgate = anyOversized || totalWeightLbs > 100;

  // Check if we need to use fallback detection (all products missing flags)
  const useFallback = productsWithoutFlags.length === products.length;

  // FALLBACK: If no carrier flags are set on ANY product, auto-detect eligibility
  // This handles the common case where ERPNext shipping flags haven't been configured yet
  if (useFallback) {
    console.log('[Cart Rates] WARNING: No carrier flags set on products, using auto-detection. Products:',
      productsWithoutFlags.map(p => p.sku).join(', '));

    // Auto-detect based on weight/dimensions
    // UPS Ground limit: typically 150 lbs, 108" length, but we use lower threshold for safety
    const upsEligible = totalWeightLbs <= 70 &&
                        maxLength <= 48 &&
                        maxWidth <= 48 &&
                        totalHeight <= 48 &&
                        !anyHazmat;

    return {
      total_weight_lbs: Math.round(totalWeightLbs * 100) / 100,
      total_length_in: Math.round(maxLength),
      total_width_in: Math.round(maxWidth),
      total_height_in: Math.round(totalHeight),
      total_items: totalItems,
      requires_ltl: requiresLtl,
      requires_liftgate: requiresLiftgate,
      has_hazmat: anyHazmat,
      has_oversized: anyOversized,
      pickup_available: true, // Always allow pickup when auto-detecting
      usps_eligible: false, // USPS has strict size limits, don't auto-enable
      ups_eligible: upsEligible && !requiresLtl,
      used_fallback_detection: true,
      fallback_products: productsWithoutFlags,
    };
  }

  return {
    total_weight_lbs: Math.round(totalWeightLbs * 100) / 100,
    total_length_in: Math.round(maxLength),
    total_width_in: Math.round(maxWidth),
    total_height_in: Math.round(totalHeight),
    total_items: totalItems,
    requires_ltl: requiresLtl,
    requires_liftgate: requiresLiftgate,
    has_hazmat: anyHazmat,
    has_oversized: anyOversized,
    pickup_available: anyPickup,
    usps_eligible: allShipUsps && !requiresLtl && !anyHazmat,
    ups_eligible: allShipUps && !requiresLtl && !anyHazmat,
    used_fallback_detection: false,
    // Include products without flags even when not using full fallback (for partial warnings)
    fallback_products: productsWithoutFlags.length > 0 ? productsWithoutFlags : undefined,
  };
}

/**
 * Find the best warehouse to ship from for the given cart items.
 * Strategy:
 * 1. Identify which items require stock checks (have stock records somewhere)
 * 2. Items with NO stock records anywhere are assumed dropship/made-to-order (skip stock check)
 * 3. Find warehouses that have stock for items that need it
 * 4. Pick the closest warehouse to the destination
 */
async function findBestWarehouse(
  db: D1Database,
  items: Array<{ product_id: string; quantity: number }>,
  destinationZip: string
): Promise<Warehouse> {
  try {
    // Get all active warehouses
    const warehousesResult = await db
      .prepare(`
        SELECT id, erpnext_name, display_name, street1, city, state, zip, country,
               latitude, longitude, is_pickup_location
        FROM warehouses
        WHERE is_active = 1
      `)
      .all();

    const warehouses = warehousesResult.results as unknown as Warehouse[];

    if (warehouses.length === 0) {
      console.log('[Cart Rates] No warehouses configured, using default');
      return DEFAULT_WAREHOUSE;
    }

    // First, determine which items need stock checks
    // Items with NO stock records anywhere are dropship/made-to-order - skip stock check for them
    const itemsNeedingStockCheck: Array<{ product_id: string; quantity: number }> = [];

    for (const item of items) {
      const hasAnyStock = await db
        .prepare(`
          SELECT 1 FROM product_warehouse_stock
          WHERE product_id = ?
          LIMIT 1
        `)
        .bind(item.product_id)
        .first();

      if (hasAnyStock) {
        // This item has stock records - needs stock check
        itemsNeedingStockCheck.push(item);
      } else {
        // No stock records anywhere - dropship/MTO item, skip stock check
        console.log(`[Cart Rates] Item ${item.product_id} has no stock records - treating as dropship/MTO`);
      }
    }

    // If no items need stock check (all dropship/MTO), just find nearest warehouse
    if (itemsNeedingStockCheck.length === 0) {
      console.log('[Cart Rates] All items are dropship/MTO - selecting nearest warehouse');
      return findNearestWarehouse(warehouses, destinationZip);
    }

    // For each warehouse, check if it has sufficient stock for items that need it
    const warehousesWithStock: Array<{ warehouse: Warehouse; distance: number }> = [];

    for (const warehouse of warehouses) {
      let hasAllItems = true;

      for (const item of itemsNeedingStockCheck) {
        // Check stock for this product in this warehouse
        const stockResult = await db
          .prepare(`
            SELECT qty_available
            FROM product_warehouse_stock
            WHERE product_id = ? AND warehouse_id = ?
          `)
          .bind(item.product_id, warehouse.id)
          .first<{ qty_available: number }>();

        const available = stockResult?.qty_available || 0;

        if (available < item.quantity) {
          hasAllItems = false;
          break;
        }
      }

      if (hasAllItems) {
        const distance = calculateWarehouseDistance(warehouse, destinationZip);
        warehousesWithStock.push({ warehouse, distance });
      }
    }

    if (warehousesWithStock.length === 0) {
      // No single warehouse has all stocked items - fall back to nearest warehouse
      // This allows quotes for backorder/partial stock scenarios
      console.log('[Cart Rates] No warehouse has all stocked items, using nearest warehouse');
      return findNearestWarehouse(warehouses, destinationZip);
    }

    // Sort by distance (closest first) and return the best one
    warehousesWithStock.sort((a, b) => a.distance - b.distance);

    const best = warehousesWithStock[0];
    console.log(`[Cart Rates] Best warehouse: ${best.warehouse.display_name} (${best.distance.toFixed(0)} miles)`);

    return best.warehouse;

  } catch (error) {
    console.error('[Cart Rates] Error finding warehouse:', error);
    return DEFAULT_WAREHOUSE;
  }
}

/**
 * Calculate distance from warehouse to destination ZIP
 */
function calculateWarehouseDistance(warehouse: Warehouse, destinationZip: string): number {
  const destCoords = getZipCoordinates(destinationZip);

  if (destCoords && warehouse.latitude && warehouse.longitude) {
    return calculateDistance(
      warehouse.latitude,
      warehouse.longitude,
      destCoords.lat,
      destCoords.lng
    );
  } else if (destCoords && warehouse.zip) {
    // Fallback: use warehouse ZIP for distance
    const whCoords = getZipCoordinates(warehouse.zip);
    if (whCoords) {
      return calculateDistance(
        whCoords.lat,
        whCoords.lng,
        destCoords.lat,
        destCoords.lng
      );
    }
  }

  return Infinity;
}

/**
 * Find the nearest warehouse to the destination (ignoring stock)
 */
function findNearestWarehouse(warehouses: Warehouse[], destinationZip: string): Warehouse {
  if (warehouses.length === 0) {
    return DEFAULT_WAREHOUSE;
  }

  const warehousesWithDistance = warehouses.map(warehouse => ({
    warehouse,
    distance: calculateWarehouseDistance(warehouse, destinationZip),
  }));

  warehousesWithDistance.sort((a, b) => a.distance - b.distance);

  const nearest = warehousesWithDistance[0];
  console.log(`[Cart Rates] Nearest warehouse: ${nearest.warehouse.display_name} (${nearest.distance.toFixed(0)} miles)`);

  return nearest.warehouse;
}
