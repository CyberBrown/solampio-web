/**
 * Cloudflare Images Utility
 *
 * Provides helpers for constructing CF Images delivery URLs
 * from stored image IDs.
 */

// CF Images account hash - this is the public delivery hash
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

// Available image variants (configured in CF Images dashboard)
export type ImageVariant = 'thumbnail' | 'card' | 'product' | 'hero';

/**
 * Construct a Cloudflare Images delivery URL
 *
 * @param cfImageId - The CF Image ID (e.g., "prod-121-3e836c2a")
 * @param variant - The image variant to use
 * @returns Full delivery URL or null if no image ID provided
 *
 * @example
 * getCfImageUrl('prod-121-3e836c2a', 'card')
 * // => 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/prod-121-3e836c2a/card'
 */
export function getCfImageUrl(
  cfImageId: string | null | undefined,
  variant: ImageVariant = 'product'
): string | null {
  if (!cfImageId) return null;
  return `https://imagedelivery.net/${CF_IMAGES_HASH}/${cfImageId}/${variant}`;
}

/**
 * Get the best available image URL for a product
 * Prefers CF Images, falls back to legacy URLs
 *
 * @param product - Product with image fields
 * @param variant - CF Images variant to use
 * @returns Best available image URL or null
 */
export function getProductImageUrl(
  product: {
    cf_image_id?: string | null;
    image_url?: string | null;
    thumbnail_url?: string | null;
  },
  variant: ImageVariant = 'product'
): string | null {
  // Prefer CF Images
  if (product.cf_image_id) {
    return getCfImageUrl(product.cf_image_id, variant);
  }
  // Fall back to legacy URLs
  return product.image_url || product.thumbnail_url || null;
}

/**
 * Get the best available thumbnail URL for a product
 * Uses 'card' variant for CF Images, falls back to thumbnail_url
 */
export function getProductThumbnail(
  product: {
    cf_image_id?: string | null;
    thumbnail_url?: string | null;
    image_url?: string | null;
  }
): string | null {
  if (product.cf_image_id) {
    return getCfImageUrl(product.cf_image_id, 'card');
  }
  return product.thumbnail_url || product.image_url || null;
}

/**
 * Get brand logo URL from CF Images or fallback
 */
export function getBrandLogoUrl(
  brand: {
    logo_cf_image_id?: string | null;
    logo_url?: string | null;
  },
  variant: ImageVariant = 'thumbnail'
): string | null {
  if (brand.logo_cf_image_id) {
    return getCfImageUrl(brand.logo_cf_image_id, variant);
  }
  return brand.logo_url || null;
}

/**
 * Get category image URL from CF Images or fallback
 *
 * @param category - Category with image fields
 * @param variant - CF Images variant to use (default: 'card')
 * @returns Category image URL or null
 *
 * @example
 * getCategoryImageUrl({ cf_image_id: 'cat-batteries' }, 'hero')
 * // => 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-batteries/hero'
 */
export function getCategoryImageUrl(
  category: {
    cf_image_id?: string | null;
    image_url?: string | null;
  },
  variant: ImageVariant = 'card'
): string | null {
  if (category.cf_image_id) {
    return getCfImageUrl(category.cf_image_id, variant);
  }
  return category.image_url || null;
}
