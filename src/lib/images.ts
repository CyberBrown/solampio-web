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

/**
 * Get local category image URL by category title
 * Maps category titles to local image files in /images/
 *
 * @param title - The category title (e.g., "Batteries", "Solar Panels")
 * @returns Local image URL or null if not found
 */
export function getLocalCategoryImage(title: string): string | null {
  // Direct mapping for categories with local images
  const localImages: Record<string, string> = {
    'Accessories': '/images/Accessories.png',
    'Balance of System': '/images/Balance of System.png',
    'Batteries': '/images/Batteries.png',
    'Battery Accessories': '/images/Battery Accessories.png',
    'Breakers and Fuses': '/images/Breakers and Fuses.png',
    'Busbars': '/images/Busbars.png',
    'C&I Energy Storage Systems': '/images/C&I Energy Storage Systems.png',
    'Charge Controller Accessories': '/images/Charge Controller Accessories.png',
    'Charge Controllers': '/images/Charge Controllers.png',
    'Combiners': '/images/Combiners.png',
    'Commercial Inverters': '/images/Commercial Inverters.png',
    'DC Appliances': '/images/DC Appliances.png',
    'DC Power Supplies': '/images/DC Power Supplies.png',
    'Electrical Boxes': '/images/Electrical Boxes.png',
    'Energy Storage Systems': '/images/Energy Storage Systems.png',
    'Flashing and Hardware': '/images/Flashing and Hardware.png',
    'Grid Tie String Inverters': '/images/Grid Tie String Inverters.png',
    'Ground Mounted Solar Panels': '/images/Ground Mounted Solar Panels.png',
    'Ground Mounts': '/images/Ground Mounts.png',
    'High Voltage Batteries': '/images/High Voltage Batteries.png',
    'Hybrid Solar Battery Inverters': '/images/Hybrid Solar Battery Inverters.png',
    'Inverter Accessories': '/images/Inverter Accessories.png',
    'Inverters': '/images/Inverters.png',
    'Large Flat Roof': '/images/Large Flat Roof.png',
    'Lightning and Surge Protection': '/images/Lightning and Surge Protection.png',
    'Lithium Batteries': '/images/Lithium Batteries.png',
    'MPPT': '/images/MPPT.png',
    'Metal Roof': '/images/Metal Roof.png',
    'Meters, Monitoring and Shunts': '/images/Meters, Monitoring and Shunts.png',
    'Microinverters': '/images/Microinverters.png',
    'Mounting Kits': '/images/Mounting Kits.png',
    'Mounting and Racking': '/images/Mounting and Racking.png',
    'Off Grid Inverters': '/images/Off Grid Inverters.png',
    'Off Grid Solar Panels': '/images/Off Grid Solar Panels.png',
    'PWM': '/images/PWM.png',
    'Pitched Roof Mounts': '/images/Pitched Roof Mounts.png',
    'Portable Power Packs': '/images/Portable Power Packs.png',
    'Portable Solar Panels': '/images/Portable Solar Panels.png',
    'Rack Mounted Batteries': '/images/Rack Mounted Batteries.png',
    'Rapid Shutdown': '/images/Rapid Shutdown.png',
    'Replacement Parts': '/images/Replacement Parts.png',
    'Rooftop Solar Panels': '/images/Rooftop Solar Panels.png',
    'SWAG': '/images/SWAG.png',
    'Side of Pole': '/images/Side of Pole.png',
    'Snap-Fan': '/images/Snap-Fan.png',
    'Solar Panel Pallet Deals': '/images/Solar Panel Pallet Deals.png',
    'Solar Panels': '/images/solar panels.png',
    'Solar Power Systems': '/images/Solar Power Systems.png',
    'Solar Training and Education': '/images/Solar Training and Education.png',
    'Stacking Controllers': '/images/Stacking Controllers.png',
    'Top of Pole': '/images/Top of Pole.png',
    'Wind Turbines': '/images/Wind Turbines.png',
    'Wire Management': '/images/Wire Management.png',
    'Wire Terminals, Splitters and Splicers': '/images/Wire Terminals, Splitters and Splicers.png',
    'Wire and Cables': '/images/Wire and Cables.png',
  };

  return localImages[title] || null;
}
