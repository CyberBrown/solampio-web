/**
 * Brand Logo Processing Script
 *
 * Uses sharp to process downloaded logos into:
 * - Full color: 400x200px max (maintain aspect ratio, transparent background)
 * - Thumbnail: 100x50px max
 * - Greyscale: 400x200px max (desaturated version for brand scroll)
 *
 * All outputs are PNG with transparency preserved.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const OUTPUT_DIR = path.join(__dirname, 'processed');

interface ProcessingResult {
  brand: string;
  input: string;
  fullPath: string | null;
  thumbPath: string | null;
  greyPath: string | null;
  error?: string;
}

const FULL_SIZE = { width: 400, height: 200 };
const THUMB_SIZE = { width: 100, height: 50 };

/**
 * Process a single logo file
 */
async function processLogo(inputPath: string): Promise<ProcessingResult> {
  const filename = path.basename(inputPath, path.extname(inputPath));
  const result: ProcessingResult = {
    brand: filename,
    input: inputPath,
    fullPath: null,
    thumbPath: null,
    greyPath: null,
  };

  try {
    // Read the input image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Ensure we have valid dimensions
    if (!metadata.width || !metadata.height) {
      result.error = 'Could not read image dimensions';
      return result;
    }

    // For SVG, convert to PNG first at high resolution
    let baseImage = image;
    if (metadata.format === 'svg') {
      baseImage = sharp(inputPath, { density: 300 });
    }

    // 1. Full color version (400x200 max)
    const fullPath = path.join(OUTPUT_DIR, 'full', `${filename}.png`);
    await baseImage
      .clone()
      .resize(FULL_SIZE.width, FULL_SIZE.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ quality: 100 })
      .toFile(fullPath);
    result.fullPath = fullPath;

    // 2. Thumbnail version (100x50 max)
    const thumbPath = path.join(OUTPUT_DIR, 'thumb', `${filename}.png`);
    await baseImage
      .clone()
      .resize(THUMB_SIZE.width, THUMB_SIZE.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ quality: 90 })
      .toFile(thumbPath);
    result.thumbPath = thumbPath;

    // 3. Greyscale version (400x200 max)
    const greyPath = path.join(OUTPUT_DIR, 'grey', `${filename}.png`);
    await baseImage
      .clone()
      .resize(FULL_SIZE.width, FULL_SIZE.height, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .greyscale()
      .png({ quality: 100 })
      .toFile(greyPath);
    result.greyPath = greyPath;

    console.log(`Processed: ${filename}`);
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.error(`Error processing ${filename}:`, result.error);
  }

  return result;
}

/**
 * Main execution
 */
async function main() {
  // Ensure output directories exist
  const dirs = [
    OUTPUT_DIR,
    path.join(OUTPUT_DIR, 'full'),
    path.join(OUTPUT_DIR, 'thumb'),
    path.join(OUTPUT_DIR, 'grey'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Check if downloads directory exists
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    console.error(
      'Downloads directory not found. Run source-logos.ts first.'
    );
    process.exit(1);
  }

  // Get all files in downloads directory
  const files = fs.readdirSync(DOWNLOADS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.error('No image files found in downloads directory.');
    process.exit(1);
  }

  console.log(`Processing ${files.length} logos...\n`);

  const results: ProcessingResult[] = [];

  for (const file of files) {
    const inputPath = path.join(DOWNLOADS_DIR, file);
    const result = await processLogo(inputPath);
    results.push(result);
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'process-results.json'),
    JSON.stringify(results, null, 2)
  );

  // Summary
  const successful = results.filter((r) => r.fullPath && r.thumbPath && r.greyPath).length;
  const failed = results.filter((r) => r.error).length;

  console.log('\n--- Summary ---');
  console.log(`Total processed: ${files.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nOutput directories:`);
  console.log(`  Full: ${path.join(OUTPUT_DIR, 'full')}`);
  console.log(`  Thumb: ${path.join(OUTPUT_DIR, 'thumb')}`);
  console.log(`  Grey: ${path.join(OUTPUT_DIR, 'grey')}`);
}

main().catch(console.error);
