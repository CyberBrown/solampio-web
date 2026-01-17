/**
 * Cloudflare Images Utility
 *
 * Provides helpers for constructing CF Images delivery URLs
 * from stored image IDs.
 */

// CF Images account hash - this is the public delivery hash
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

// Available image variants (configured in CF Images dashboard)
// NOTE: 'detail' (800px) and 'zoom' (1600px) variants need to be configured in CF Images dashboard
// See documentation below for configuration specs
export type ImageVariant = 'thumbnail' | 'card' | 'product' | 'hero' | 'detail' | 'zoom';

/**
 * CF Images Variant Configuration Requirements
 *
 * Configure these variants in Cloudflare Images dashboard:
 *
 * | Variant    | Max Width | Fit     | Purpose                    |
 * |------------|-----------|---------|----------------------------|
 * | thumbnail  | 150px     | contain | Gallery thumbnails         |
 * | card       | 400px     | contain | Product cards, listings    |
 * | product    | 600px     | contain | Standard product view      |
 * | detail     | 800px     | contain | Main gallery display       |
 * | zoom       | 1600px    | contain | Zoom/magnify functionality |
 * | hero       | 1200px    | contain | Hero banners, large images |
 *
 * To configure in CF Dashboard:
 * 1. Go to Images > Variants
 * 2. Create new variant with name matching above
 * 3. Set "Fit" to "Contain" (maintains aspect ratio)
 * 4. Set "Max width" to the specified pixel value
 * 5. Leave height empty (auto-calculated)
 */

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
 * Brand logo variant types
 */
export type BrandLogoVariant = 'full' | 'thumb' | 'greyscale';

/**
 * Get brand logo URL with support for greyscale variant
 * Used for brand scroll component
 *
 * @param brand - Brand with logo image fields
 * @param logoVariant - Which logo variant to use
 * @returns Logo URL or null
 */
export function getBrandLogoVariant(
  brand: {
    logo_cf_image_id?: string | null;
    logo_thumb_cf_id?: string | null;
    logo_greyscale_cf_id?: string | null;
    logo_url?: string | null;
  },
  logoVariant: BrandLogoVariant = 'full'
): string | null {
  // Select the appropriate CF image ID based on variant
  let cfImageId: string | null | undefined = null;

  switch (logoVariant) {
    case 'thumb':
      cfImageId = brand.logo_thumb_cf_id || brand.logo_cf_image_id;
      break;
    case 'greyscale':
      cfImageId = brand.logo_greyscale_cf_id || brand.logo_cf_image_id;
      break;
    case 'full':
    default:
      cfImageId = brand.logo_cf_image_id;
      break;
  }

  if (cfImageId) {
    // Use 'public' variant for direct delivery
    return `https://imagedelivery.net/${CF_IMAGES_HASH}/${cfImageId}/public`;
  }

  // Fallback to legacy logo_url
  return brand.logo_url || null;
}

/**
 * Get category image URL from CF Images or fallback
 *
 * Priority order:
 * 1. cf_category_image_url (full URL stored in ERPNext)
 * 2. cf_image_id (construct URL from ID)
 * 3. image_url (legacy fallback)
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
    cf_category_image_url?: string | null;
    image_url?: string | null;
  },
  variant: ImageVariant = 'card'
): string | null {
  // Prefer direct URL from ERPNext (allows staff to edit)
  if (category.cf_category_image_url) {
    // If the URL already has a variant, return as-is; otherwise replace variant
    const url = category.cf_category_image_url;
    // Check if URL ends with a known variant
    const variants = ['thumbnail', 'card', 'product', 'hero'];
    const currentVariant = variants.find(v => url.endsWith(`/${v}`));
    if (currentVariant && currentVariant !== variant) {
      return url.replace(`/${currentVariant}`, `/${variant}`);
    }
    return url;
  }
  // Fall back to constructing from cf_image_id
  if (category.cf_image_id) {
    return getCfImageUrl(category.cf_image_id, variant);
  }
  return category.image_url || null;
}

/**
 * Get local category image URL by category title
 * Maps category titles to local image files in /images/
 * URLs are encoded to handle spaces and special characters
 *
 * @param title - The category title (e.g., "Batteries", "Solar Panels")
 * @returns Local image URL or null if not found
 */
export function getLocalCategoryImage(title: string): string | null {
  // Direct mapping for categories with local images
  // File names are URL-encoded to handle spaces
  const localImages: Record<string, string> = {
    'Accessories': '/images/Accessories.png',
    'Balance of System': '/images/Balance%20of%20System.png',
    'Batteries': '/images/Batteries.png',
    'Battery Accessories': '/images/Battery%20Accessories.png',
    'Breakers and Fuses': '/images/Breakers%20and%20Fuses.png',
    'Busbars': '/images/Busbars.png',
    'C&I Energy Storage Systems': '/images/C%26I%20Energy%20Storage%20Systems.png',
    'Charge Controller Accessories': '/images/Charge%20Controller%20Accessories.png',
    'Charge Controllers': '/images/Charge%20Controllers.png',
    'Combiners': '/images/Combiners.png',
    'Commercial Inverters': '/images/Commercial%20Inverters.png',
    'DC Appliances': '/images/DC%20Appliances.png',
    'DC Power Supplies': '/images/DC%20Power%20Supplies.png',
    'Electrical Boxes': '/images/Electrical%20Boxes.png',
    'Energy Storage Systems': '/images/Energy%20Storage%20Systems.png',
    'Flashing and Hardware': '/images/Flashing%20and%20Hardware.png',
    'Grid Tie String Inverters': '/images/Grid%20Tie%20String%20Inverters.png',
    'Ground Mounted Solar Panels': '/images/Ground%20Mounted%20Solar%20Panels.png',
    'Ground Mounts': '/images/Ground%20Mounts.png',
    'High Voltage Batteries': '/images/High%20Voltage%20Batteries.png',
    'Hybrid Solar Battery Inverters': '/images/Hybrid%20Solar%20Battery%20Inverters.png',
    'Inverter Accessories': '/images/Inverter%20Accessories.png',
    'Inverters': '/images/Inverters.png',
    'Large Flat Roof': '/images/Large%20Flat%20Roof.png',
    'Lightning and Surge Protection': '/images/Lightning%20and%20Surge%20Protection.png',
    'Lithium Batteries': '/images/Lithium%20Batteries.png',
    'MPPT': '/images/MPPT.png',
    'Metal Roof': '/images/Metal%20Roof.png',
    'Meters, Monitoring and Shunts': '/images/Meters%2C%20Monitoring%20and%20Shunts.png',
    'Microinverters': '/images/Microinverters.png',
    'Mounting Kits': '/images/Mounting%20Kits.png',
    'Mounting and Racking': '/images/Mounting%20and%20Racking.png',
    'Off Grid Inverters': '/images/Off%20Grid%20Inverters.png',
    'Off Grid Solar Panels': '/images/Off%20Grid%20Solar%20Panels.png',
    'PWM': '/images/PWM.png',
    'Pitched Roof Mounts': '/images/Pitched%20Roof%20Mounts.png',
    'Portable Power Packs': '/images/Portable%20Power%20Packs.png',
    'Portable Solar Panels': '/images/Portable%20Solar%20Panels.png',
    'Rack Mounted Batteries': '/images/Rack%20Mounted%20Batteries.png',
    'Rapid Shutdown': '/images/Rapid%20Shutdown.png',
    'Replacement Parts': '/images/Replacement%20Parts.png',
    'Rooftop Solar Panels': '/images/Rooftop%20Solar%20Panels.png',
    'SWAG': '/images/SWAG.png',
    'Side of Pole': '/images/Side%20of%20Pole.png',
    'Snap-Fan': '/images/Snap-Fan.png',
    'Solar Panel Pallet Deals': '/images/Solar%20Panel%20Pallet%20Deals.png',
    'Solar Panels': '/images/solar%20panels.png',
    'Solar Power Systems': '/images/Solar%20Power%20Systems.png',
    'Solar Training and Education': '/images/Solar%20Training%20and%20Education.png',
    'Stacking Controllers': '/images/Stacking%20Controllers.png',
    'Top of Pole': '/images/Top%20of%20Pole.png',
    'Wind Turbines': '/images/Wind%20Turbines.png',
    'Wire Management': '/images/Wire%20Management.png',
    'Wire Terminals, Splitters and Splicers': '/images/Wire%20Terminals%2C%20Splitters%20and%20Splicers.png',
    'Wire and Cables': '/images/Wire%20and%20Cables.png',
  };

  return localImages[title] || null;
}
