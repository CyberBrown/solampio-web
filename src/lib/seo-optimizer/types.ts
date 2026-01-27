export interface FAQ {
  question: string;
  answer: string;
}

export interface CompetitorIntel {
  name: string;
  url: string;
  price: string | null;
  differentiators: string[];
}

export interface SEOFields {
  seo_title: string | null;
  seo_meta_description: string | null;
  seo_description_summary: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_keywords: string[] | null;
  seo_robots: string;
  seo_faqs: FAQ[] | null;
  seo_related_searches: string[] | null;
  seo_use_cases: string[] | null;
  description_original: string | null;
  seo_last_optimized: string | null;
  seo_competitor_data: CompetitorIntel[] | null;
}

export interface SEOOptimizationResult extends Omit<SEOFields, 'description_original' | 'seo_last_optimized'> {
  optimized_description: string;
}

// Google Merchant Center types

export type GMCCondition = 'new' | 'refurbished' | 'used';
export type GMCAvailability = 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
export type GMCShippingLabel = 'standard' | 'oversized' | 'freight' | 'ltl';
export type MarginTier = 'high_margin' | 'medium_margin' | 'low_margin';
export type BrandTier = 'premium' | 'mid_tier' | 'value';
export type Seasonality = 'always_on' | 'seasonal' | 'new_launch';
export type PromoEligibility = 'promo_eligible' | 'map_protected' | 'clearance';

export interface GMCCustomLabels {
  margin_tier: MarginTier;
  product_type: string;
  brand_tier: BrandTier;
  seasonality: Seasonality;
  promo_eligible: PromoEligibility;
}

export interface GMCFields {
  gmc_google_category: string | null;
  gmc_product_type: string | null;
  gmc_condition: GMCCondition;
  gmc_availability: GMCAvailability;
  gmc_shipping_label: GMCShippingLabel | null;
  gmc_custom_label_0: string | null;  // margin_tier
  gmc_custom_label_1: string | null;  // product_type
  gmc_custom_label_2: string | null;  // brand_tier
  gmc_custom_label_3: string | null;  // seasonality
  gmc_custom_label_4: string | null;  // promo_eligible
  gmc_additional_images: string[] | null;  // Array of CF image IDs
  gtin: string | null;
  mpn: string | null;
}

export interface GMCOptimizationResult {
  gmc_google_category: string;
  gmc_product_type: string;
  gmc_condition: GMCCondition;
  gmc_shipping_label: GMCShippingLabel;
  gmc_custom_labels: GMCCustomLabels;
}

export interface FullOptimizationResult extends SEOOptimizationResult, GMCOptimizationResult {}
