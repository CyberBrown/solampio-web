/**
 * Batch Brand Logo Download Script
 *
 * Downloads 17 brand logos from provided source URLs (Kagi proxy).
 * Handles different formats (PNG, JPG, SVG, WebP).
 *
 * Usage: bun run tsx download-batch-logos.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

interface BrandLogo {
  slug: string;
  name: string;
  url: string;
}

const BRAND_LOGOS: BrandLogo[] = [
  {
    slug: 'apsmart',
    name: 'APsmart',
    url: 'https://kagi.com/proxy/659-6590004_apsmart-logo-01-rgb-graphic-design-hd-png.png?c=MZPqN0SpT9aUVN-seB3DH_ncWg6Mp3mmyifoK75UVZSUe3IYILBDr1b7GIVZb84PJSLANpHkoP8Yz4EcCdXiU_9Ym66Pt4CP8WgtW894pDEiddg3MmSNPXb_mxHvro4ITynHl-ZEB4GSt90VULtZyQ%3D%3D',
  },
  {
    slug: 'byd',
    name: 'BYD',
    url: 'https://kagi.com/proxy/logo-en.jpg?c=nDEXpKm3r1KS2MYNRiXxilR-zbuv3baxdCelkYMZ0crlkTKJBpN_nZOH5TlMoNHekne4dU8k99Hw4knqYsh_s9CASswuJMt1LlKfP3NQXLs%3D',
  },
  {
    slug: 'blue-sea-systems',
    name: 'Blue Sea Systems',
    url: 'https://kagi.com/proxy/blue-sea-systems-vector-logo.png?c=hOcef02EFNMSgRblP6uYD8rN9e7y1vgLhsoXalFYUwiTpBN-AgLGka_BYJPPEG_uxU28GPucpQiYXQxhaDRgtMlcKXdyt2BAcB8WzUtfczLdznF0AydBd2pn41UEvkk6',
  },
  {
    slug: 'deye',
    name: 'Deye',
    url: 'https://kagi.com/proxy/deye.png?c=jrqiYqMAUsEWNOWqs5hzl3KdbcryIM4I0zgovdWualGCx4mQzUc9c4jWTBLaDwlFK2Q_8kgfMyTGYKIfx0KzQ3eRDlptuePGxH2R6lNyXK4%3D',
  },
  {
    slug: 'ez-solar',
    name: 'EZ Solar',
    url: 'https://kagi.com/proxy/EZ-Solar-logo_Color-Horizontal.png?c=HtfFJ_bMCRTN9yWiRaUCXzRXAWr8eo_V9f9sdAjx-wLnWQkMtg8oPbod5IodzU-9MSlck4-X5gTFcJiFkfq-rzDfluE1IIAPrt5JwiTO0vORyKvRnsiXeAjlwxT3aX8roFgxYyuBRWqy20QnDZs2j1LlgldtMeYg_IIicG6JwmrYlVyG4EJNjMR_K0i13AsfnQb6MPPU8cKit0NszcsBWQ%3D%3D',
  },
  {
    slug: 'enphase',
    name: 'Enphase',
    url: 'https://kagi.com/proxy/1280px-Enphase_logo.svg.png?c=9cn5Kxse4yD05EJkf6QML9dK4clUbdQ9Oq4d5gDoyHBwiX43u0CCAEVi8DMCHFAXSNbNuzTUidR4not4PSLqk08BGmxQQrnWE9c3hbd_SeBDOlduSlrFqeSeJeAYdCtaZE7WOrDZKRKhzSJ7qzQG8RwoG5QsgsSrgmXRvWGQyKM%3D',
  },
  // NOTE: grandio-greenhouses URL appears to be a product image, not a logo.
  // Skipping until correct logo is provided.
  // {
  //   slug: 'grandio-greenhouses',
  //   name: 'Grandio Greenhouses',
  //   url: '...',
  // },
  {
    slug: 'grundfos',
    name: 'Grundfos',
    url: 'https://kagi.com/proxy/Grundfos-Logo.png?c=qTJM3fLie29AlFergDUDAkr8N8I-GprXz3LPm4YkmpG-ZkY8nwKRqB33KaDtBvbnSfLJPv8zQT01xf-vdzG6cCyQPmaCUgN_36IVzakjELg%3D',
  },
  {
    slug: 'magnum-energy',
    name: 'Magnum Energy',
    url: 'https://kagi.com/proxy/magnum-energy-logo-min.jpg?c=JKG0oAwWb-s9_csWosYsfgbyV0IbbrG2emSTdb4ZX2E1mp0Nj_bSdlLi-fO_T6MUSTJjnZRkn-XcQSt88dhS5-pEvgHrx-rEqpgEhB_ERMqBzIgskirmjY8A_HdVWo7E',
  },
  {
    slug: 'polar-wire',
    name: 'Polar Wire',
    url: 'https://kagi.com/proxy/polar-wire-logo.jpg?c=eL3lLoKdYr97r6pvBUoofVDSL-Bw9Gg_KmLXZmzM9KsASqhno2B4RSzCVWu2ZQVp2nnV-2KJEC1JcssP8xTEhQgxvMF-Ck5_1PRLapBZZH0tGbN6FwonZWu_MlnS9AJwCmbvB97tZT3PdRMB2rDQJQ%3D%3D',
  },
  {
    slug: 'roof-tech',
    name: 'Roof Tech',
    url: 'https://kagi.com/proxy/image-asset.jpeg?c=HtfFJ_bMCRTN9yWiRaUCXzRXAWr8eo_V9f9sdAjx-wLnWQkMtg8oPbod5IodzU-9MSlck4-X5gTFcJiFkfq-r1YXDSNN9fkWWq7oDItx1_0c1wfGIfCwnCI8OuaqNQ0SSXORbCAxSV51BDhppBABQamryf2upuTTjQv25r0KVSA6OlSP_mnXfGZoK4ecH13Ls',
  },
  {
    slug: 'silfab',
    name: 'Silfab',
    url: 'https://kagi.com/proxy/Silfab_Solar_%C2%AE_Logo_Full_Color_Pantone_165C.svg?c=XJeq-k43kkxUaCZIMaHOJJAwYy7vqFtt8mp5bDM-69-eo4qJExQThDJNXm86UtR3s7qn-uY2Sy5cstJZaAbgnP4uVHjjoCl4rRFR7lxgu9ZI7_tMIBqA8GRIETzsZPMrnOS7sIzUflh6H_mHOVDrAjwwZLPU6jy14MTX4lTRCMM%3D',
  },
  {
    slug: 'simpliphi',
    name: 'SimpliPhi',
    url: 'https://kagi.com/proxy/Simpliphi-Power.png?c=aQpSIsKjtXVPkIvJPfIGXuQZ5piclpk9uZfflMJvRugwNtUcOIGZCd5dv_qLCFOEnbx0IJn6bpXkvtPN05Ya0ijxVRX1c8u0H64rJaVTqDxhRUnlPiu00X0lf50HIKRqt0gMBzHOQDMINrTKJ4iTfWYUqqGn6DVCdLN4oKXH2hY%3D',
  },
  {
    slug: 'solaredge',
    name: 'SolarEdge',
    url: 'https://kagi.com/proxy/SEDG-aa5a674d.png?c=OEajjQPhm-FUg53do58pV6DaDx1-ZRCGvh1dSjSr5r-Kh1Xf_YGvppDyYXDgoIaiACEKmdDvePS8Fv4_hxFEyHdgGsUtoHo9AILU9CI_a9c%3D',
  },
  {
    slug: 'squared',
    name: 'Square D',
    url: 'https://kagi.com/proxy/square-d-logo.png?c=_50dW4qUWp0GaIF8tG7KiKn_Jcb-32ZTqiAD80zkMNAy9zSumqsZNtBNBKV1y-sEqKQETXzMWo81ZjDbUPKAOzB4TalwUX31n5fit0cKHTIVpg80XtADJq4OCObOE4mN',
  },
  {
    slug: 'trina-solar',
    name: 'Trina Solar',
    url: 'https://kagi.com/proxy/Trina_Solar_logo.svg?c=9cn5Kxse4yD05EJkf6QML9dK4clUbdQ9Oq4d5gDoyHCxXU06yt7Pz0NbAlRuHHkSxjI0Q7QlvR-sB47wOIBoFLSI-Qp0SfXv_FB61w14jdimdDebQNKdy9ugV-PyTjOJ',
  },
  {
    slug: 'xantrex',
    name: 'Xantrex',
    url: 'https://kagi.com/proxy/xantrex-1.svg?c=JI1-sSJsaZOF_Dr5pc_WLbdWEj2Zmf9m0RpLUoksuk5ubsztG5HbNrsFh_In3M3GjUIXBTmDtQoEtiu659uwtw%3D%3D',
  },
];

interface DownloadResult {
  slug: string;
  name: string;
  sourceUrl: string;
  localPath: string | null;
  format: string | null;
  sizeBytes: number | null;
  error?: string;
}

/**
 * Determine file extension from content-type header or URL
 */
function getExtension(url: string, contentType: string): string {
  if (contentType.includes('svg')) return '.svg';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('png')) return '.png';

  // Fallback: check the proxied filename in the URL
  const proxyMatch = url.match(/\/proxy\/([^?]+)/);
  if (proxyMatch) {
    const filename = decodeURIComponent(proxyMatch[1]);
    const ext = path.extname(filename).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext)) {
      return ext;
    }
  }

  return '.png'; // Default
}

/**
 * Download a single logo
 */
async function downloadLogo(brand: BrandLogo): Promise<DownloadResult> {
  const result: DownloadResult = {
    slug: brand.slug,
    name: brand.name,
    sourceUrl: brand.url,
    localPath: null,
    format: null,
    sizeBytes: null,
  };

  try {
    const response = await fetch(brand.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SolampioBot/1.0)',
      },
    });

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    const contentType = response.headers.get('content-type') || '';
    const extension = getExtension(brand.url, contentType);
    result.format = extension.replace('.', '');

    const buffer = Buffer.from(await response.arrayBuffer());
    result.sizeBytes = buffer.length;

    // Check minimum size (very small files likely aren't real images)
    if (buffer.length < 100) {
      result.error = `File too small (${buffer.length} bytes) - likely not a valid image`;
      return result;
    }

    const localPath = path.join(DOWNLOADS_DIR, `${brand.slug}${extension}`);
    fs.writeFileSync(localPath, buffer);
    result.localPath = localPath;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  // Ensure downloads directory exists
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  console.log(`Downloading ${BRAND_LOGOS.length} brand logos...\n`);
  console.log('NOTE: grandio-greenhouses is skipped (URL appears to be a product image).\n');

  const results: DownloadResult[] = [];

  for (const brand of BRAND_LOGOS) {
    process.stdout.write(`  ${brand.slug}... `);
    const result = await downloadLogo(brand);

    if (result.localPath) {
      const sizeKB = ((result.sizeBytes || 0) / 1024).toFixed(1);
      console.log(`OK (${result.format}, ${sizeKB} KB)`);
    } else {
      console.log(`FAILED: ${result.error}`);
    }

    results.push(result);

    // Small delay between downloads
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'batch-download-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Summary
  const successful = results.filter((r) => r.localPath).length;
  const failed = results.filter((r) => !r.localPath).length;

  console.log('\n--- Summary ---');
  console.log(`Total: ${BRAND_LOGOS.length} (+ 1 skipped: grandio-greenhouses)`);
  console.log(`Downloaded: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed downloads:');
    results
      .filter((r) => !r.localPath)
      .forEach((r) => console.log(`  - ${r.slug}: ${r.error}`));
  }

  // Check for low quality (< 200px width would be under ~5KB for a logo)
  const lowQuality = results.filter(
    (r) => r.localPath && r.sizeBytes && r.sizeBytes < 5000
  );
  if (lowQuality.length > 0) {
    console.log('\nPotentially low quality (< 5KB):');
    lowQuality.forEach((r) =>
      console.log(`  - ${r.slug}: ${((r.sizeBytes || 0) / 1024).toFixed(1)} KB`)
    );
  }

  console.log(`\nDownloads saved to: ${DOWNLOADS_DIR}`);
  console.log('Next step: bun run tsx process-logos.ts');
}

main().catch(console.error);
