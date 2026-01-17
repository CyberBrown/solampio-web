/**
 * Category Image Migration Script
 *
 * This script maps hardcoded Cloudflare Image IDs from category-image-mapping.json
 * to the corresponding categories in the database.
 *
 * It populates:
 * - cf_image_id: The Cloudflare Image ID (for use with getCfImageUrl())
 * - cf_category_image_url: The full Cloudflare delivery URL (for ERPNext staff editing)
 *
 * Run via API endpoint: POST /api/admin/migrate-category-images/
 */

// Cloudflare Images account hash
const CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q';

// Category title to Cloudflare Image ID mapping
// This matches the entries in category-image-mapping.json and getLocalCategoryImage()
export const CATEGORY_IMAGE_MAPPING: Record<string, string> = {
  'Accessories': 'cat-accessories',
  'Balance of System': 'cat-balance-of-system',
  'Batteries': 'cat-batteries',
  'Battery Accessories': 'cat-battery-accessories',
  'Breakers and Fuses': 'cat-breakers-and-fuses',
  'Busbars': 'cat-busbars',
  'C&I Energy Storage Systems': 'cat-candi-energy-storage-systems',
  'Charge Controller Accessories': 'cat-charge-controller-accessories',
  'Charge Controllers': 'cat-charge-controllers',
  'Combiners': 'cat-combiners',
  'Commercial Inverters': 'cat-commercial-inverters',
  'DC Appliances': 'cat-dc-appliances',
  'DC Power Supplies': 'cat-dc-power-supplies',
  'Electrical Boxes': 'cat-electrical-boxes',
  'Energy Storage Systems': 'cat-energy-storage-systems',
  'Flashing and Hardware': 'cat-flashing-and-hardware',
  'Grid Tie String Inverters': 'cat-grid-tie-string-inverters',
  'Ground Mounted Solar Panels': 'cat-ground-mounted-solar-panels',
  'Ground Mounts': 'cat-ground-mounts',
  'High Voltage Batteries': 'cat-high-voltage-batteries',
  'Hybrid Solar Battery Inverters': 'cat-hybrid-solar-battery-inverters',
  'Inverter Accessories': 'cat-inverter-accessories',
  'Inverters': 'cat-inverters',
  'Large Flat Roof': 'cat-large-flat-roof',
  'Lightning and Surge Protection': 'cat-lightning-and-surge-protection',
  'Lithium Batteries': 'cat-lithium-batteries',
  'MPPT': 'cat-mppt',
  'Metal Roof': 'cat-metal-roof',
  'Meters, Monitoring and Shunts': 'cat-meters-monitoring-and-shunts',
  'Microinverters': 'cat-microinverters',
  'Mounting Kits': 'cat-mounting-kits',
  'Mounting and Racking': 'cat-mounting-and-racking',
  'Off Grid Inverters': 'cat-off-grid-inverters',
  'Off Grid Solar Panels': 'cat-off-grid-solar-panels',
  'PWM': 'cat-pwm',
  'Pitched Roof Mounts': 'cat-pitched-roof-mounts',
  'Portable Power Packs': 'cat-portable-power-packs',
  'Portable Solar Panels': 'cat-portable-solar-panels',
  'Rack Mounted Batteries': 'cat-rack-mounted-batteries',
  'Rapid Shutdown': 'cat-rapid-shutdown',
  'Replacement Parts': 'cat-replacement-parts',
  'Rooftop Solar Panels': 'cat-rooftop-solar-panels',
  'SWAG': 'cat-swag',
  'Side of Pole': 'cat-side-of-pole',
  'Snap-Fan': 'cat-snap-fan',
  'Solar Panel Pallet Deals': 'cat-solar-panel-pallet-deals',
  'Solar Panels': 'cat-solar-panels',
  'Solar Power Systems': 'cat-solar-power-systems',
  'Solar Training and Education': 'cat-solar-training-and-education',
  'Stacking Controllers': 'cat-stacking-controllers',
  'Top of Pole': 'cat-top-of-pole',
  'Wind Turbines': 'cat-wind-turbines',
  'Wire Management': 'cat-wire-management',
  'Wire Terminals, Splitters and Splicers': 'cat-wire-terminals-splitters-and-splicers',
  'Wire and Cables': 'cat-wire-and-cables',
};

/**
 * Build full Cloudflare delivery URL from image ID
 */
export function buildCfImageUrl(cfImageId: string, variant: string = 'card'): string {
  return `https://imagedelivery.net/${CF_IMAGES_HASH}/${cfImageId}/${variant}`;
}

/**
 * Migration result interface
 */
export interface MigrationResult {
  updated: number;
  skipped: number;
  missing: string[];
  errors: string[];
  details: Array<{
    title: string;
    status: 'updated' | 'skipped' | 'missing' | 'error';
    message?: string;
  }>;
}

/**
 * Run the category image migration
 * Updates cf_image_id and cf_category_image_url for all categories matching the mapping
 */
export async function migrateCategoryImages(
  db: any // D1Database
): Promise<MigrationResult> {
  const result: MigrationResult = {
    updated: 0,
    skipped: 0,
    missing: [],
    errors: [],
    details: [],
  };

  // Get all categories
  const categoriesResponse = await db
    .prepare('SELECT id, title, cf_image_id, cf_category_image_url FROM storefront_categories')
    .all();

  const categoriesList = (categoriesResponse.results || []) as Array<{
    id: string;
    title: string;
    cf_image_id: string | null;
    cf_category_image_url: string | null;
  }>;

  // Track which categories from our mapping were found
  const foundTitles = new Set<string>();

  for (const category of categoriesList) {
    const cfImageId = CATEGORY_IMAGE_MAPPING[category.title];

    if (!cfImageId) {
      // Category not in our mapping - add to missing list for review
      result.missing.push(category.title);
      result.details.push({
        title: category.title,
        status: 'missing',
        message: 'No image mapping found for this category',
      });
      continue;
    }

    foundTitles.add(category.title);

    // Check if already set correctly
    const expectedUrl = buildCfImageUrl(cfImageId, 'card');
    if (category.cf_image_id === cfImageId && category.cf_category_image_url === expectedUrl) {
      result.skipped++;
      result.details.push({
        title: category.title,
        status: 'skipped',
        message: 'Already has correct image mapping',
      });
      continue;
    }

    // Update the category
    try {
      await db
        .prepare(`
          UPDATE storefront_categories
          SET cf_image_id = ?, cf_category_image_url = ?, updated_at = ?
          WHERE id = ?
        `)
        .bind(cfImageId, expectedUrl, new Date().toISOString(), category.id)
        .run();

      result.updated++;
      result.details.push({
        title: category.title,
        status: 'updated',
        message: `Set cf_image_id=${cfImageId}`,
      });
    } catch (error) {
      result.errors.push(`Failed to update ${category.title}: ${error}`);
      result.details.push({
        title: category.title,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Check for mappings that weren't found in the database
  for (const mappedTitle of Object.keys(CATEGORY_IMAGE_MAPPING)) {
    if (!foundTitles.has(mappedTitle)) {
      result.details.push({
        title: mappedTitle,
        status: 'missing',
        message: 'Mapping exists but category not found in database',
      });
    }
  }

  return result;
}
