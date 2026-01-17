# Brand Logo System

This directory contains scripts for managing brand logos in the Solamp storefront.

## Architecture

```
ERPNext (Brand doctype)
    ↓ webhook
solampio-migration worker
    ↓ syncs to
D1 Database (storefront_brands)
    ↓ reads from
solampio-web (Qwik frontend)
```

## Schema Changes Required

### ERPNext Custom Fields (Add via Customize Form on Brand doctype)

| Field Name | Field Type | Label | Description |
|------------|------------|-------|-------------|
| `brand_logo` | Attach Image | Brand Logo | Primary logo image upload |
| `is_featured` | Check | Featured Brand | Show in brand scroll on homepage |
| `cf_logo_full_url` | Data | CF Logo Full URL | Cloudflare Images URL (400x200) |
| `cf_logo_thumb_url` | Data | CF Logo Thumb URL | Cloudflare Images URL (100x50) |
| `cf_logo_greyscale_url` | Data | CF Logo Greyscale URL | Cloudflare Images greyscale URL |
| `logo_source_url` | Data | Logo Source URL | Original source URL for attribution |

### D1 Migration (solampio-migration repo)

```sql
-- Add new columns to storefront_brands
ALTER TABLE storefront_brands ADD COLUMN is_featured INTEGER DEFAULT 0;
ALTER TABLE storefront_brands ADD COLUMN logo_greyscale_cf_id TEXT;
ALTER TABLE storefront_brands ADD COLUMN logo_thumb_cf_id TEXT;
ALTER TABLE storefront_brands ADD COLUMN logo_source_url TEXT;
```

### Sync Logic Update (solampio-migration repo)

Update `src/worker/services/storefront-sync/` to map ERPNext Brand fields:
- `is_featured` → `is_featured`
- `cf_logo_full_url` → extract CF image ID → `logo_cf_image_id`
- `cf_logo_thumb_url` → extract CF image ID → `logo_thumb_cf_id`
- `cf_logo_greyscale_url` → extract CF image ID → `logo_greyscale_cf_id`
- `logo_source_url` → `logo_source_url`

## Scripts

### 1. `source-logos.ts` - Logo Discovery & Download
Searches for logos from:
- https://solampio.com/brands/ (existing BigCommerce CDN)
- https://commons.wikimedia.org/ (fallback for missing logos)

### 2. `process-logos.ts` - Image Processing
Uses sharp to create:
- Full color: 400x200px max (transparent PNG)
- Thumbnail: 100x50px max (transparent PNG)
- Greyscale: 400x200px max (desaturated PNG)

### 3. `upload-to-cf.ts` - Cloudflare Images Upload
Uploads all three variants to Cloudflare Images and outputs URLs.

### 4. `sync-to-erpnext.ts` - Update ERPNext Records
Updates Brand records in ERPNext with CF Images URLs.

## Usage

```bash
# Install dependencies
cd scripts/brand-logos
npm install

# 1. Source logos from existing sites
npx tsx source-logos.ts

# 2. Process downloaded logos
npx tsx process-logos.ts

# 3. Upload to Cloudflare Images
npx tsx upload-to-cf.ts

# 4. Sync URLs back to ERPNext
npx tsx sync-to-erpnext.ts
```

## Environment Variables

Create a `.env` file in this directory:

```env
# Cloudflare Images
CF_ACCOUNT_ID=your_account_id
CF_IMAGES_TOKEN=your_api_token

# ERPNext
ERPNEXT_URL=https://your-site.erpnext.com
ERPNEXT_API_KEY=your_api_key
ERPNEXT_API_SECRET=your_api_secret
```

## Cloudflare Images Variants

Configure these variants in CF Images dashboard:

| Variant Name | Width | Height | Fit |
|--------------|-------|--------|-----|
| `brand-full` | 400 | 200 | contain |
| `brand-thumb` | 100 | 50 | contain |
| `brand-grey` | 400 | 200 | contain |
