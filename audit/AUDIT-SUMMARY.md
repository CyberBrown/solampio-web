# URL Redirect Audit Summary

## Overview

- **Audit Date:** 2026-01-28
- **Old Site:** https://solampio.com (BigCommerce)
- **New Site:** https://solampio-web.pages.dev (Qwik)

## URL Inventory

| Type | BC URLs | New Site URLs | Matched | Need Redirect |
|------|---------|---------------|---------|---------------|
| Products | 253 | 742 | 162 | 91 |
| Categories | 55 | 59 | 53 | 2 |
| Brands | 53 | 50 | 50 | 3 |
| Static Pages | 17 | ~10 | 10 | 7 |

## Critical Issues

### 1. Product URL Structure Mismatch

**Problem:** BigCommerce uses slugified product names as URLs, while the new site uses SKUs.

- BC: `/communication-cable-for-tigo-sol-ark.../`
- New: `/CAT5E600V/`

**Impact:** 253 BC product URLs will 404 without redirects.

**Solution Options:**
1. **Recommended:** Add `bc_url_slug` column to `storefront_products` table and modify route handler to search by it
2. **Alternative:** Generate static redirects for all 253 products (maintenance burden)

### 2. Category URL Structure Change

**Problem:** BC uses hierarchical paths, new site uses flat paths.

- BC: `/batteries/battery-accessories/`
- New: `/battery-accessories/`

**Status:** ✅ RESOLVED - Added redirects for all hierarchical paths in `_redirects`

### 3. Unmatched Products (91 URLs)

Products that couldn't be matched by title similarity:
- Some are discontinued products
- Some have significantly different naming
- Some are SWAG items (hoodies, t-shirts) that may not be on new site

**Top Priority Unmatched:**
- `q-cells-q-peak-duo-black-410w-415w-solar-panel` → needs manual mapping
- `fortress-eboost-16kwh-battery` → SKU: `eBoost 16kWh Battery`
- `midnite-mnpowerflo16-lithium-iron-phosphate-wall-mounted-battery`
- `ja-solar-440w-595w-615w-620w-bifacial-glass-backsheet-monocrystalline-solar-panel`

## Implemented Fixes

### _redirects File
Created comprehensive redirect rules for:
- ✅ 50+ category hierarchical paths → flat paths
- ✅ Static page aliases (about → about-us, etc.)
- ✅ Legacy development site paths
- ⏳ Product redirects (needs bc_url_slug implementation)

## Recommended Next Steps

### Immediate (Before Launch)

1. **Add bc_url_slug support to database:**
   ```sql
   ALTER TABLE storefront_products ADD COLUMN bc_url_slug TEXT;
   CREATE INDEX idx_products_bc_slug ON storefront_products(bc_url_slug);
   ```

2. **Populate bc_url_slug from ERPNext:**
   - Update ERPNext Item doctype with bc_url_slug values
   - Sync to D1 via existing webhook

3. **Modify getProduct() in db.ts:**
   ```typescript
   async getProduct(idOrSku: string): Promise<Product | null> {
     const result = await this.db.prepare(`
       SELECT * FROM storefront_products
       WHERE (id = ? OR sku = ? OR bc_url_slug = ?) AND is_visible = 1
       LIMIT 1
     `).bind(idOrSku, idOrSku, idOrSku).first<Product>();
     return result || null;
   }
   ```

### Post-Launch

1. Monitor 404 errors in Cloudflare Analytics
2. Add redirects for any missed URLs
3. Submit updated sitemap to Google Search Console

## Files Created

- `audit/bc-product-urls.txt` - All 253 BC product URLs
- `audit/bc-category-urls.txt` - All 55 BC category URLs
- `audit/bc-brand-urls.txt` - All 53 BC brand URLs
- `audit/bc-page-urls.txt` - All 17 BC static page URLs
- `audit/products-sku-title.tsv` - D1 products with SKU and title
- `audit/new-category-slugs.txt` - All 59 new site category slugs
- `audit/unmatched-product-urls.txt` - 91 BC URLs that couldn't be matched
- `audit/_redirects` - Redirect rules (copy to public/_redirects)

## Testing Checklist

- [ ] Test category redirects: `/batteries/battery-accessories/` → `/battery-accessories/`
- [ ] Test static page redirects: `/about/` → `/about-us/`
- [ ] Test product URLs after bc_url_slug implementation
- [ ] Verify canonical tags on all product pages
- [ ] Run Screaming Frog crawl to find any missed 404s
