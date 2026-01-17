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

/**
 * Fetch brand list from solampio.com/brands/ page
 */
async function fetchBrandList(): Promise<Brand[]> {
  console.log('Fetching brand list from solampio.com/brands/...');

  try {
    const response = await fetch('https://solampio.com/brands/');
    const html = await response.text();

    // Parse brand links from HTML
    // Pattern: <a href="/brands/[slug]/" ...>Brand Name</a>
    const brandRegex = /<a[^>]*href="\/brands\/([^/"]+)\/"[^>]*>([^<]+)<\/a>/gi;
    const brands: Brand[] = [];
    let match;

    while ((match = brandRegex.exec(html)) !== null) {
      const slug = match[1];
      const name = match[2].trim();

      if (slug && name && !brands.find((b) => b.slug === slug)) {
        brands.push({ name, slug });
      }
    }

    console.log(`Found ${brands.length} brands`);
    return brands;
  } catch (error) {
    console.error('Error fetching brand list:', error);
    return [];
  }
}

/**
 * Fetch logo URL from BigCommerce CDN for a brand
 */
async function fetchBigCommerceLogo(brand: Brand): Promise<string | null> {
  try {
    const response = await fetch(`https://solampio.com/brands/${brand.slug}/`);
    const html = await response.text();

    // Look for BigCommerce CDN image URLs
    // Pattern: https://cdn11.bigcommerce.com/s-yhdp96gt9k/images/stencil/...
    const imgRegex =
      /https:\/\/cdn11\.bigcommerce\.com\/s-yhdp96gt9k\/images\/stencil\/[^"'\s]+/gi;
    const matches = html.match(imgRegex);

    if (matches && matches.length > 0) {
      // Find the highest resolution version (prefer original)
      const originalMatch = matches.find((url) => url.includes('.original.'));
      if (originalMatch) return originalMatch;

      // Otherwise find largest dimension
      let bestUrl = matches[0];
      let bestSize = 0;

      for (const url of matches) {
        const sizeMatch = url.match(/stencil\/(\d+)x(\d+)\//);
        if (sizeMatch) {
          const size = parseInt(sizeMatch[1]) * parseInt(sizeMatch[2]);
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
