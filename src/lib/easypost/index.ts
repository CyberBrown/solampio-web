/**
 * EasyPost Service Client
 *
 * Wraps the EasyPost REST API using native fetch (no npm package needed).
 * The @easypost/api package uses superagent which doesn't work well in
 * Cloudflare Workers/Pages, so we use fetch directly.
 */

import type {
  EasyPostAddress,
  EasyPostParcel,
  EasyPostRate,
  EasyPostRateRequest,
  EasyPostRateResponse,
  EasyPostError,
} from './types';

export type { EasyPostAddress, EasyPostParcel, EasyPostRate, EasyPostRateRequest, EasyPostRateResponse };

export interface SimplifiedRate {
  carrier: string;
  service: string;
  rate: string;
  currency: string;
  delivery_days: number | null;
  delivery_date_guaranteed: boolean;
  retail_rate?: string;
  list_rate?: string;
}

export interface RateResult {
  rates: SimplifiedRate[];
  messages?: Array<{ carrier: string; type: string; message: string }>;
}

export class EasyPostService {
  private apiKey: string;
  private baseUrl = 'https://api.easypost.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get the Basic auth header for API requests
   */
  private getAuthHeader(): string {
    return `Basic ${btoa(this.apiKey + ':')}`;
  }

  /**
   * Get shipping rates for a parcel without creating a full Shipment object.
   * Uses the beta/rates endpoint for rate shopping.
   *
   * @param request - The rate request with from/to addresses and parcel dimensions
   * @returns Promise with rates from all connected carriers (USPS, UPS, etc.)
   */
  async getRates(request: EasyPostRateRequest): Promise<EasyPostRateResponse> {
    const response = await fetch(`${this.baseUrl}/beta/rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify({ shipment: request }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `EasyPost API error: ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText) as { error?: EasyPostError };
        if (errorJson.error?.message) {
          errorMessage = `EasyPost: ${errorJson.error.message}`;
        }
      } catch {
        errorMessage = `EasyPost API error: ${response.status} - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    return response.json() as Promise<EasyPostRateResponse>;
  }

  /**
   * Get simplified rates (easier to work with in UI)
   */
  async getSimplifiedRates(request: EasyPostRateRequest): Promise<RateResult> {
    const response = await this.getRates(request);

    return {
      rates: response.rates.map((r) => ({
        carrier: r.carrier,
        service: r.service,
        rate: r.rate,
        currency: r.currency,
        delivery_days: r.delivery_days,
        delivery_date_guaranteed: r.delivery_date_guaranteed,
        retail_rate: r.retail_rate,
        list_rate: r.list_rate,
      })),
      messages: response.messages,
    };
  }
}

/**
 * Factory function to create EasyPost service from platform env
 */
export function getEasyPost(env: {
  EASYPOST_PRODUCTION_API_KEY?: string;
  EASYPOST_TESTING_API_KEY?: string;
}, useProduction = true): EasyPostService {
  const apiKey = useProduction
    ? env.EASYPOST_PRODUCTION_API_KEY || env.EASYPOST_TESTING_API_KEY
    : env.EASYPOST_TESTING_API_KEY || env.EASYPOST_PRODUCTION_API_KEY;

  if (!apiKey) {
    throw new Error('EasyPost API key not configured. Set EASYPOST_PRODUCTION_API_KEY or EASYPOST_TESTING_API_KEY.');
  }

  return new EasyPostService(apiKey);
}

/**
 * Convert weight from pounds to ounces (EasyPost uses ounces)
 */
export function lbsToOunces(lbs: number): number {
  return Math.round(lbs * 16);
}

/**
 * Default origin address (Acton, MA warehouse)
 */
export const DEFAULT_FROM_ADDRESS: EasyPostAddress = {
  street1: '123 Main St', // Replace with actual warehouse address
  city: 'Acton',
  state: 'MA',
  zip: '01720',
  country: 'US',
};
