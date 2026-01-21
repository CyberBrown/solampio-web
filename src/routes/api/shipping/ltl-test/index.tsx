/**
 * LTL Freight Test API Endpoint
 *
 * GET /api/shipping/ltl-test - Test uShip LTL Connect integration with sample data
 *
 * Tests the uShip LTL Connect API connection by requesting quotes for a sample
 * LTL shipment: 500 lb pallet from Acton, MA to Los Angeles, CA.
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { getUShip, buildLTLConnectRequest, applyMarkup, LTL_MARKUP } from '~/lib/uship';

export const onGet: RequestHandler = async ({ platform, json }) => {
  const env = platform?.env as {
    USHIP_API_KEY?: string;
  } | undefined;

  // Check for API key
  if (!env?.USHIP_API_KEY) {
    json(500, {
      success: false,
      error: 'uShip not configured',
      configured: {
        USHIP_API_KEY: false,
      },
      hint: 'Set USHIP_API_KEY environment variable. Get your LTL Connect API key from https://developer.uship.com/about-our-apis/self-service-api-key--ltl-',
    });
    return;
  }

  try {
    const uship = getUShip(env);

    // Test: Heavy battery/equipment shipment from Acton, MA to Los Angeles, CA
    const testRequest = buildLTLConnectRequest({
      fromZip: '01720',
      fromCity: 'Acton',
      fromState: 'MA',
      toZip: '90001',
      toCity: 'Los Angeles',
      toState: 'CA',
      weightLbs: 500,
      lengthIn: 48,
      widthIn: 40,
      heightIn: 36,
      description: 'Solar battery equipment',
      liftgateDelivery: true,
    });

    const response = await uship.getQuotes(testRequest);
    const cheapest = uship.getCheapestQuote(response);

    json(200, {
      success: true,
      test: 'uShip LTL Connect integration working',
      testShipment: {
        from: 'Acton, MA (01720)',
        to: 'Los Angeles, CA (90001)',
        weight: '500 lbs',
        dimensions: '48x40x36 in',
        description: 'Solar battery equipment',
        liftgate_delivery: true,
      },
      result: {
        quote_request_id: response.quoteRequestId,
        status: response.status,
        quote_count: response.quotes?.length || 0,
        cheapest: cheapest ? {
          carrier: cheapest.carrierName,
          base_rate: cheapest.price.total,
          rate_with_markup: applyMarkup(cheapest.price.total),
          transit_days: cheapest.transitDays,
        } : null,
        markup: `${LTL_MARKUP * 100}%`,
      },
      quotes: response.quotes?.map(q => ({
        carrier: q.carrierName,
        base_rate: q.price.total,
        rate_with_markup: applyMarkup(q.price.total),
        transit_days: q.transitDays,
        service: q.serviceType,
      })) || [],
      configured: {
        USHIP_API_KEY: true,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('uShip LTL Connect test error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
      configured: {
        USHIP_API_KEY: true,
      },
      hint: 'Verify your LTL Connect API key is valid.',
      troubleshooting: [
        'Get LTL Connect API key from: https://developer.uship.com/about-our-apis/self-service-api-key--ltl-',
        'LTL Connect uses simple API key auth (no OAuth required)',
        'Contact api-support@uship.com if you need help with your API key',
      ],
    });
  }
};
