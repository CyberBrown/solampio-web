/**
 * Brand Logo Sourcing Script
 *
 * Sources brand logos from:
 * 1. solampio.com/brands/ (BigCommerce CDN)
 * 2. Wikimedia Commons (fallback)
 *
 * Downloads highest quality version and saves to ./downloads/
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const MANUAL_REVIEW_FILE = path.join(__dirname, 'manual-review.json');

interface BrandLogoResult {
  brand: string;
  slug: string;
  sourceUrl: string | null;
  localPath: string | null;
  source: 'bigcommerce' | 'wikimedia' | 'manual';
  quality: 'high' | 'medium' | 'low' | 'not_found';
}

interface Brand {
  name: string;
  slug: string;
  bigCommerceUrl?: string;
}

// Known brands from solampio.com (fallback list)
const KNOWN_BRANDS: Brand[] = [
  { name: 'Briggs & Stratton Energy Solutions', slug: 'briggs-stratton-energy-solutions' },
  { name: 'Burndy', slug: 'burndy' },
  { name: 'Bussmann', slug: 'bussmann' },
  { name: 'Chem Link', slug: 'chem-link' },
  { name: 'CW Energy', slug: 'cw-energy' },
  { name: 'Delta', slug: 'delta' },
  { name: 'Deye', slug: 'deye' },
  { name: 'EBL', slug: 'ebl' },
  { name: 'Enersys', slug: 'enersys' },
  { name: 'EZ Solar', slug: 'ez-solar' },
  { name: 'Fogco', slug: 'fogco' },
  { name: 'Fortress Power', slug: 'fortress-power' },
  { name: 'HomeGrid', slug: 'homegrid' },
  { name: 'Hyperion', slug: 'hyperion' },
  { name: 'Hyundai Energy Solutions', slug: 'hyundai-energy-solutions' },
  { name: 'IMO Automation', slug: 'imo-automation' },
  { name: 'Iota Engineering', slug: 'iota-engineering' },
  { name: 'JA Solar', slug: 'ja-solar' },
  { name: 'KiloVault', slug: 'kilovault' },
  { name: 'Meyer Burger', slug: 'meyer-burger' },
  { name: 'MidNite Power', slug: 'midnite-power-kdhi' },
  { name: 'MidNite Solar', slug: 'midnite-solar' },
  { name: 'Morningstar', slug: 'morningstar' },
  { name: 'Outback Power Systems', slug: 'outback-power-systems' },
  { name: 'Philadelphia Solar', slug: 'philadelphia-solar' },
  { name: 'Powerfield', slug: 'powerfield' },
  { name: 'Pytes', slug: 'pytes' },
  { name: 'Qcells', slug: 'qcells' },
  { name: 'RelyEZ', slug: 'relyez' },
  { name: 'Renon Power', slug: 'renon-power' },
  { name: 'Rich Solar', slug: 'rich-solar' },
  { name: 'Roof Tech', slug: 'roof-tech' },
  { name: 'Ryse Energy', slug: 'ryse-energy' },
  { name: 'S-5!', slug: 's-5' },
  { name: 'S-Energy', slug: 's-energy' },
  { name: 'Samlex', slug: 'samlex' },
  { name: 'Schneider Electric', slug: 'schneider-electric' },
  { name: 'SkyStream', slug: 'skystream' },
  { name: 'SMA', slug: 'sma' },
  { name: 'Snap-Fan', slug: 'snap-fan' },
  { name: 'Sol-ark', slug: 'sol-ark' },
  { name: 'SolaDeck', slug: 'soladeck' },
  { name: 'Solamp', slug: 'solamp' },
  { name: 'Solar Connections International', slug: 'solar-connections-international' },
  { name: 'SRNE', slug: 'srne' },
  { name: 'Stäubli', slug: 'staubli' },
  { name: 'Sun Star Appliances', slug: 'sun-star-appliances' },
  { name: 'Talesun', slug: 'talesun' },
  { name: 'Tamarack Solar Products', slug: 'tamarack-solar-products' },
  { name: 'Tigo', slug: 'tigo' },
  { name: 'Topband', slug: 'topband' },
  { name: 'Victron Energy', slug: 'victron-energy' },
];

/**
 * Fetch brand list from solampio.com/brands/ page
 * Falls back to KNOWN_BRANDS if parsing fails
 */
async function fetchBrandList(): Promise<Brand[]> {
  console.log('Using known brand list from solampio.com...');
  // Use the known brand list directly - more reliable than parsing HTML
  console.log(`Found ${KNOWN_BRANDS.length} brands`);
  return KNOWN_BRANDS;
}

/**
 * Fetch logo URL from BigCommerce CDN for a brand
 */
async function fetchBigCommerceLogo(brand: Brand): Promise<string | null> {
  try {
    // Brand pages are at direct slug, not /brands/slug
    const response = await fetch(`https://solampio.com/${brand.slug}/`);
    const html = await response.text();

    // Look for BigCommerce CDN image URLs
    // Pattern: https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/...
    const imgRegex =
      /https:\/\/cdn11\.bigcommerce\.com\/s-yhdp96gt9k\/images\/stencil\/[^"'\s]+/gi;
    const matches = html.match(imgRegex);

    if (matches && matches.length > 0) {
      // Filter to just brand logo images (in /g/ subfolder or containing brand slug)
      // Brand logos are typically stored in /g/ folder
      const brandLogos = matches.filter(url =>
        url.includes('/g/') ||
        url.toLowerCase().includes(brand.slug.replace(/-/g, '').toLowerCase()) ||
        url.toLowerCase().includes(brand.slug.replace(/-/g, '_').toLowerCase())
      );

      const logosToCheck = brandLogos.length > 0 ? brandLogos : matches;

      // Find the highest resolution version (prefer original)
      const originalMatch = logosToCheck.find((url) => url.includes('.original.'));
      if (originalMatch) return originalMatch;

      // Otherwise find largest dimension
      let bestUrl = logosToCheck[0];
      let bestSize = 0;

      for (const url of logosToCheck) {
        const sizeMatch = url.match(/stencil\/(\d+)x?(\d*)\//);
        if (sizeMatch) {
          const width = parseInt(sizeMatch[1]) || 0;
          const height = parseInt(sizeMatch[2]) || width;
          const size = width * height;
          if (size > bestSize) {
            bestSize = size;
            bestUrl = url;
          }
        }
      }

      return bestUrl;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching BigCommerce logo for ${brand.name}:`, error);
    return null;
  }
}

/**
 * Search Wikimedia Commons for brand logo
 */
async function searchWikimediaLogo(brandName: string): Promise<string | null> {
  try {
    // Search for brand logo on Wikimedia Commons
    const searchQuery = encodeURIComponent(`${brandName} logo`);
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&srnamespace=6&format=json&origin=*`;

    const response = await fetch(searchUrl);
    const data = (await response.json()) as {
      query?: { search?: { title: string }[] };
    };

    if (data.query?.search && data.query.search.length > 0) {
      // Get the first result's file info
      const firstResult = data.query.search[0];
      const title = firstResult.title;

      // Get actual file URL
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const infoResponse = await fetch(infoUrl);
      const infoData = (await infoResponse.json()) as {
        query?: { pages?: Record<string, { imageinfo?: { url: string }[] }> };
      };

      const pages = infoData.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0];
        if (page.imageinfo && page.imageinfo[0]) {
          return page.imageinfo[0].url;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error searching Wikimedia for ${brandName}:`, error);
    return null;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(
  url: string,
  filename: string
): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    let extension = '.png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = '.jpg';
    } else if (contentType.includes('gif')) {
      extension = '.gif';
    } else if (contentType.includes('webp')) {
      extension = '.webp';
    } else if (contentType.includes('svg')) {
      extension = '.svg';
    }

    const buffer = await response.arrayBuffer();
    const localPath = path.join(DOWNLOADS_DIR, `${filename}${extension}`);

    fs.writeFileSync(localPath, Buffer.from(buffer));
    return localPath;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  // Ensure downloads directory exists
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  const brands = await fetchBrandList();
  const results: BrandLogoResult[] = [];
  const manualReview: Brand[] = [];

  console.log('\nProcessing brands...\n');

  for (const brand of brands) {
    console.log(`Processing: ${brand.name}`);

    // Try BigCommerce first
    let sourceUrl = await fetchBigCommerceLogo(brand);
    let source: BrandLogoResult['source'] = 'bigcommerce';
    let quality: BrandLogoResult['quality'] = 'not_found';

    if (sourceUrl) {
      quality = sourceUrl.includes('.original.') ? 'high' : 'medium';
    } else {
      // Fallback to Wikimedia
      console.log(`  No BigCommerce logo, trying Wikimedia...`);
      sourceUrl = await searchWikimediaLogo(brand.name);
      source = 'wikimedia';

      if (sourceUrl) {
        // Wikimedia often has SVGs which are high quality
        quality = sourceUrl.includes('.svg') ? 'high' : 'medium';
      }
    }

    let localPath: string | null = null;

    if (sourceUrl) {
      localPath = await downloadImage(sourceUrl, brand.slug);
      if (localPath) {
        console.log(`  Downloaded: ${path.basename(localPath)}`);
      } else {
        quality = 'not_found';
      }
    }

    if (!localPath) {
      console.log(`  Not found - adding to manual review`);
      manualReview.push(brand);
      source = 'manual';
    }

    results.push({
      brand: brand.name,
      slug: brand.slug,
      sourceUrl,
      localPath,
      source,
      quality,
    });

    // Rate limit to avoid overwhelming servers
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'source-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Save manual review list
  if (manualReview.length > 0) {
    fs.writeFileSync(MANUAL_REVIEW_FILE, JSON.stringify(manualReview, null, 2));
    console.log(
      `\nManual review needed for ${manualReview.length} brands. See manual-review.json`
    );
  }

  // Summary
  const found = results.filter((r) => r.localPath).length;
  const highQuality = results.filter((r) => r.quality === 'high').length;

  console.log('\n--- Summary ---');
  console.log(`Total brands: ${brands.length}`);
  console.log(`Logos found: ${found}`);
  console.log(`High quality: ${highQuality}`);
  console.log(`Manual review needed: ${manualReview.length}`);
  console.log(
    `\nDownloaded logos saved to: ${DOWNLOADS_DIR}`
  );
}

main().catch(console.error);
