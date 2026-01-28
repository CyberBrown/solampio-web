# SolampIO Go-Live Runbook

**Target Domain:** solampio.com
**New Site:** https://solampio-web.pages.dev
**Old Site:** BigCommerce (to be replaced)

---

## Pre-Requisites

- [ ] Soft 404 issue fixed (returns HTTP 404 status)
- [ ] Final data sync from ERPNext to D1
- [ ] Stripe keys configured for production
- [ ] EasyPost production API key set
- [ ] DNS access to Cloudflare

---

## Pre-Cutover (1 hour before)

### 1. Final Data Sync
```bash
# Trigger full sync from ERPNext
curl -X POST "https://solampio-web.pages.dev/api/products/sync?full=true" \
  -H "Authorization: Bearer $API_KEY"

# Verify product count
npx wrangler d1 execute solampio-migration --remote \
  --command="SELECT COUNT(*) FROM storefront_products WHERE is_visible = 1"
```

### 2. Verify Critical Pages
```bash
# Test key pages
for page in "" "batteries/" "brands/" "cart/" "checkout/" "contact-us/"; do
  curl -sL -o /dev/null -w "%{http_code} " "https://solampio-web.pages.dev/$page"
done
# Expected: 200 200 200 200 200 200
```

### 3. Test Checkout (Stripe Test Mode)
- Add product to cart
- Complete checkout with test card `4242 4242 4242 4242`
- Verify order confirmation page
- Check ERPNext for Sales Order created

### 4. Notify Team
- Slack/email notification: "Go-live starting in 1 hour"
- Ensure someone monitoring for issues

---

## Cutover Steps

### Step 1: Update DNS (5 minutes)

In Cloudflare DNS for solampio.com:

1. **Delete/Pause** existing A/CNAME records pointing to BigCommerce
2. **Add CNAME** record:
   - Name: `@` (or `solampio.com`)
   - Target: `solampio-web.pages.dev`
   - Proxy: ON (orange cloud)
3. **Add CNAME** for www:
   - Name: `www`
   - Target: `solampio-web.pages.dev`
   - Proxy: ON

### Step 2: Configure Custom Domain in Pages

```bash
# Or via Cloudflare Dashboard > Pages > solampio-web > Custom domains
npx wrangler pages project add-custom-domain solampio-web solampio.com
```

### Step 3: Verify SSL
- Visit https://solampio.com
- Check SSL certificate is valid
- Check no mixed content warnings

### Step 4: Verify Functionality
```bash
# Homepage
curl -sL -o /dev/null -w "%{http_code}" "https://solampio.com/"

# Product page
curl -sL -o /dev/null -w "%{http_code}" "https://solampio.com/1-AR30-10-12/"

# Search
curl -sL "https://solampio.com/api/search?q=inverter" | jq '.total'
```

### Step 5: Test Purchase (Production)
- Small test order with real card
- Verify payment processes in Stripe dashboard
- Verify ERPNext Sales Order created

---

## Post-Cutover Monitoring (First 2 hours)

### Monitor for 404s
```bash
# Check Cloudflare Analytics for 404s
# Dashboard > Analytics > Traffic > Status Codes
```

### Monitor for Errors
- Check Cloudflare Workers logs
- Check browser console for JS errors
- Monitor Stripe dashboard for failed payments

### Spot Checks
- [ ] Homepage loads correctly
- [ ] Category pages show products
- [ ] Brand pages work
- [ ] Product images display
- [ ] Add to cart works
- [ ] Checkout loads Stripe Elements
- [ ] Mobile navigation works
- [ ] Search returns results

---

## Day 1 Tasks

### Submit Sitemap to Google
```bash
# Generate sitemap if not already
# Then submit via Google Search Console
# URL: https://solampio.com/sitemap.xml
```

### Monitor Search Console
- Check for crawl errors
- Verify pages being indexed
- Note any mobile usability issues

### Check BigCommerce Redirects
Test that old BigCommerce URLs redirect properly:
```bash
# Old product URL format
curl -sL -o /dev/null -w "%{http_code} %{redirect_url}" "https://solampio.com/products/category/batteries/"
# Should: 301 redirect to /batteries/
```

---

## Rollback Plan

If critical issues discovered:

### Option 1: Revert DNS (Quick)
1. In Cloudflare DNS, delete the CNAME to pages.dev
2. Re-add the original A/CNAME records for BigCommerce
3. DNS propagation: 5-15 minutes with Cloudflare proxy

### Option 2: Rollback Deployment
```bash
# List deployments
npx wrangler pages deployments list --project-name solampio-web

# Rollback to previous deployment
npx wrangler pages deployments rollback --project-name solampio-web --deployment-id <PREVIOUS_ID>
```

---

## Contacts

- **Technical Issues:** [Your contact]
- **Stripe Issues:** dashboard.stripe.com
- **Cloudflare Issues:** dash.cloudflare.com
- **ERPNext Issues:** [ERPNext admin contact]

---

## Post-Launch (Week 1)

- [ ] Review Cloudflare Analytics for traffic patterns
- [ ] Check Google Search Console for indexing issues
- [ ] Address any customer-reported issues
- [ ] Run SEO batch optimizer on remaining products
- [ ] Hide empty brand pages
- [ ] Keep BigCommerce active for 30 days (order history access)
