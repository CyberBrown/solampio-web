/**
 * Shipping Rates API Endpoint
 *
 * POST /api/shipping/rates - Get shipping rates for a parcel
 *
 * Request body:
 * {
 *   from_address: { street1, city, state, zip, country },
 *   to_address: { street1, city, state, zip, country },
 *   parcel: { length, width, height, weight }  // weight in ounces
 * }
 *
 * Response:
 * {
 *   success: true,
 *   rates: [{ carrier, service, rate, delivery_days, ... }],
 *   messages: [{ carrier, message }]
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import { getEasyPost, type EasyPostRateRequest } from '~/lib/easypost';

interface RatesRequestBody {
  from_address: {
    name?: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
  to_address: {
    name?: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
  };
  parcel: {
    length: number;
    width: number;
    height: number;
    weight: number; // ounces
    predefined_package?: string;
  };
  carrier_accounts?: string[];
}

export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'shipping/rates',
    description: 'Get shipping rates for a parcel',
    methods: ['POST'],
    expectedPayload: {
      from_address: {
        street1: 'string (required)',
        city: 'string (required)',
        state: 'string (required)',
        zip: 'string (required)',
        country: 'string (required, e.g. "US")',
      },
      to_address: {
        street1: 'string (required)',
        city: 'string (required)',
        state: 'string (required)',
        zip: 'string (required)',
        country: 'string (required)',
      },
      parcel: {
        length: 'number (inches)',
        width: 'number (inches)',
        height: 'number (inches)',
        weight: 'number (ounces - use lbs * 16)',
      },
    },
    note: 'Weight is in OUNCES. Multiply pounds by 16.',
  });
};

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  const env = platform?.env as {
    EASYPOST_PRODUCTION_API_KEY?: string;
    EASYPOST_TESTING_API_KEY?: string;
  } | undefined;

  if (!env?.EASYPOST_PRODUCTION_API_KEY && !env?.EASYPOST_TESTING_API_KEY) {
    json(500, {
      success: false,
      error: 'EasyPost API keys not configured',
    });
    return;
  }

  let body: RatesRequestBody;
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
  if (!body.from_address || !body.to_address || !body.parcel) {
    json(400, {
      success: false,
      error: 'Missing required fields: from_address, to_address, parcel',
    });
    return;
  }

  const requiredAddressFields = ['street1', 'city', 'state', 'zip', 'country'] as const;
  for (const field of requiredAddressFields) {
    if (!body.from_address[field]) {
      json(400, {
        success: false,
        error: `Missing required from_address field: ${field}`,
      });
      return;
    }
    if (!body.to_address[field]) {
      json(400, {
        success: false,
        error: `Missing required to_address field: ${field}`,
      });
      return;
    }
  }

  const requiredParcelFields = ['length', 'width', 'height', 'weight'] as const;
  for (const field of requiredParcelFields) {
    if (body.parcel[field] === undefined || body.parcel[field] === null) {
      json(400, {
        success: false,
        error: `Missing required parcel field: ${field}`,
      });
      return;
    }
  }

  try {
    const easypost = getEasyPost(env);
    const rateRequest: EasyPostRateRequest = {
      from_address: body.from_address,
      to_address: body.to_address,
      parcel: body.parcel,
      carrier_accounts: body.carrier_accounts,
    };

    const result = await easypost.getSimplifiedRates(rateRequest);

    json(200, {
      success: true,
      rates: result.rates,
      messages: result.messages,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('EasyPost rate lookup error:', errorMessage);

    json(500, {
      success: false,
      error: errorMessage,
    });
  }
};
