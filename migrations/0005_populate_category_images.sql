-- Migration: Populate Category Images from Cloudflare Image IDs
-- Maps hardcoded Cloudflare Image IDs to categories in storefront_categories
-- CF_IMAGES_HASH = 'Fdrr4r8cVWsy-JJCR0JU_Q'

-- Update categories with their Cloudflare image URLs
-- Each category gets both cf_image_id (short ID) and cf_category_image_url (full URL)

UPDATE storefront_categories SET
  cf_image_id = 'cat-accessories',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-accessories/card'
WHERE title = 'Accessories';

UPDATE storefront_categories SET
  cf_image_id = 'cat-balance-of-system',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-balance-of-system/card'
WHERE title = 'Balance of System';

UPDATE storefront_categories SET
  cf_image_id = 'cat-batteries',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-batteries/card'
WHERE title = 'Batteries';

UPDATE storefront_categories SET
  cf_image_id = 'cat-battery-accessories',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-battery-accessories/card'
WHERE title = 'Battery Accessories';

UPDATE storefront_categories SET
  cf_image_id = 'cat-breakers-and-fuses',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-breakers-and-fuses/card'
WHERE title = 'Breakers and Fuses';

UPDATE storefront_categories SET
  cf_image_id = 'cat-busbars',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-busbars/card'
WHERE title = 'Busbars';

UPDATE storefront_categories SET
  cf_image_id = 'cat-candi-energy-storage-systems',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-candi-energy-storage-systems/card'
WHERE title = 'C&I Energy Storage Systems';

UPDATE storefront_categories SET
  cf_image_id = 'cat-charge-controller-accessories',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-charge-controller-accessories/card'
WHERE title = 'Charge Controller Accessories';

UPDATE storefront_categories SET
  cf_image_id = 'cat-charge-controllers',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-charge-controllers/card'
WHERE title = 'Charge Controllers';

UPDATE storefront_categories SET
  cf_image_id = 'cat-combiners',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-combiners/card'
WHERE title = 'Combiners';

UPDATE storefront_categories SET
  cf_image_id = 'cat-commercial-inverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-commercial-inverters/card'
WHERE title = 'Commercial Inverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-dc-appliances',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-dc-appliances/card'
WHERE title = 'DC Appliances';

UPDATE storefront_categories SET
  cf_image_id = 'cat-dc-power-supplies',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-dc-power-supplies/card'
WHERE title = 'DC Power Supplies';

UPDATE storefront_categories SET
  cf_image_id = 'cat-electrical-boxes',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-electrical-boxes/card'
WHERE title = 'Electrical Boxes';

UPDATE storefront_categories SET
  cf_image_id = 'cat-energy-storage-systems',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-energy-storage-systems/card'
WHERE title = 'Energy Storage Systems';

UPDATE storefront_categories SET
  cf_image_id = 'cat-flashing-and-hardware',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-flashing-and-hardware/card'
WHERE title = 'Flashing and Hardware';

UPDATE storefront_categories SET
  cf_image_id = 'cat-grid-tie-string-inverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-grid-tie-string-inverters/card'
WHERE title = 'Grid Tie String Inverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-ground-mounted-solar-panels',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-ground-mounted-solar-panels/card'
WHERE title = 'Ground Mounted Solar Panels';

UPDATE storefront_categories SET
  cf_image_id = 'cat-ground-mounts',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-ground-mounts/card'
WHERE title = 'Ground Mounts';

UPDATE storefront_categories SET
  cf_image_id = 'cat-high-voltage-batteries',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-high-voltage-batteries/card'
WHERE title = 'High Voltage Batteries';

UPDATE storefront_categories SET
  cf_image_id = 'cat-hybrid-solar-battery-inverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-hybrid-solar-battery-inverters/card'
WHERE title = 'Hybrid Solar Battery Inverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-inverter-accessories',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-inverter-accessories/card'
WHERE title = 'Inverter Accessories';

UPDATE storefront_categories SET
  cf_image_id = 'cat-inverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-inverters/card'
WHERE title = 'Inverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-large-flat-roof',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-large-flat-roof/card'
WHERE title = 'Large Flat Roof';

UPDATE storefront_categories SET
  cf_image_id = 'cat-lightning-and-surge-protection',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-lightning-and-surge-protection/card'
WHERE title = 'Lightning and Surge Protection';

UPDATE storefront_categories SET
  cf_image_id = 'cat-lithium-batteries',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-lithium-batteries/card'
WHERE title = 'Lithium Batteries';

UPDATE storefront_categories SET
  cf_image_id = 'cat-mppt',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-mppt/card'
WHERE title = 'MPPT';

UPDATE storefront_categories SET
  cf_image_id = 'cat-metal-roof',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-metal-roof/card'
WHERE title = 'Metal Roof';

UPDATE storefront_categories SET
  cf_image_id = 'cat-meters-monitoring-and-shunts',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-meters-monitoring-and-shunts/card'
WHERE title = 'Meters, Monitoring and Shunts';

UPDATE storefront_categories SET
  cf_image_id = 'cat-microinverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-microinverters/card'
WHERE title = 'Microinverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-mounting-kits',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-mounting-kits/card'
WHERE title = 'Mounting Kits';

UPDATE storefront_categories SET
  cf_image_id = 'cat-mounting-and-racking',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-mounting-and-racking/card'
WHERE title = 'Mounting and Racking';

UPDATE storefront_categories SET
  cf_image_id = 'cat-off-grid-inverters',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-off-grid-inverters/card'
WHERE title = 'Off Grid Inverters';

UPDATE storefront_categories SET
  cf_image_id = 'cat-off-grid-solar-panels',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-off-grid-solar-panels/card'
WHERE title = 'Off Grid Solar Panels';

UPDATE storefront_categories SET
  cf_image_id = 'cat-pwm',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-pwm/card'
WHERE title = 'PWM';

UPDATE storefront_categories SET
  cf_image_id = 'cat-pitched-roof-mounts',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-pitched-roof-mounts/card'
WHERE title = 'Pitched Roof Mounts';

UPDATE storefront_categories SET
  cf_image_id = 'cat-portable-power-packs',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-portable-power-packs/card'
WHERE title = 'Portable Power Packs';

UPDATE storefront_categories SET
  cf_image_id = 'cat-portable-solar-panels',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-portable-solar-panels/card'
WHERE title = 'Portable Solar Panels';

UPDATE storefront_categories SET
  cf_image_id = 'cat-rack-mounted-batteries',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-rack-mounted-batteries/card'
WHERE title = 'Rack Mounted Batteries';

UPDATE storefront_categories SET
  cf_image_id = 'cat-rapid-shutdown',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-rapid-shutdown/card'
WHERE title = 'Rapid Shutdown';

UPDATE storefront_categories SET
  cf_image_id = 'cat-replacement-parts',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-replacement-parts/card'
WHERE title = 'Replacement Parts';

UPDATE storefront_categories SET
  cf_image_id = 'cat-rooftop-solar-panels',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-rooftop-solar-panels/card'
WHERE title = 'Rooftop Solar Panels';

UPDATE storefront_categories SET
  cf_image_id = 'cat-swag',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-swag/card'
WHERE title = 'SWAG';

UPDATE storefront_categories SET
  cf_image_id = 'cat-side-of-pole',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-side-of-pole/card'
WHERE title = 'Side of Pole';

UPDATE storefront_categories SET
  cf_image_id = 'cat-snap-fan',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-snap-fan/card'
WHERE title = 'Snap-Fan';

UPDATE storefront_categories SET
  cf_image_id = 'cat-solar-panel-pallet-deals',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-solar-panel-pallet-deals/card'
WHERE title = 'Solar Panel Pallet Deals';

UPDATE storefront_categories SET
  cf_image_id = 'cat-solar-panels',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-solar-panels/card'
WHERE title = 'Solar Panels';

UPDATE storefront_categories SET
  cf_image_id = 'cat-solar-power-systems',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-solar-power-systems/card'
WHERE title = 'Solar Power Systems';

UPDATE storefront_categories SET
  cf_image_id = 'cat-solar-training-and-education',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-solar-training-and-education/card'
WHERE title = 'Solar Training and Education';

UPDATE storefront_categories SET
  cf_image_id = 'cat-stacking-controllers',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-stacking-controllers/card'
WHERE title = 'Stacking Controllers';

UPDATE storefront_categories SET
  cf_image_id = 'cat-top-of-pole',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-top-of-pole/card'
WHERE title = 'Top of Pole';

UPDATE storefront_categories SET
  cf_image_id = 'cat-wind-turbines',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-wind-turbines/card'
WHERE title = 'Wind Turbines';

UPDATE storefront_categories SET
  cf_image_id = 'cat-wire-management',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-wire-management/card'
WHERE title = 'Wire Management';

UPDATE storefront_categories SET
  cf_image_id = 'cat-wire-terminals-splitters-and-splicers',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-wire-terminals-splitters-and-splicers/card'
WHERE title = 'Wire Terminals, Splitters and Splicers';

UPDATE storefront_categories SET
  cf_image_id = 'cat-wire-and-cables',
  cf_category_image_url = 'https://imagedelivery.net/Fdrr4r8cVWsy-JJCR0JU_Q/cat-wire-and-cables/card'
WHERE title = 'Wire and Cables';
