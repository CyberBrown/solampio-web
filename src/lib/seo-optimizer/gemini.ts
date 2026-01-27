import type { FullOptimizationResult } from './types';

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
  weight_lbs: number | null;
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

    // GMC fields
    gmc_google_category: {
      type: "string",
      description: "Google Product Category path, e.g., 'Electronics > Solar Energy > Solar Inverters'",
    },
    gmc_product_type: {
      type: "string",
      description: "Store category breadcrumb, e.g., 'Solar Equipment > Inverters > Hybrid Inverters'",
    },
    gmc_condition: {
      type: "string",
      enum: ["new", "refurbished", "used"],
      description: "Product condition, almost always 'new'",
    },
    gmc_shipping_label: {
      type: "string",
      enum: ["standard", "oversized", "freight", "ltl"],
      description: "Shipping category based on weight/size",
    },
    gmc_custom_labels: {
      type: "object",
      properties: {
        margin_tier: { type: "string", enum: ["high_margin", "medium_margin", "low_margin"] },
        product_type: { type: "string", description: "Simple category: inverter, panel, battery, racking, bos, accessory" },
        brand_tier: { type: "string", enum: ["premium", "mid_tier", "value"] },
        seasonality: { type: "string", enum: ["always_on", "seasonal", "new_launch"] },
        promo_eligible: { type: "string", enum: ["promo_eligible", "map_protected", "clearance"] },
      },
      required: ["margin_tier", "product_type", "brand_tier", "seasonality", "promo_eligible"],
    },
  },
  required: [
    "seo_title", "seo_meta_description", "seo_description_summary",
    "seo_og_title", "seo_og_description", "seo_keywords", "seo_robots",
    "seo_faqs", "seo_related_searches", "seo_use_cases",
    "optimized_description", "competitors",
    "gmc_google_category", "gmc_product_type", "gmc_condition",
    "gmc_shipping_label", "gmc_custom_labels",
  ],
};

export async function optimizeProductSEO(
  product: ProductInput,
  config: GeminiConfig,
): Promise<FullOptimizationResult & { competitors?: Array<{ name: string; url: string; price: string | null; differentiators: string[] }> }> {
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
- Weight: ${product.weight_lbs ? `${product.weight_lbs} lbs` : 'Unknown'}
- Current Description: ${product.description?.substring(0, 3000) || 'None provided'}

## Your Task

1. **Search Google** for this exact product and similar competing products
2. **Identify top search keywords** people use when looking for this type of product
3. **Analyze top 3-5 competitor listings** - capture their pricing, URLs, and key differentiators
4. **Generate FAQs** - real questions buyers ask about this product type

## SEO Content Guidelines

- Target audience: Solar installers, electrical contractors, DIY homeowners
- Emphasize: Technical specs, compatibility, warranty, certifications
- Tone: Professional, knowledgeable, helpful (not salesy)
- Solamp value props: Expert support, fast shipping, competitive pricing
- Do NOT invent specifications - only use what's provided or found via search
- FAQs should be genuinely useful questions (installation, compatibility, sizing, etc.)

## Google Merchant Center Fields

Also generate these GMC-specific fields:

**gmc_google_category**: The most specific Google Product Category path. For solar equipment:
- Solar panels: "Electronics > Solar Energy > Solar Panels"
- Inverters: "Electronics > Solar Energy > Solar Inverters"
- Batteries: "Electronics > Solar Energy > Solar Energy Storage"
- Racking/mounting: "Hardware > Building Materials > Roofing & Siding > Solar Panel Mounting Equipment"
- Charge controllers: "Electronics > Solar Energy > Solar Charge Controllers"
- Cables/connectors: "Electronics > Electronics Accessories > Cable Management"
- Monitoring: "Electronics > Solar Energy > Solar Energy System Monitoring"

**gmc_product_type**: Full store category breadcrumb. Format: "Solar Equipment > [Category] > [Subcategory]"
Examples: "Solar Equipment > Inverters > Hybrid Inverters", "Solar Equipment > Panels > Monocrystalline"

**gmc_condition**: Almost always "new" for Solamp products

**gmc_shipping_label**: Based on product weight/dimensions:
- "standard": Under 30 lbs, ships via UPS/FedEx Ground
- "oversized": 30-70 lbs, ships ground with handling fee
- "freight": 70-150 lbs, needs freight carrier
- "ltl": Over 150 lbs or palletized (batteries, large inverters, panel pallets)

**gmc_custom_labels**: For campaign management
- margin_tier: Estimate based on product type
  - "high_margin": Accessories, BOS components, monitoring
  - "medium_margin": Inverters, charge controllers, racking
  - "low_margin": Solar panels, batteries (commodity pricing)
- product_type: Simple single-word category (inverter, panel, battery, racking, bos, accessory, monitoring, cable)
- brand_tier: Based on brand reputation
  - "premium": Sol-Ark, Enphase, SMA, Fronius, Tesla, LG, Panasonic
  - "mid_tier": Canadian Solar, Hanwha Q Cells, SolarEdge, Generac, Schneider
  - "value": Generic brands, lesser-known manufacturers
- seasonality: "always_on" for most solar (seasonal construction slowdown is minimal)
- promo_eligible:
  - "map_protected" if major brand with MAP policy (Sol-Ark, Enphase, etc.)
  - "promo_eligible" if can discount freely
  - "clearance" if being discontinued

## Output Format

Return a JSON object with all SEO fields (seo_title, seo_meta_description, etc.) plus all GMC fields.`;
}

export { buildPrompt, SEO_RESULT_SCHEMA };
export type { GeminiConfig, ProductInput };
