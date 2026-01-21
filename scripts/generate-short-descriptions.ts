/**
 * Generate short product descriptions using local LLM
 *
 * Usage:
 *   npx tsx scripts/generate-short-descriptions.ts           # Process all products without short_description
 *   npx tsx scripts/generate-short-descriptions.ts --test    # Test with single product
 *   npx tsx scripts/generate-short-descriptions.ts --limit 10 # Process 10 products
 *   npx tsx scripts/generate-short-descriptions.ts --id <product-id> # Process specific product
 */

import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const LLM_BASE_URL = 'https://vllm.shiftaltcreate.com/v1';
const LLM_MODEL = 'gemma-3-4b-it-heretic-uncensored-abliterated-Extreme.i1-Q6_K.gguf';
const DB_PATH = resolve(__dirname, '../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7dd5aa8328aaaad04230d62cf7e3534925f3d8783debd8fa6fee5e49a1ba52af.sqlite');

// Strip HTML tags from description
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Call the local LLM
async function generateShortDescription(title: string, description: string): Promise<string> {
  const plainText = stripHtml(description);

  // Truncate if too long (keep under ~2000 chars to avoid context issues)
  const truncatedText = plainText.length > 2000
    ? plainText.substring(0, 2000) + '...'
    : plainText;

  const prompt = `Write exactly ONE sentence describing this product in 25 words or less. Be direct and factual.

Product: ${title}

Description:
${truncatedText}

Respond with ONLY the single sentence. No numbering, no alternatives, no explanations.`;

  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  let content = data.choices[0]?.message?.content?.trim() || '';

  // Clean up the response
  // Remove quotes if present
  content = content.replace(/^["']|["']$/g, '').trim();

  // If LLM gave multiple options, take just the first line/sentence
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    // Take the first non-empty, non-numbered line
    for (const line of lines) {
      const cleaned = line.replace(/^\d+\.\s*/, '').trim();
      if (cleaned && !cleaned.toLowerCase().startsWith('here')) {
        content = cleaned;
        break;
      }
    }
  }

  // Remove any leading numbering like "1. " or "- "
  content = content.replace(/^[\d\-\*\.]+\s*/, '').trim();

  return content;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;
  const idIndex = args.indexOf('--id');
  const specificId = idIndex !== -1 ? args[idIndex + 1] : null;

  console.log('Opening database:', DB_PATH);
  const db = new Database(DB_PATH);

  // Get products to process
  let query = `
    SELECT id, title, description
    FROM storefront_products
    WHERE is_visible = 1
      AND has_variants = 0
      AND description IS NOT NULL
      AND length(description) > 50
  `;

  if (specificId) {
    query += ` AND id = '${specificId}'`;
  } else if (!isTest) {
    query += ` AND (short_description IS NULL OR short_description = '')`;
  }

  query += ` ORDER BY title ASC`;

  if (isTest) {
    query += ` LIMIT 1`;
  } else if (limit) {
    query += ` LIMIT ${limit}`;
  }

  const products = db.prepare(query).all() as Array<{
    id: string;
    title: string;
    description: string;
  }>;

  console.log(`Found ${products.length} products to process\n`);

  if (products.length === 0) {
    console.log('No products need processing.');
    db.close();
    return;
  }

  // Process each product
  const updateStmt = db.prepare(`
    UPDATE storefront_products
    SET short_description = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    console.log(`Processing: ${product.title}`);
    console.log(`  ID: ${product.id}`);

    try {
      const shortDesc = await generateShortDescription(product.title, product.description);
      const wordCount = shortDesc.split(/\s+/).length;

      console.log(`  Generated (${wordCount} words): ${shortDesc}`);

      if (shortDesc && shortDesc.length > 0) {
        updateStmt.run(shortDesc, product.id);
        console.log(`  ✓ Saved to database\n`);
        successCount++;
      } else {
        console.log(`  ✗ Empty response, skipping\n`);
        errorCount++;
      }

      // Small delay to avoid overwhelming the LLM server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error: ${error instanceof Error ? error.message : error}\n`);
      errorCount++;
    }
  }

  console.log(`\nComplete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  db.close();
}

main().catch(console.error);
