/**
 * uShip LTL Connect Service Client
 *
 * Uses the LTL Connect API which requires only an API key (no OAuth).
 * API key obtained from: https://developer.uship.com/about-our-apis/self-service-api-key--ltl-
 *
 * Guide: https://developer.uship.com/shipper-api-guides/ltl-connect-guide
 */

import type {
  UShipConfig,
  UShipLTLConnectRequest,
  UShipLTLConnectResponse,
  UShipCarrierQuote,
  UShipItem,
  UShipLocationType,
  UShipAccessorial,
  UShipError,
} from './types';

export type {
  UShipConfig,
  UShipLTLConnectRequest,
  UShipLTLConnectResponse,
  UShipCarrierQuote,
  UShipItem,
  UShipLocationType,
  UShipAccessorial,
};

export class UShipService {
  private apiKey: string;
  private baseUrl = 'https://api.uship.com';

  constructor(config: UShipConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Get authorization headers for LTL Connect API
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-USHIP-API-KEY': this.apiKey,
    };
  }

  /**
   * Make an API request to LTL Connect
   */
  private async apiRequest<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = `uShip API error: ${response.status}`;

      try {
        const errorJson = JSON.parse(responseText) as UShipError;
        if (errorJson.message) {
          errorMessage = `uShip: ${errorJson.message}`;
        } else if (errorJson.error_description) {
          errorMessage = `uShip: ${errorJson.error_description}`;
        } else if (errorJson.error) {
          errorMessage = `uShip: ${errorJson.error}`;
        }
      } catch {
        errorMessage = `uShip API error: ${response.status} - ${responseText}`;
      }

      throw new Error(errorMessage);
    }

    if (!responseText) {
      return {} as T;
    }

    return JSON.parse(responseText) as T;
  }

  /**
   * Get LTL quotes using the LTL Connect API
   * This is the main method for getting freight quotes
   */
  async getQuotes(request: UShipLTLConnectRequest): Promise<UShipLTLConnectResponse> {
    return this.apiRequest<UShipLTLConnectResponse>(
      'POST',
      '/v2/ltl/quotes',
      request
    );
  }

  /**
   * Get the cheapest quote from a response
   */
  getCheapestQuote(response: UShipLTLConnectResponse): UShipCarrierQuote | null {
    if (!response.quotes || response.quotes.length === 0) {
      return null;
    }

    return response.quotes.reduce((cheapest, quote) => {
      if (!cheapest || quote.price.total < cheapest.price.total) {
        return quote;
      }
      return cheapest;
    }, null as UShipCarrierQuote | null);
  }

  /**
   * Get the fastest quote from a response
   */
  getFastestQuote(response: UShipLTLConnectResponse): UShipCarrierQuote | null {
    if (!response.quotes || response.quotes.length === 0) {
      return null;
    }

    const quotesWithTransit = response.quotes.filter(q => q.transitDays !== undefined);
    if (quotesWithTransit.length === 0) {
      return response.quotes[0];
    }

    return quotesWithTransit.reduce((fastest, quote) => {
      if (!fastest || (quote.transitDays && quote.transitDays < (fastest.transitDays || Infinity))) {
        return quote;
      }
      return fastest;
    }, null as UShipCarrierQuote | null);
  }
}

/**
 * Get a default pickup date range (3-5 business days from now)
 */
export function getDefaultPickupDates(): { earliest: string; latest: string } {
  const earliest = new Date();
  earliest.setDate(earliest.getDate() + 3);

  const latest = new Date();
  latest.setDate(latest.getDate() + 5);

  return {
    earliest: earliest.toISOString().split('.')[0], // "2023-07-03T11:00:00"
    latest: latest.toISOString().split('.')[0],
  };
}

/**
 * Build a simple LTL Connect request from basic shipping info
 */
export function buildLTLConnectRequest(params: {
  fromZip: string;
  fromCity?: string;
  fromState?: string;
  fromAddress?: string;
  toZip: string;
  toCity?: string;
  toState?: string;
  toAddress?: string;
  weightLbs: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  description?: string;
  liftgatePickup?: boolean;
  liftgateDelivery?: boolean;
  residentialDelivery?: boolean;
  insideDelivery?: boolean;
}): UShipLTLConnectRequest {
  const pickupDates = getDefaultPickupDates();

  // Determine location types
  const originLocationType: UShipLocationType = 'BusinessWithLoadingDockOrForklift';
  const destinationLocationType: UShipLocationType = params.residentialDelivery
    ? 'Residence'
    : 'BusinessWithoutLoadingDockOrForklift';

  // Build accessorials list
  const accessorials: UShipAccessorial[] = [];
  if (params.liftgatePickup) {
    accessorials.push('PickupLiftgateRequired');
  }
  if (params.liftgateDelivery) {
    accessorials.push('DeliveryLiftgateRequired');
  }
  if (params.insideDelivery) {
    accessorials.push('DeliveryInside');
  }

  return {
    items: [
      {
        handlingUnit: 'Pallets48x40Inches',
        quantity: 1,
        height: params.heightIn,
        width: params.widthIn,
        length: params.lengthIn,
        weight: params.weightLbs,
        description: params.description || 'Commercial goods',
      },
    ],
    originAddress: params.fromAddress,
    originPostalCode: params.fromZip,
    originCity: params.fromCity,
    originState: params.fromState,
    originLocationType,
    destinationAddress: params.toAddress,
    destinationPostalCode: params.toZip,
    destinationCity: params.toCity,
    destinationState: params.toState,
    destinationLocationType,
    earliestPickupDate: pickupDates.earliest,
    latestPickupDate: pickupDates.latest,
    quoteRequestAccessorials: accessorials.length > 0 ? accessorials : undefined,
  };
}

/**
 * Factory function to create uShip service from platform env
 */
export function getUShip(env: {
  USHIP_API_KEY?: string;
}): UShipService {
  if (!env.USHIP_API_KEY) {
    throw new Error('uShip API key not configured. Set USHIP_API_KEY.');
  }

  return new UShipService({
    apiKey: env.USHIP_API_KEY,
  });
}

// Default LTL markup percentage (25% per spec)
export const LTL_MARKUP = 0.25;

/**
 * Apply markup to a price
 */
export function applyMarkup(price: number, markup: number = LTL_MARKUP): number {
  return Math.round(price * (1 + markup) * 100) / 100;
}
