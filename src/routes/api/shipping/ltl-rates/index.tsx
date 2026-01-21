/**
 * LTL Freight Rates API Endpoint
 *
 * POST /api/shipping/ltl-rates - Get LTL freight quotes from uShip LTL Connect
 *
 * Request body:
 * {
 *   from_zip: string,
 *   from_city?: string,
 *   from_state?: string,
 *   to_zip: string,
 *   to_city?: string,
 *   to_state?: string,
 *   weight_lbs: number,
 *   length_in: number,
 *   width_in: number,
 *   height_in: number,
 *   description?: string,
 *   liftgate_pickup?: boolean,
 *   liftgate_delivery?: boolean,
 *   residential_delivery?: boolean
 * }
 *
 * Response:
 * {
 *   success: true,
 *   quotes: [...],
 *   cheapest: { carrier, rate, transit_days },
 *   recommended: { carrier, rate, transit_days }  // with 25% markup
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { getUShip, buildLTLConnectRequest, applyMarkup, LTL_MARKUP } from '~/lib/uship';

interface LTLRatesRequestBody {
  from_zip: string;
  from_city?: string;
  from_state?: string;
  from_address?: string;
  to_zip: string;
  to_city?: string;
  to_state?: string;
  to_address?: string;
  weight_lbs: number;
  length_in: number;
  width_in: number;
  height_in: number;
  description?: string;
  liftgate_pickup?: boolean;
  liftgate_delivery?: boolean;
  residential_delivery?: boolean;
  inside_delivery?: boolean;
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'shipping/ltl-rates',
    description: 'Get LTL freight quotes from uShip LTL Connect',
    methods: ['POST'],
    expectedPayload: {
      from_zip: 'string (required) - Origin ZIP code',
      from_city: 'string (optional) - Origin city',
      from_state: 'string (optional) - Origin state (2-letter)',
      to_zip: 'string (required) - Destination ZIP code',
      to_city: 'string (optional) - Destination city',
      to_state: 'string (optional) - Destination state (2-letter)',
      weight_lbs: 'number (required) - Weight in pounds',
      length_in: 'number (required) - Length in inches',
      width_in: 'number (required) - Width in inches',
      height_in: 'number (required) - Height in inches',
      description: 'string (optional) - Item description',
      liftgate_pickup: 'boolean (optional) - Requires liftgate at pickup',
      liftgate_delivery: 'boolean (optional) - Requires liftgate at delivery',
      residential_delivery: 'boolean (optional) - Delivery to residence',
      inside_delivery: 'boolean (optional) - Inside delivery required',
    },
    notes: [
      'LTL rates include a 25% markup in the recommended price',
      'Multiple carrier quotes returned when available',
      'Uses uShip LTL Connect API with standard 48x40 pallet',
    ],
  });
};

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  const env = platform?.env as {
    USHIP_API_KEY?: string;
  } | undefined;

  if (!env?.USHIP_API_KEY) {
    json(500, {
      success: false,
      error: 'uShip not configured',
      hint: 'Set USHIP_API_KEY environment variable',
    });
    return;
  }

  let body: LTLRatesRequestBody;
  try {
    body = await request.json();
  } catch {
    json(400, {
      success: false,
      error: 'Invalid JSON body',
    });
    return;
  }

  // Validate required fields
  const requiredFields = ['from_zip', 'to_zip', 'weight_lbs', 'length_in', 'width_in', 'height_in'] as const;
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      json(400, {
        success: false,
        error: `Missing required field: ${field}`,
      });
      return;
    }
  }

  // Validate ZIP codes
  if (!/^\d{5}(-\d{4})?$/.test(body.from_zip)) {
    json(400, {
      success: false,
      error: 'Invalid from_zip format. Use 5-digit ZIP (e.g., "01720")',
    });
    return;
  }

  if (!/^\d{5}(-\d{4})?$/.test(body.to_zip)) {
    json(400, {
      success: false,
      error: 'Invalid to_zip format. Use 5-digit ZIP (e.g., "90001")',
    });
    return;
  }

  try {
    const uship = getUShip(env);

    const ltlRequest = buildLTLConnectRequest({
      fromZip: body.from_zip,
      fromCity: body.from_city,
      fromState: body.from_state,
      fromAddress: body.from_address,
      toZip: body.to_zip,
      toCity: body.to_city,
      toState: body.to_state,
      toAddress: body.to_address,
      weightLbs: body.weight_lbs,
      lengthIn: body.length_in,
      widthIn: body.width_in,
      heightIn: body.height_in,
      description: body.description,
      liftgatePickup: body.liftgate_pickup,
      liftgateDelivery: body.liftgate_delivery,
      residentialDelivery: body.residential_delivery,
      insideDelivery: body.inside_delivery,
    });

    const response = await uship.getQuotes(ltlRequest);

    // Get cheapest quote
    const cheapest = uship.getCheapestQuote(response);

    // Format quotes for response
    const formattedQuotes = response.quotes?.map(q => ({
      carrier: q.carrierName,
      carrier_id: q.carrierId,
      service: q.serviceType,
      base_rate: q.price.total,
      rate_with_markup: applyMarkup(q.price.total),
      currency: q.price.currency,
      transit_days: q.transitDays,
      estimated_delivery: q.estimatedDeliveryDate,
      guaranteed: q.guaranteedDelivery,
      quote_id: q.quoteId,
      expires_at: q.expiresAt,
    })) || [];

    json(200, {
      success: true,
      quote_request_id: response.quoteRequestId,
      status: response.status,
      quote_count: formattedQuotes.length,
      quotes: formattedQuotes,
      cheapest: cheapest ? {
        carrier: cheapest.carrierName,
        base_rate: cheapest.price.total,
        rate_with_markup: applyMarkup(cheapest.price.total),
        transit_days: cheapest.transitDays,
      } : null,
      markup: `${LTL_MARKUP * 100}%`,
      messages: response.messages,
      note: 'LTL rates are estimates. Final price confirmed at booking.',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('uShip LTL rate lookup error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
    });
  }
};
