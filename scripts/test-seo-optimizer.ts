import { optimizeProductSEO } from '../src/lib/seo-optimizer/gemini';

const TEST_PRODUCTS = [
  {
    sku: 'SOLARK',
    name: 'Sol-Ark Hybrid Inverter',
    brand: 'Sol-Ark',
    category: 'Inverters',
    price: null as number | null,
    description: 'Sol-Ark Hybrid Inverter',
    cf_image_id: 'sku-SOLARK-2018132f',
    weight_lbs: 85 as number | null,
  },
  {
    sku: 'CWT410WP',
    name: '410w Bifacial Perc Monocrystalline Solar Panel from CW Energy',
    brand: 'CW Energy',
    category: 'Solar Panels',
    price: 157.19,
    description: 'Power Your Future with the CW Energy 410W Bifacial Monocrystalline Solar Panel. At Solamp, we are committed to providing high-quality, reliable solar solutions. This advanced solar panel utilizes bifacial technology and high-efficiency monocrystalline cells to capture sunlight from both sides of the panel. 410 Wp peak power, 21% module efficiency, 1500V DC max system voltage. 25 year product warranty and 30 year performance warranty.',
    cf_image_id: 'sku-CWT410WP-a4e888d4',
    weight_lbs: 48 as number | null,
  },
  {
    sku: 'UNI-GR',
    name: 'Ground (or Roof) Tilt Mounts',
    brand: 'Tamarack Solar Products',
    category: 'Racking & Mounting',
    price: null as number | null,
    description: 'Ground (or Roof) Tilt Mounts',
    cf_image_id: 'sku-UNI-GR-ab0e8e67',
    weight_lbs: 65 as number | null,
  },
];

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable required');
    process.exit(1);
  }

  console.log('Testing SEO+GMC optimizer with', TEST_PRODUCTS.length, 'products\n');

  for (const product of TEST_PRODUCTS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${product.sku} - ${product.name}`);
    console.log('='.repeat(60));

    try {
      const startTime = Date.now();
      const result = await optimizeProductSEO(product, { apiKey });
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\nCompleted in ${duration}s\n`);

      // SEO fields
      console.log('--- SEO Fields ---');
      console.log('SEO Title:', result.seo_title);
      console.log('Meta Description:', result.seo_meta_description);
      console.log('Keywords:', result.seo_keywords?.join(', '));
      console.log('FAQs:', result.seo_faqs?.length || 0, 'questions');
      console.log('Competitors found:', result.competitors?.length || 0);

      if (result.competitors?.length) {
        console.log('\nCompetitor Intel:');
        result.competitors.forEach((c: { name: string; price?: string | null }, i: number) => {
          console.log(`  ${i + 1}. ${c.name}: ${c.price || 'price N/A'}`);
        });
      }

      // GMC fields
      console.log('\n--- GMC Fields ---');
      console.log('Google Category:', result.gmc_google_category);
      console.log('Product Type:', result.gmc_product_type);
      console.log('Condition:', result.gmc_condition);
      console.log('Shipping Label:', result.gmc_shipping_label);
      console.log('Custom Labels:', JSON.stringify(result.gmc_custom_labels, null, 4));

      // Write full result to file for review
      const fs = await import('fs');
      const outputDir = './test-output';
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
      fs.writeFileSync(
        `${outputDir}/${product.sku}-seo.json`,
        JSON.stringify(result, null, 2),
      );
      console.log(`\nFull result saved to: ${outputDir}/${product.sku}-seo.json`);
    } catch (error) {
      console.error(`\nError:`, error);
    }

    // Rate limit: wait 6 seconds between requests
    if (product !== TEST_PRODUCTS[TEST_PRODUCTS.length - 1]) {
      console.log('\nWaiting 6s before next request...');
      await new Promise((r) => setTimeout(r, 6000));
    }
  }

  console.log('\n\nTest complete! Review results in ./test-output/');
}

runTest();
