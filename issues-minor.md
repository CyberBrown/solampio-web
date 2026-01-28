# SolampIO Pre-Launch: Minor Issues

**Audit Date:** 2026-01-28
**Status:** Can fix after launch

---

## 1. 53 Brands with No Products [MEDIUM]

### Problem
53 out of 71 brands have zero visible products but are still displayed in brand listings.

### Impact
- Users clicking these brands see "No products found"
- Wasted index space in search engines
- Poor user experience

### Sample Empty Brands
- APSmart
- Bird In Hand
- Blue Sea Systems
- Briggs & Stratton Energy Solutions
- BYD
- Chem Link
- Deye
- ... (53 total)

### Fix Options
1. **Quick fix:** Set `is_visible = 0` for brands with no products
2. **Better:** Query to hide empty brands:
```sql
UPDATE storefront_brands
SET is_visible = 0
WHERE id NOT IN (
  SELECT DISTINCT brand_id
  FROM storefront_products
  WHERE brand_id IS NOT NULL AND is_visible = 1
);
```

3. **Best:** Dynamic filtering in DB queries to only return brands with products (already implemented in `getBrandsWithProducts()`)

---

## 2. Low SEO Coverage (12%) [MEDIUM]

### Current State
- 90/742 products have SEO titles
- 90/742 products have meta descriptions
- 83/742 products have AI-generated summaries

### Impact
- Most product pages use fallback/generic meta tags
- Lower search ranking potential
- Missed opportunity for rich snippets

### Fix
Run the SEO batch optimizer on remaining products:
```bash
npm run seo:batch
```

Or use the API endpoint to optimize products in batches:
```
POST /api/products/optimize-seo
```

---

## 3. Low Shipping Weight Coverage (12%) [MEDIUM]

### Current State
- Only 89/742 products have shipping weight populated
- Shipping calculator needs weight to calculate rates

### Impact
- Shipping calculator will fail/fallback for 88% of products
- Users may need to request quote for shipping

### Fix
1. Bulk update shipping weights in ERPNext
2. Sync to D1 via `/api/products/sync`
3. Consider inheriting weights from parent products for variants

---

## 4. Products Missing Prices (18%) [LOW]

### Current State
- 137/742 visible products have no price
- These show "Call for Pricing"

### Assessment
This may be **intentional** for B2B operations:
- Custom pricing for large orders
- Products requiring configuration
- Obsolete items being phased out

### Action
Verify with business team if intentional. If not, populate prices in ERPNext.

---

## 5. Brand Logos Missing (65%) [LOW]

### Current State
- 25/71 brands have logos
- 46 brands showing placeholder or text fallback

### Impact
- Less polished brand pages
- Brand scroll component shows placeholders

### Fix
1. Source logos from manufacturer websites
2. Upload to Cloudflare Images
3. Update brand records via sync API

---

## Post-Launch Priority Order

1. **Week 1:** Hide empty brands or add products
2. **Week 1:** Run SEO batch on all products
3. **Week 2:** Populate shipping weights for shipping calculator
4. **Week 3:** Add missing brand logos
5. **Ongoing:** Review products without prices
