/**
 * Quick script to update local D1 with brand logo URLs
 * Uses BigCommerce CDN URLs directly (bypasses CF Images for now)
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Brands with valid logo URLs (manually verified from source-results.json)
const VALID_BRAND_LOGOS: { slug: string; logoUrl: string }[] = [
  { slug: 'burndy', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/p/burndy-logo_1722379705__81779.original.jpg' },
  { slug: 'bussmann', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/c/bussmann_2_1722379753__70921.original.jpg' },
  { slug: 'chem-link', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/a/chemlink-logoupdated-soprema_1738799740__10335.original.png' },
  { slug: 'delta', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/c/delta_1722379763__52840.original.png' },
  { slug: 'enersys', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/f/enersys-vector-logo_1735856277__99182.original.png' },
  { slug: 'kilovault', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/d/kilovault-logo_1725145419__80645.original.jpg' },
  { slug: 'midnite-solar', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/g/midnite_1722379804__74835.original.png' },
  { slug: 'morningstar', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/q/timeline-1993-morningstar-logo_1722379820__27471.original.png' },
  { slug: 'pytes', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/l/pytes_1725145432__74424.original.png' },
  { slug: 'qcells', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/a/qcells_logo_2022_1722379864__11631.original.png' },
  { slug: 'relyez', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/m/relyez_logo_cmyk_1738800030__94708.original.png' },
  { slug: 's-energy', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/x/senergy_1722379915__95862.original.jpeg' },
  { slug: 'samlex', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/m/samlex_1722379926__55221.original.png' },
  { slug: 'skystream', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/u/skystream-logo_1762299344__13360.original.jpg' },
  { slug: 'sma', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/a/logo_sma.svg_1729287132__21049.original.png' },
  { slug: 'soladeck', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/z/soladeck_redblack_gradient_1722379973__60123.original.png' },
  { slug: 'srne', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/p/srne_1725145481__54006.original.png' },
  { slug: 'tigo', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/r/tigo_1722379991__61011.original.gif' },
  { slug: 'topband', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/b/topbands-logo_1722379996__88625.original.png' },
  { slug: 'victron-energy', logoUrl: 'https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/80w/m/victron-energy-logo_1722380008__96316.original.png' },
];

async function main() {
  console.log('Updating brands with logo URLs...\n');

  for (const brand of VALID_BRAND_LOGOS) {
    // Escape single quotes in URL
    const escapedUrl = brand.logoUrl.replace(/'/g, "''");
    const sql = "UPDATE storefront_brands SET logo_url = '" + escapedUrl + "', is_featured = 1 WHERE slug = '" + brand.slug + "';";

    try {
      await execAsync('npx wrangler d1 execute solampio-migration --local --command "' + sql + '"');
      console.log('Updated: ' + brand.slug);
    } catch (error) {
      console.error('Failed: ' + brand.slug, error);
    }
  }

  console.log('\n--- Summary ---');
  console.log('Updated ' + VALID_BRAND_LOGOS.length + ' brands with logos and marked as featured');
}

main().catch(console.error);
