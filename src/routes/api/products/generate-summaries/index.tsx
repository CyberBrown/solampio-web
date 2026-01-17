/**
 * AI Summary Generation API Endpoint
 *
 * Generates AI-powered summaries for product descriptions using Workers AI.
 * Can process individual products or batch process multiple products.
 *
 * POST /api/products/generate-summaries/
 *
 * Body:
 * {
 *   sku?: string,       // Process single product by SKU
 *   limit?: number,     // Batch process N products (default: 10, max: 50)
 *   force?: boolean     // Regenerate even if summary exists (default: false)
 * }
 */

import type { RequestHandler } from '@builder.io/qwik-city';
import type { D1Database } from '@cloudflare/workers-types';
import { stripHtml, generateSummaryPrompt } from '../../../../lib/description-cleaner';

interface Product {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  description_summary: string | null;
}

interface RequestBody {
  sku?: string;
  limit?: number;
  force?: boolean;
}

interface Ai {
  run(model: string, options: { prompt: string; max_tokens?: number }): Promise<{ response: string }>;
}

/**
 * Generate summary using Workers AI
 */
async function generateSummary(
  ai: Ai,
  productTitle: string,
  description: string
): Promise<string> {
  const prompt = generateSummaryPrompt(productTitle, description);

  try {
    const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 200,
    });

    // Clean up the response
    let summary = response.response || '';

    // Remove any leading/trailing quotes or whitespace
    summary = summary.trim().replace(/^["']|["']$/g, '');

    // Ensure it's not too long
    if (summary.length > 500) {
      const lastSentence = summary.lastIndexOf('. ', 490);
      if (lastSentence > 300) {
        summary = summary.substring(0, lastSentence + 1);
      } else {
        summary = summary.substring(0, 497) + '...';
      }
    }

    return summary;
  } catch (error) {
    console.error('AI summary generation error:', error);
    // Fall back to excerpt
    return stripHtml(description).substring(0, 500);
  }
}

export const onPost: RequestHandler = async ({ request, platform, json }) => {
  try {
    const db = platform.env?.DB as D1Database | undefined;
    const ai = platform.env?.AI as Ai | undefined;

    if (!db) {
      json(500, { error: 'Database not configured' });
      return;
    }

    if (!ai) {
      json(500, { error: 'Workers AI not configured. Add AI binding to wrangler.toml' });
      return;
    }

    const body = await request.json() as RequestBody;
    const { sku, limit = 10, force = false } = body;

    // Validate limit
    const safeLimit = Math.min(Math.max(1, limit), 50);

    let products: Product[];

    if (sku) {
      // Process single product
      const product = await db
        .prepare(`
          SELECT id, sku, title, description, description_summary
          FROM storefront_products
          WHERE sku = ?
        `)
        .bind(sku)
        .first<Product>();

      if (!product) {
        json(404, { error: `Product not found: ${sku}` });
        return;
      }

      if (!product.description) {
        json(400, { error: `Product has no description: ${sku}` });
        return;
      }

      products = [product];
    } else {
      // Batch process products
      const query = force
        ? `SELECT id, sku, title, description, description_summary
           FROM storefront_products
           WHERE description IS NOT NULL
           ORDER BY updated_at DESC
           LIMIT ?`
        : `SELECT id, sku, title, description, description_summary
           FROM storefront_products
           WHERE description IS NOT NULL
             AND (description_summary IS NULL OR description_summary = '')
           ORDER BY updated_at DESC
           LIMIT ?`;

      const result = await db.prepare(query).bind(safeLimit).all<Product>();
      products = result.results || [];
    }

    if (products.length === 0) {
      json(200, {
        success: true,
        message: 'No products need summary generation',
        processed: 0,
      });
      return;
    }

    // Process each product
    const results: Array<{ sku: string; success: boolean; summary?: string; error?: string }> = [];

    for (const product of products) {
      try {
        if (!product.description) {
          results.push({ sku: product.sku, success: false, error: 'No description' });
          continue;
        }

        // Skip if already has summary and not forcing
        if (!force && product.description_summary) {
          results.push({ sku: product.sku, success: true, summary: product.description_summary });
          continue;
        }

        // Generate AI summary
        const summary = await generateSummary(ai, product.title, product.description);

        // Update database
        await db
          .prepare(`
            UPDATE storefront_products
            SET description_summary = ?, updated_at = ?
            WHERE id = ?
          `)
          .bind(summary, new Date().toISOString(), product.id)
          .run();

        results.push({ sku: product.sku, success: true, summary });
      } catch (error) {
        results.push({
          sku: product.sku,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    json(200, {
      success: true,
      processed: products.length,
      succeeded: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    json(500, {
      error: 'Failed to generate summaries',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Health check / documentation endpoint
export const onGet: RequestHandler = async ({ json }) => {
  json(200, {
    status: 'ok',
    endpoint: 'products/generate-summaries',
    method: 'POST',
    description: 'Generate AI-powered summaries for product descriptions using Workers AI',
    bodyOptions: {
      sku: 'Process single product by SKU (optional)',
      limit: 'Batch process N products (default: 10, max: 50)',
      force: 'Regenerate even if summary exists (default: false)',
    },
    examples: [
      {
        description: 'Generate summary for single product',
        body: { sku: 'PROD-001' },
      },
      {
        description: 'Batch process 20 products without summaries',
        body: { limit: 20 },
      },
      {
        description: 'Force regenerate all summaries',
        body: { limit: 50, force: true },
      },
    ],
    notes: [
      'Uses Cloudflare Workers AI (Llama 3.1 8B) for summary generation',
      'Requires AI binding in wrangler.toml',
      'Summaries are ~500 characters max',
      'Falls back to text excerpt if AI fails',
    ],
  });
};
