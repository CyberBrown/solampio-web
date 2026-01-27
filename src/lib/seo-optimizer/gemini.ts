import type { SEOOptimizationResult } from './types';

interface GeminiConfig {
  apiKey?: string;
  gatewayUrl?: string; // Cloudflare AI Gateway URL
}

interface ProductInput {
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  description: string | null;
  cf_image_id: string | null;
}

const SEO_RESULT_SCHEMA = {
  type: "object",
  properties: {
    seo_title: { type: "string", description: "Max 60 chars. Include primary keyword and brand." },
    seo_meta_description: { type: "string", description: "Max 155 chars. Compelling with CTA." },
    seo_description_summary: { type: "string", description: "2-3 sentences for product hero section." },
    seo_og_title: { type: "string", description: "Max 60 chars for social sharing." },
    seo_og_description: { type: "string", description: "Max 155 chars for social sharing." },
    seo_keywords: { type: "array", items: { type: "string" }, description: "5-10 target keywords" },
    seo_robots: { type: "string", description: "Robots meta directive, usually 'index, follow'" },
    seo_faqs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
      description: "3-5 product-specific FAQs",
    },
    seo_related_searches: { type: "array", items: { type: "string" }, description: "Related search queries" },
    seo_use_cases: { type: "array", items: { type: "string" }, description: "Product use cases" },
    optimized_description: { type: "string", description: "Full SEO-optimized product description with HTML structure" },
    competitors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: "string" },
          price: { type: "string", nullable: true },
          differentiators: { type: "array", items: { type: "string" } },
        },
        required: ["name", "url", "differentiators"],
      },
    },
  },
  required: [
    "seo_title", "seo_meta_description", "seo_description_summary",
    "seo_og_title", "seo_og_description", "seo_keywords", "seo_robots",
    "seo_faqs", "seo_related_searches", "seo_use_cases",
    "optimized_description", "competitors",
  ],
};

export async function optimizeProductSEO(
  product: ProductInput,
  config: GeminiConfig,
): Promise<SEOOptimizationResult & { competitors?: Array<{ name: string; url: string; price: string | null; differentiators: string[] }> }> {
  const baseUrl = config.gatewayUrl || 'https://generativelanguage.googleapis.com/v1beta';
  const url = `${baseUrl}/models/gemini-3-flash-preview:generateContent`;

  const prompt = buildPrompt(product);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey?.startsWith('AIza')
        ? { 'x-goog-api-key': config.apiKey }
        : { 'Authorization': `Bearer ${config.apiKey}` }),
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        thinkingConfig: { thinkingLevel: "high" },
        temperature: 1.0,
        responseMimeType: "application/json",
        responseSchema: SEO_RESULT_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  // Find the text part (skip thinking parts)
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((p) => p.text !== undefined);
  const text = textPart?.text;

  if (!text) {
    throw new Error('No response text from Gemini');
  }

  return JSON.parse(text);
}

function buildPrompt(product: ProductInput): string {
  return `You are an SEO specialist for Solamp Inc., a solar equipment distributor based in Massachusetts serving installers, contractors, and homeowners.

## Product Information
- SKU: ${product.sku}
- Current Title: ${product.name}
- Brand: ${product.brand || 'Unknown'}
- Category: ${product.category || 'Uncategorized'}
- Price: ${product.price ? `$${product.price}` : 'Not set'}
- Current Description: ${product.description?.substring(0, 3000) || 'None provided'}

## Your Task

1. **Search Google** for this exact product and similar competing products
2. **Identify top search keywords** people use when looking for this type of product
3. **Analyze top 3-5 competitor listings** - capture their pricing, URLs, and key differentiators
4. **Generate FAQs** - real questions buyers ask about this product type

## Content Guidelines

- Target audience: Solar installers, electrical contractors, DIY homeowners
- Emphasize: Technical specs, compatibility, warranty, certifications
- Tone: Professional, knowledgeable, helpful (not salesy)
- Solamp value props: Expert support, fast shipping, competitive pricing
- Do NOT invent specifications - only use what's provided or found via search
- FAQs should be genuinely useful questions (installation, compatibility, sizing, etc.)

## Output Requirements

Generate JSON with:
- seo_title: Max 60 chars. Format: "[Product] - [Key Benefit] | Solamp"
- seo_meta_description: Max 155 chars. Include primary keyword and CTA.
- seo_description_summary: 2-3 sentences for product page hero area.
- seo_og_title: Max 60 chars, optimized for social clicks.
- seo_og_description: Max 155 chars, engaging for social sharing.
- seo_keywords: Array of 5-10 target keywords/phrases.
- seo_robots: Usually "index, follow"
- seo_faqs: Array of 3-5 {question, answer} objects. Real buyer questions.
- seo_related_searches: Array of related search queries people also search.
- seo_use_cases: Array of specific use cases (e.g., "residential backup", "off-grid cabin").
- optimized_description: Full HTML description with <h2>/<h3> structure. 300-600 words. Cover: overview, key features, specifications (if found), applications, why buy from Solamp.
- competitors: Array of {name, url, price, differentiators} from search results.`;
}

export { buildPrompt, SEO_RESULT_SCHEMA };
export type { GeminiConfig, ProductInput };
