/**
 * EasyPost API Type Definitions
 * Types for the EasyPost shipping rate lookup API
 */

export interface EasyPostAddress {
  id?: string;
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
  residential?: boolean;
}

export interface EasyPostParcel {
  id?: string;
  length: number; // inches
  width: number; // inches
  height: number; // inches
  weight: number; // ounces
  predefined_package?: string;
}

export interface EasyPostRate {
  id?: string;
  object: 'Rate';
  mode: 'test' | 'production';
  service: string;
  carrier: string;
  carrier_account_id: string;
  rate: string;
  currency: string;
  retail_rate?: string;
  retail_currency?: string;
  list_rate?: string;
  list_currency?: string;
  billing_type: string;
  delivery_days: number | null;
  delivery_date: string | null;
  delivery_date_guaranteed: boolean;
  est_delivery_days?: number;
  shipment_id?: string;
}

export interface EasyPostRateRequest {
  from_address: EasyPostAddress;
  to_address: EasyPostAddress;
  parcel: EasyPostParcel;
  carrier_accounts?: string[];
}

export interface EasyPostRateResponse {
  from_address: EasyPostAddress;
  to_address: EasyPostAddress;
  parcel: EasyPostParcel;
  rates: EasyPostRate[];
  messages: Array<{
    carrier: string;
    type: string;
    message: string;
  }>;
  options: Record<string, unknown>;
}

export interface EasyPostError {
  code: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
