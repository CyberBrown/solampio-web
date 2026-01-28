# Solampio Web - Claude Code Notes

## ERPNext API Access

**IMPORTANT**: When API access to ERPNext is needed, use the **solampio-migration worker** (`https://solampio-migration.solamp.workers.dev/api/erpnext/...`) instead of trying to access ERPNext directly. The migration worker has the necessary API credentials configured.

Key endpoints:
- `POST /api/erpnext/sync-seo` - Sync SEO data from D1 to ERPNext
- `POST /api/erpnext/setup-seo-fields` - Create SEO custom fields in ERPNext
- `GET /api/erpnext/items` - Fetch items from ERPNext
- `POST /api/erpnext/items` - Create/update items

## Database

- **Production DB**: `solampio-migration` (D1)
- **Table**: `storefront_products`
- The `solampio-storefront` database exists but is unused

## Deployments

- Website: `bunx wrangler pages deploy dist`
- Migration Worker: `cd /home/chris/projects/solampio-migration && bunx wrangler deploy`
