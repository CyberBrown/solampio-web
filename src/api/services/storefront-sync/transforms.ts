/**
 * Transforms for ERPNext → D1 field mapping
 * Maps ERPNext Item, Item Group, and Brand data to D1 tables
 */

import type { CreateD1Product, CreateD1Category, CreateD1Brand } from './types';

// ERPNext Item (simplified - full types in worker/types.ts)
export interface ERPNextItem {
  name: string;
  item_code: string;
  item_name: string;
  description?: string;
  brand?: string;
  item_group?: string;
  standard_rate?: number;
  disabled?: number;
  custom_cf_image_id?: string;
  weight_per_unit?: number;
  weight_uom?: string;
  custom_website_categories?: string; // JSON array or comma-separated
  custom_show_in_website?: number;
  has_variants?: number; // 1 if this is a template item with variants
  variant_of?: string; // Parent item code if this is a variant
  custom_is_featured?: number; // 1 to show in featured sections on homepage
  custom_featured_in_category?: string; // Item Group name for featuring in nav/headers
  // Shipping dimensions (standard ERPNext fields)
  shipping_weight?: number;
  shipping_weight_uom?: string;
  shipping_length?: number;
  shipping_width?: number;
  shipping_height?: number;
  shipping_dimension_uom?: string;
  // Shipping qualifications
  ships_usps?: number;
  ships_ups?: number;
  ships_ltl?: number;
  ships_pickup?: number;
  // Hazmat and oversized
  hazmat_flag?: number;
  hazmat_class?: string;
  oversized_flag?: number;
  // Variant inheritance
  inherit_shipping_from_parent?: number;
  // Search boost for ranking control
  custom_search_boost?: number; // Default 1.0, 0 or negative hides from search
}

// ERPNext Item Group
export interface ERPNextItemGroup {
  name: string;
  item_group_name?: string;
  parent_item_group?: string;
  is_group?: number;
  custom_slug?: string;
  custom_sort_order?: number;
  custom_show_in_website?: number; // Controls visibility on storefront (0 or 1)
  custom_cf_image_id?: string;
}

// ERPNext Brand
export interface ERPNextBrand {
  name: string;
  brand?: string;
  custom_cf_image_id?: string;
  custom_bc_custom_url?: string;
  custom_show_in_website?: number; // Controls visibility on storefront (0 or 1)
}

// ERPNext Item Price
export interface ERPNextItemPrice {
  item_code: string;
  price_list: string;
  price_list_rate: number;
}

/**
 * Generate a slug from a title
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Clean a slug by stripping leading/trailing slashes
 * Used when importing slugs from BigCommerce URLs
 */
export function cleanSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, '');
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Transform ERPNext Item → D1 Product
 */
export function transformItem(
  item: ERPNextItem,
  options?: {
    existingId?: string;
    prices?: ERPNextItemPrice[];
    brandMap?: Map<string, string>; // ERPNext brand name → D1 brand ID
    categoryMap?: Map<string, string>; // ERPNext item group → D1 category ID
  }
): CreateD1Product {
  const { existingId, prices, brandMap, categoryMap } = options || {};

  // Get retail price
  const retailPrice = prices?.find(p => p.price_list === 'Standard Selling')?.price_list_rate;
  const salePrice = prices?.find(p => p.price_list === 'Sale Price')?.price_list_rate;

  // Get category from item_group (primary source of truth)
  // item_group is the ERPNext field that determines which category the product belongs to
  let categoryIds: string[] = [];
  if (item.item_group && categoryMap) {
    const catId = categoryMap.get(item.item_group);
    if (catId) categoryIds = [catId];
  }

  // Convert weight to lbs if needed
  let weightLbs = item.weight_per_unit;
  if (weightLbs && item.weight_uom === 'Kg') {
    weightLbs = weightLbs * 2.20462;
  }

  // Map featured_in_category (Item Group name) to D1 category ID
  let featuredCategoryId: string | undefined;
  if (item.custom_featured_in_category && categoryMap) {
    featuredCategoryId = categoryMap.get(item.custom_featured_in_category);
  }

  // Auto-set is_featured if a featured category is specified
  // This way users only need to set the category dropdown, not also check a checkbox
  const isFeatured = item.custom_is_featured === 1 || !!featuredCategoryId;

  // Convert shipping weight to lbs if needed
  let shippingWeight = item.shipping_weight;
  if (shippingWeight && item.shipping_weight_uom === 'kg') {
    shippingWeight = shippingWeight * 2.20462;
  }

  return {
    id: existingId || generateId(),
    erpnext_name: item.name,
    sku: item.item_code,
    title: item.item_name,
    description: item.description || undefined,
    brand_id: item.brand && brandMap ? brandMap.get(item.brand) : undefined,
    price: retailPrice || item.standard_rate,
    sale_price: salePrice,
    stock_qty: 0, // Stock would come from a separate sync
    is_visible: item.disabled !== 1 && item.custom_show_in_website !== 0,
    cf_image_id: item.custom_cf_image_id || undefined,
    weight_lbs: weightLbs,
    categories: categoryIds.length > 0 ? categoryIds : undefined,
    has_variants: item.has_variants === 1,
    variant_of: item.variant_of || undefined,
    is_featured: isFeatured,
    featured_category_id: featuredCategoryId,
    // Shipping dimensions (using standard ERPNext fields)
    shipping_weight: shippingWeight,
    shipping_weight_uom: item.shipping_weight_uom || (shippingWeight ? 'lb' : undefined),
    shipping_length: item.shipping_length,
    shipping_width: item.shipping_width,
    shipping_height: item.shipping_height,
    shipping_dimension_uom: item.shipping_dimension_uom || (item.shipping_length || item.shipping_width || item.shipping_height ? 'in' : undefined),
    // Shipping qualifications
    ships_usps: item.ships_usps === 1,
    ships_ups: item.ships_ups === 1,
    ships_ltl: item.ships_ltl === 1,
    ships_pickup: item.ships_pickup === 1,
    // Hazmat and oversized
    hazmat_flag: item.hazmat_flag === 1,
    hazmat_class: item.hazmat_class,
    oversized_flag: item.oversized_flag === 1,
    // Variant inheritance
    inherit_shipping_from_parent: item.inherit_shipping_from_parent === 1,
    // Search boost (default 1.0 if not set)
    search_boost: item.custom_search_boost ?? 1.0,
  };
}

/**
 * Transform ERPNext Item Group → D1 Category
 */
export function transformItemGroup(
  group: ERPNextItemGroup,
  options?: {
    existingId?: string;
    parentMap?: Map<string, string>; // ERPNext name → D1 ID
  }
): CreateD1Category {
  const { existingId, parentMap } = options || {};
  const title = group.item_group_name || group.name;

  // custom_show_in_website controls visibility (default to visible if not set)
  const isVisible = group.custom_show_in_website !== 0;

  return {
    id: existingId || generateId(),
    erpnext_name: group.name,
    title,
    slug: group.custom_slug || slugify(title),
    parent_id: group.parent_item_group && parentMap
      ? parentMap.get(group.parent_item_group)
      : undefined,
    sort_order: group.custom_sort_order || 0,
    is_visible: isVisible,
    cf_image_id: group.custom_cf_image_id || undefined,
  };
}

/**
 * Transform ERPNext Brand → D1 Brand
 */
export function transformBrand(
  brand: ERPNextBrand,
  options?: {
    existingId?: string;
  }
): CreateD1Brand {
  const { existingId } = options || {};
  const title = brand.brand || brand.name;

  // Clean the BigCommerce URL slug (strip leading/trailing slashes)
  const slug = brand.custom_bc_custom_url
    ? cleanSlug(brand.custom_bc_custom_url)
    : slugify(title);

  // custom_show_in_website controls visibility (default to visible if not set)
  const isVisible = brand.custom_show_in_website !== 0;

  return {
    id: existingId || generateId(),
    erpnext_name: brand.name,
    title,
    slug,
    logo_cf_image_id: brand.custom_cf_image_id || undefined,
    is_visible: isVisible,
  };
}

/**
 * Detect changes between existing D1 record and new ERPNext data
 */
export function hasProductChanged(
  existing: {
    title: string;
    description: string | null;
    price: number | null;
    sale_price: number | null;
    is_visible: number;
    cf_image_id: string | null;
    categories: string | null;
    is_featured: number;
    featured_category_id: string | null;
    // Shipping fields
    shipping_weight?: number | null;
    shipping_weight_uom?: string | null;
    shipping_length?: number | null;
    shipping_width?: number | null;
    shipping_height?: number | null;
    shipping_dimension_uom?: string | null;
    ships_usps?: number;
    ships_ups?: number;
    ships_ltl?: number;
    ships_pickup?: number;
    hazmat_flag?: number;
    hazmat_class?: string | null;
    oversized_flag?: number;
    inherit_shipping_from_parent?: number;
    search_boost?: number;
  },
  incoming: CreateD1Product
): boolean {
  if (existing.title !== incoming.title) return true;
  if ((existing.description || null) !== (incoming.description || null)) return true;
  if (existing.price !== incoming.price) return true;
  if (existing.sale_price !== incoming.sale_price) return true;
  if (existing.is_visible !== (incoming.is_visible ? 1 : 0)) return true;
  if ((existing.cf_image_id || null) !== (incoming.cf_image_id || null)) return true;
  if (existing.is_featured !== (incoming.is_featured ? 1 : 0)) return true;
  if ((existing.featured_category_id || null) !== (incoming.featured_category_id || null)) return true;

  // Compare categories (JSON arrays)
  const existingCats = existing.categories ? JSON.parse(existing.categories) : [];
  const incomingCats = incoming.categories || [];
  if (JSON.stringify(existingCats.sort()) !== JSON.stringify(incomingCats.sort())) return true;

  // Compare shipping dimensions
  if ((existing.shipping_weight ?? null) !== (incoming.shipping_weight ?? null)) return true;
  if ((existing.shipping_weight_uom ?? null) !== (incoming.shipping_weight_uom ?? null)) return true;
  if ((existing.shipping_length ?? null) !== (incoming.shipping_length ?? null)) return true;
  if ((existing.shipping_width ?? null) !== (incoming.shipping_width ?? null)) return true;
  if ((existing.shipping_height ?? null) !== (incoming.shipping_height ?? null)) return true;
  if ((existing.shipping_dimension_uom ?? null) !== (incoming.shipping_dimension_uom ?? null)) return true;

  // Compare shipping qualifications
  if ((existing.ships_usps ?? 0) !== (incoming.ships_usps ? 1 : 0)) return true;
  if ((existing.ships_ups ?? 0) !== (incoming.ships_ups ? 1 : 0)) return true;
  if ((existing.ships_ltl ?? 0) !== (incoming.ships_ltl ? 1 : 0)) return true;
  if ((existing.ships_pickup ?? 0) !== (incoming.ships_pickup ? 1 : 0)) return true;

  // Compare hazmat and oversized
  if ((existing.hazmat_flag ?? 0) !== (incoming.hazmat_flag ? 1 : 0)) return true;
  if ((existing.hazmat_class ?? null) !== (incoming.hazmat_class ?? null)) return true;
  if ((existing.oversized_flag ?? 0) !== (incoming.oversized_flag ? 1 : 0)) return true;

  // Compare variant inheritance
  if ((existing.inherit_shipping_from_parent ?? 0) !== (incoming.inherit_shipping_from_parent ? 1 : 0)) return true;

  // Compare search boost
  if ((existing.search_boost ?? 1.0) !== (incoming.search_boost ?? 1.0)) return true;

  return false;
}

export function hasCategoryChanged(
  existing: {
    title: string;
    slug: string;
    parent_id: string | null;
    sort_order: number;
    is_visible: number;
    cf_image_id: string | null;
  },
  incoming: CreateD1Category
): boolean {
  if (existing.title !== incoming.title) return true;
  if (existing.slug !== incoming.slug) return true;
  if ((existing.parent_id || null) !== (incoming.parent_id || null)) return true;
  if (existing.sort_order !== (incoming.sort_order || 0)) return true;
  if (existing.is_visible !== (incoming.is_visible ? 1 : 0)) return true;
  if ((existing.cf_image_id || null) !== (incoming.cf_image_id || null)) return true;
  return false;
}

export function hasBrandChanged(
  existing: {
    title: string;
    slug: string;
    logo_cf_image_id: string | null;
    is_visible: number;
  },
  incoming: CreateD1Brand
): boolean {
  if (existing.title !== incoming.title) return true;
  if (existing.slug !== incoming.slug) return true;
  if ((existing.logo_cf_image_id || null) !== (incoming.logo_cf_image_id || null)) return true;
  if (existing.is_visible !== (incoming.is_visible ? 1 : 0)) return true;
  return false;
}
