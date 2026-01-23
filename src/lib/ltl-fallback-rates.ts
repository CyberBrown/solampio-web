/**
 * LTL Fallback Rates
 *
 * Static rate table for LTL shipping when the uShip API is unavailable.
 * Covers 48 contiguous US states plus DC. AK, HI, and PR require contact for quote.
 *
 * Origin: Acton, MA (01720) - Zone A
 */

// Zone definitions
export type LtlZone = 'A' | 'B' | 'C' | 'D' | 'E' | 'PR' | 'HI' | 'AK';

// Zone descriptions for reference
export const ZONE_DESCRIPTIONS: Record<LtlZone, string> = {
  A: 'New England (local)',
  B: 'Mid-Atlantic',
  C: 'Southeast / Near Midwest',
  D: 'Central / South Central',
  E: 'West / Mountain',
  PR: 'Puerto Rico',
  HI: 'Hawaii',
  AK: 'Alaska',
};

// State to zone mapping
export const STATE_TO_ZONE: Record<string, LtlZone> = {
  // Zone A - New England (local)
  MA: 'A',
  ME: 'A',
  NH: 'A',
  RI: 'A',
  VT: 'A',
  // Zone B - Mid-Atlantic
  CT: 'B',
  DC: 'B',
  DE: 'B',
  MD: 'B',
  NJ: 'B',
  NY: 'B',
  PA: 'B',
  // Zone C - Southeast / Near Midwest
  AL: 'C',
  FL: 'C',
  GA: 'C',
  IN: 'C',
  KY: 'C',
  MI: 'C',
  MS: 'C',
  NC: 'C',
  OH: 'C',
  SC: 'C',
  TN: 'C',
  VA: 'C',
  WV: 'C',
  // Zone D - Central / South Central
  AR: 'D',
  IA: 'D',
  IL: 'D',
  KS: 'D',
  LA: 'D',
  MN: 'D',
  MO: 'D',
  ND: 'D',
  NE: 'D',
  OK: 'D',
  SD: 'D',
  TX: 'D',
  WI: 'D',
  // Zone E - West / Mountain
  AZ: 'E',
  CA: 'E',
  CO: 'E',
  ID: 'E',
  MT: 'E',
  NM: 'E',
  NV: 'E',
  OR: 'E',
  UT: 'E',
  WA: 'E',
  WY: 'E',
  // Non-contiguous - require contact
  AK: 'AK',
  HI: 'HI',
  PR: 'PR',
};

// Weight tiers with base rates per zone (in USD)
// Format: [minWeight, maxWeight, zoneA, zoneB, zoneC, zoneD, zoneE]
// PR, HI, AK require contact for quote
export const BASE_RATE_TABLE: Array<{
  minLbs: number;
  maxLbs: number;
  rates: Record<'A' | 'B' | 'C' | 'D' | 'E', number>;
}> = [
  { minLbs: 0, maxLbs: 99, rates: { A: 200, B: 225, C: 250, D: 300, E: 350 } },
  { minLbs: 100, maxLbs: 249, rates: { A: 275, B: 300, C: 325, D: 375, E: 425 } },
  { minLbs: 250, maxLbs: 499, rates: { A: 325, B: 375, C: 400, D: 450, E: 525 } },
  { minLbs: 500, maxLbs: 749, rates: { A: 375, B: 450, C: 500, D: 550, E: 650 } },
  { minLbs: 750, maxLbs: 999, rates: { A: 425, B: 525, C: 600, D: 675, E: 800 } },
  { minLbs: 1000, maxLbs: 1499, rates: { A: 500, B: 625, C: 725, D: 825, E: 975 } },
  { minLbs: 1500, maxLbs: 1999, rates: { A: 600, B: 750, C: 875, D: 1000, E: 1175 } },
  { minLbs: 2000, maxLbs: 2499, rates: { A: 725, B: 900, C: 1050, D: 1200, E: 1400 } },
  { minLbs: 2500, maxLbs: 2999, rates: { A: 850, B: 1050, C: 1225, D: 1400, E: 1625 } },
  { minLbs: 3000, maxLbs: 3499, rates: { A: 975, B: 1200, C: 1400, D: 1600, E: 1875 } },
  { minLbs: 3500, maxLbs: 3999, rates: { A: 1100, B: 1350, C: 1575, D: 1800, E: 2100 } },
  { minLbs: 4000, maxLbs: 4499, rates: { A: 1225, B: 1500, C: 1750, D: 2000, E: 2350 } },
  { minLbs: 4500, maxLbs: 4999, rates: { A: 1350, B: 1650, C: 1925, D: 2200, E: 2575 } },
];

// Maximum weight for automatic quotes - over this requires contact
export const MAX_WEIGHT_FOR_AUTO_QUOTE = 4999;

// Accessorial fees (flat rates in USD)
export const ACCESSORIAL_FEES = {
  liftgatePickup: 55,
  liftgateDelivery: 55,
  residentialPickup: 65,
  residentialDelivery: 65,
  insidePickup: 85,
  insideDelivery: 85,
  limitedAccessPickup: 75,
  limitedAccessDelivery: 75,
  appointmentRequired: 25,
  sortAndSegregate: 35,
  hazmat: 150,
};

// Fuel surcharge percentage (applied to base rate)
export const FUEL_SURCHARGE_PERCENT = 0.20;

// Basic insurance included
export const BASIC_INSURANCE_FEE = 40;

// Buffer/margin percentage (to account for rate variations)
export const RATE_BUFFER_PERCENT = 0.15;

export interface LtlFallbackQuoteRequest {
  destinationState: string;
  weightLbs: number;
  liftgatePickup?: boolean;
  liftgateDelivery?: boolean;
  residentialPickup?: boolean;
  residentialDelivery?: boolean;
  insidePickup?: boolean;
  insideDelivery?: boolean;
  limitedAccessPickup?: boolean;
  limitedAccessDelivery?: boolean;
  appointmentRequired?: boolean;
  hazmat?: boolean;
}

export interface LtlFallbackQuoteResult {
  success: true;
  zone: LtlZone;
  zoneDescription: string;
  baseRate: number;
  fuelSurcharge: number;
  accessorialFees: number;
  accessorialBreakdown: Record<string, number>;
  insurance: number;
  subtotal: number;
  buffer: number;
  totalRate: number;
  transitDaysEstimate: number | null;
  isFallbackRate: true;
}

export interface LtlFallbackQuoteError {
  success: false;
  error: string;
  requiresContact: boolean;
}

export type LtlFallbackQuoteResponse = LtlFallbackQuoteResult | LtlFallbackQuoteError;

/**
 * Estimate transit days based on zone
 */
function estimateTransitDays(zone: LtlZone): number | null {
  switch (zone) {
    case 'A':
      return 2; // Local New England
    case 'B':
      return 3; // Mid-Atlantic
    case 'C':
      return 4; // Southeast / Near Midwest
    case 'D':
      return 5; // Central
    case 'E':
      return 6; // West coast
    default:
      return null; // PR, HI, AK - varies significantly
  }
}

/**
 * Get a fallback LTL shipping quote using the static rate table.
 *
 * Returns a quote for destinations within the 48 contiguous US states + DC.
 * For AK, HI, PR, or shipments over 5000 lbs, returns an error indicating
 * the customer should contact for a quote.
 */
export function getLtlFallbackQuote(
  request: LtlFallbackQuoteRequest
): LtlFallbackQuoteResponse {
  const { destinationState, weightLbs } = request;

  // Normalize state to uppercase
  const state = destinationState.toUpperCase().trim();

  // Look up zone
  const zone = STATE_TO_ZONE[state];
  if (!zone) {
    return {
      success: false,
      error: `Unknown state: ${destinationState}. Please provide a valid 2-letter US state code.`,
      requiresContact: false,
    };
  }

  // Check for non-contiguous states (require contact)
  if (zone === 'AK' || zone === 'HI' || zone === 'PR') {
    return {
      success: false,
      error: `Shipping to ${ZONE_DESCRIPTIONS[zone]} requires a custom quote. Please contact us for pricing.`,
      requiresContact: true,
    };
  }

  // Check weight limits
  if (weightLbs <= 0) {
    return {
      success: false,
      error: 'Weight must be greater than 0 lbs.',
      requiresContact: false,
    };
  }

  if (weightLbs > MAX_WEIGHT_FOR_AUTO_QUOTE) {
    return {
      success: false,
      error: `Shipments over ${MAX_WEIGHT_FOR_AUTO_QUOTE} lbs require a custom quote. Please contact us for pricing.`,
      requiresContact: true,
    };
  }

  // Find the rate tier
  const rateTier = BASE_RATE_TABLE.find(
    (tier) => weightLbs >= tier.minLbs && weightLbs <= tier.maxLbs
  );

  if (!rateTier) {
    return {
      success: false,
      error: `Unable to find rate for weight: ${weightLbs} lbs.`,
      requiresContact: true,
    };
  }

  // Get base rate for zone (zone is guaranteed to be A-E at this point)
  const baseRate = rateTier.rates[zone as 'A' | 'B' | 'C' | 'D' | 'E'];

  // Calculate fuel surcharge
  const fuelSurcharge = Math.round(baseRate * FUEL_SURCHARGE_PERCENT * 100) / 100;

  // Calculate accessorial fees
  const accessorialBreakdown: Record<string, number> = {};
  let accessorialFees = 0;

  if (request.liftgatePickup) {
    accessorialBreakdown['Liftgate Pickup'] = ACCESSORIAL_FEES.liftgatePickup;
    accessorialFees += ACCESSORIAL_FEES.liftgatePickup;
  }
  if (request.liftgateDelivery) {
    accessorialBreakdown['Liftgate Delivery'] = ACCESSORIAL_FEES.liftgateDelivery;
    accessorialFees += ACCESSORIAL_FEES.liftgateDelivery;
  }
  if (request.residentialPickup) {
    accessorialBreakdown['Residential Pickup'] = ACCESSORIAL_FEES.residentialPickup;
    accessorialFees += ACCESSORIAL_FEES.residentialPickup;
  }
  if (request.residentialDelivery) {
    accessorialBreakdown['Residential Delivery'] = ACCESSORIAL_FEES.residentialDelivery;
    accessorialFees += ACCESSORIAL_FEES.residentialDelivery;
  }
  if (request.insidePickup) {
    accessorialBreakdown['Inside Pickup'] = ACCESSORIAL_FEES.insidePickup;
    accessorialFees += ACCESSORIAL_FEES.insidePickup;
  }
  if (request.insideDelivery) {
    accessorialBreakdown['Inside Delivery'] = ACCESSORIAL_FEES.insideDelivery;
    accessorialFees += ACCESSORIAL_FEES.insideDelivery;
  }
  if (request.limitedAccessPickup) {
    accessorialBreakdown['Limited Access Pickup'] = ACCESSORIAL_FEES.limitedAccessPickup;
    accessorialFees += ACCESSORIAL_FEES.limitedAccessPickup;
  }
  if (request.limitedAccessDelivery) {
    accessorialBreakdown['Limited Access Delivery'] = ACCESSORIAL_FEES.limitedAccessDelivery;
    accessorialFees += ACCESSORIAL_FEES.limitedAccessDelivery;
  }
  if (request.appointmentRequired) {
    accessorialBreakdown['Appointment Required'] = ACCESSORIAL_FEES.appointmentRequired;
    accessorialFees += ACCESSORIAL_FEES.appointmentRequired;
  }
  if (request.hazmat) {
    accessorialBreakdown['Hazmat'] = ACCESSORIAL_FEES.hazmat;
    accessorialFees += ACCESSORIAL_FEES.hazmat;
  }

  // Add basic insurance
  const insurance = BASIC_INSURANCE_FEE;

  // Calculate subtotal
  const subtotal = baseRate + fuelSurcharge + accessorialFees + insurance;

  // Add buffer for rate variations
  const buffer = Math.round(subtotal * RATE_BUFFER_PERCENT * 100) / 100;

  // Calculate total
  const totalRate = Math.round((subtotal + buffer) * 100) / 100;

  return {
    success: true,
    zone,
    zoneDescription: ZONE_DESCRIPTIONS[zone],
    baseRate,
    fuelSurcharge,
    accessorialFees,
    accessorialBreakdown,
    insurance,
    subtotal: Math.round(subtotal * 100) / 100,
    buffer,
    totalRate,
    transitDaysEstimate: estimateTransitDays(zone),
    isFallbackRate: true,
  };
}

/**
 * Check if a state is supported for automatic LTL quotes
 */
export function isStateSupported(state: string): boolean {
  const zone = STATE_TO_ZONE[state.toUpperCase().trim()];
  // Only A-E zones are supported for automatic quotes
  return zone === 'A' || zone === 'B' || zone === 'C' || zone === 'D' || zone === 'E';
}

/**
 * Get the zone for a state
 */
export function getZoneForState(state: string): LtlZone | null {
  return STATE_TO_ZONE[state.toUpperCase().trim()] || null;
}
