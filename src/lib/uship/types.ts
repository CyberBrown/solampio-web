/**
 * uShip LTL Connect API Type Definitions
 * Based on the LTL Connect guide: https://developer.uship.com/shipper-api-guides/ltl-connect-guide
 */

export interface UShipConfig {
  apiKey: string;
}

// LTL Connect Request Types

export type UShipHandlingUnit =
  | 'Pallets48x40Inches'
  | 'Pallets48x48Inches'
  | 'Pallets42x42Inches'
  | 'Pallets40x40Inches'
  | 'Crates'
  | 'Boxes'
  | 'Drums'
  | 'Bags'
  | 'Bundles'
  | 'Loose'
  | 'Rolls'
  | 'Totes';

export type UShipLocationType =
  | 'BusinessWithLoadingDockOrForklift'
  | 'BusinessWithoutLoadingDockOrForklift'
  | 'Residence'
  | 'PortOrStorage'
  | 'ConstructionSite'
  | 'TradeShow';

export type UShipAccessorial =
  | 'PickupLiftgateRequired'
  | 'PickupInside'
  | 'DeliveryLiftgateRequired'
  | 'DeliveryInside'
  | 'DeliveryAppointmentRequired'
  | 'DeliveryCallAhead'
  | 'ProtectFromFreezing'
  | 'SortAndSegregate'
  | 'BlindShipmentCoordination'
  | 'Hazmat';

export interface UShipListingContent {
  quantity: number;
  description: string;
  handlingUnit: UShipHandlingUnit | string;
}

export interface UShipItem {
  handlingUnit: UShipHandlingUnit | string;
  quantity: number;
  height: number; // inches
  width: number; // inches
  length: number; // inches
  weight: number; // lbs
  title?: string;
  description?: string;
  freightClass?: number;
  listingContents?: UShipListingContent[];
}

export interface UShipContact {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UShipReferenceNumber {
  number: string;
  type: 'SalesOrder' | 'PurchaseOrder' | 'BillOfLading' | 'ProNumber' | 'Other';
}

export interface UShipLTLConnectRequest {
  items: UShipItem[];
  // Origin
  originAddress?: string;
  originAddress2?: string;
  originPostalCode: string;
  originCity?: string;
  originState?: string;
  originLocationType?: UShipLocationType;
  originContact?: UShipContact;
  // Destination
  destinationAddress?: string;
  destinationAddress2?: string;
  destinationPostalCode: string;
  destinationCity?: string;
  destinationState?: string;
  destinationLocationType?: UShipLocationType;
  destinationContact?: UShipContact;
  // Dates (ISO 8601 format: "2023-07-03T11:00:00")
  earliestPickupDate?: string;
  latestPickupDate?: string;
  // Instructions
  pickupInstructions?: string;
  deliveryInstructions?: string;
  // Reference numbers
  referenceNumbers?: UShipReferenceNumber[];
  // Accessorials (additional services)
  quoteRequestAccessorials?: UShipAccessorial[];
}

// LTL Connect Response Types

export interface UShipCarrierQuote {
  carrierId: string;
  carrierName: string;
  carrierLogoUrl?: string;
  serviceType?: string;
  transitDays?: number;
  estimatedDeliveryDate?: string;
  guaranteedDelivery?: boolean;
  price: {
    total: number;
    currency: string;
    breakdown?: {
      linehaul?: number;
      fuel?: number;
      accessorials?: number;
    };
  };
  quoteId: string;
  expiresAt?: string;
}

export interface UShipLTLConnectResponse {
  quoteRequestId: string;
  status: 'Pending' | 'Complete' | 'Failed';
  quotes: UShipCarrierQuote[];
  messages?: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

export interface UShipError {
  error?: string;
  error_description?: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Legacy types for backwards compatibility
export interface UShipRateRequest {
  route: {
    items: Array<{
      address: {
        postalCode: string;
        country: string;
        type?: string;
      };
      timeFrame?: {
        earliestArrival: string;
        latestArrival: string;
        timeFrameType: string;
      };
      attributes?: {
        liftgateRequired?: boolean;
      };
    }>;
  };
  items: Array<{
    commodity: string;
    unitCount: number;
    packaging: string;
    weightInGrams: number;
    lengthInCm?: number;
    widthInCm?: number;
    heightInCm?: number;
    description?: string;
  }>;
}

export interface UShipRate {
  id: string;
  price: {
    value: number;
    currency: string;
    label: string;
  };
  serviceProvider?: {
    id: string;
    name: string;
    rating?: number;
  };
  estimatedTransitDays?: number;
  serviceType?: string;
}

export interface UShipEstimate {
  route?: {
    distance?: {
      kilometers: number;
      label: string;
    };
  };
  price?: {
    value: number;
    label: string;
  };
}

export interface UShipTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
