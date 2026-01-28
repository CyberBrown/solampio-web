import * as fs from 'fs';

const CHECKPOINT_FILE = './seo-batch-checkpoint.json';

try {
  if (!fs.existsSync(CHECKPOINT_FILE)) {
    console.log('No batch in progress (no checkpoint file)');
    process.exit(0);
  }

  const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));

  console.log('SEO Batch Status');
  console.log('================');
  console.log(`Started: ${checkpoint.startedAt}`);
  console.log(`Processed: ${checkpoint.processedCount}`);
  console.log(`Errors: ${checkpoint.errorCount}`);
  console.log(`Last SKU: ${checkpoint.lastProcessedSku}`);

  if (checkpoint.errors?.length > 0) {
    console.log('\nRecent errors:');
    checkpoint.errors.slice(-5).forEach((e: any) => {
      console.log(`  - ${e.sku}: ${e.error}`);
    });
  }
} catch (e) {
  console.error('Error reading checkpoint:', e);
}
