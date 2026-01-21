/**
 * Shipping Test API Endpoint
 *
 * GET /api/shipping/test - Test EasyPost integration with sample data
 *
 * Tests the EasyPost API connection by requesting rates for a sample shipment
 * from Acton, MA to Los Angeles, CA with a 1 lb parcel.
 *
 * Response includes rates from all connected carriers (USPS, UPS, etc.)
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { EasyPostService, lbsToOunces } from '~/lib/easypost';

export const onGet: RequestHandler = async ({ platform, json }) => {
  const env = platform?.env as {
    EASYPOST_PRODUCTION_API_KEY?: string;
    EASYPOST_TESTING_API_KEY?: string;
  } | undefined;

  // Check for API keys
  if (!env?.EASYPOST_TESTING_API_KEY && !env?.EASYPOST_PRODUCTION_API_KEY) {
    json(500, {
      success: false,
      error: 'No EasyPost API key configured',
      configuredKeys: {
        EASYPOST_TESTING_API_KEY: !!env?.EASYPOST_TESTING_API_KEY,
        EASYPOST_PRODUCTION_API_KEY: !!env?.EASYPOST_PRODUCTION_API_KEY,
      },
    });
    return;
  }

  // Use testing key for test endpoint (falls back to production if no test key)
  const apiKey = env.EASYPOST_TESTING_API_KEY || env.EASYPOST_PRODUCTION_API_KEY;
  if (!apiKey) {
    json(500, { success: false, error: 'No API key available' });
    return;
  }

  const easypost = new EasyPostService(apiKey);

  // Test shipment: small parcel from Acton, MA to Los Angeles, CA
  const testRequest = {
    from_address: {
      street1: '123 Main St',
      city: 'Acton',
      state: 'MA',
      zip: '01720',
      country: 'US',
    },
    to_address: {
      street1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'US',
    },
    parcel: {
      length: 10,
      width: 8,
      height: 4,
      weight: lbsToOunces(1), // 1 lb = 16 oz
    },
  };

  try {
    const result = await easypost.getSimplifiedRates(testRequest);

    // Sort by rate (cheapest first)
    const sortedRates = result.rates.sort(
      (a, b) => parseFloat(a.rate) - parseFloat(b.rate)
    );

    // Group by carrier for easier reading
    const byCarrier: Record<string, typeof sortedRates> = {};
    for (const rate of sortedRates) {
      if (!byCarrier[rate.carrier]) {
        byCarrier[rate.carrier] = [];
      }
      byCarrier[rate.carrier].push(rate);
    }

    json(200, {
      success: true,
      test: 'EasyPost integration working',
      testShipment: {
        from: `${testRequest.from_address.city}, ${testRequest.from_address.state} ${testRequest.from_address.zip}`,
        to: `${testRequest.to_address.city}, ${testRequest.to_address.state} ${testRequest.to_address.zip}`,
        parcel: `${testRequest.parcel.length}x${testRequest.parcel.width}x${testRequest.parcel.height} in, ${testRequest.parcel.weight / 16} lb`,
      },
      carriers: Object.keys(byCarrier),
      rateCount: sortedRates.length,
      rates: sortedRates.map((r) => ({
        carrier: r.carrier,
        service: r.service,
        rate: `$${r.rate}`,
        days: r.delivery_days,
        guaranteed: r.delivery_date_guaranteed,
      })),
      byCarrier,
      messages: result.messages,
      apiMode: env.EASYPOST_TESTING_API_KEY ? 'test' : 'production',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('EasyPost test error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
      apiMode: env.EASYPOST_TESTING_API_KEY ? 'test' : 'production',
    });
  }
};
