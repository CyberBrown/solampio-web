# SolampIO Web - Claude Code Context

## Project Overview

SolampIO is a B2B platform designed for the solar industry. The platform connects solar installers, distributors, manufacturers, and service providers with tools for analytics, workflow automation, and marketplace functionality.

## Technology Stack

- **Framework**: Qwik 1.5 (resumable web framework)
- **Routing**: Qwik City (file-based routing)
- **Styling**: Tailwind CSS + DaisyUI
- **Language**: TypeScript (strict mode)
- **Deployment**: Cloudflare Pages
- **Payment Processing**: Stripe
- **Build Tool**: Vite

## Project Structure

```
solampio-web/
├── src/
│   ├── routes/              # File-based routes (Qwik City)
│   │   ├── index.tsx        # Homepage
│   │   ├── layout.tsx       # Root layout
│   │   ├── products/        # Product catalog routes
│   │   ├── learn/           # Learning center (articles, courses, calculators)
│   │   ├── account/         # User account pages (orders, quotes)
│   │   ├── checkout/        # Checkout flow
│   │   ├── cart/            # Shopping cart
│   │   ├── api/             # API endpoints (sync, import)
│   │   └── ...              # Other routes
│   ├── components/          # Reusable components
│   │   ├── layout/          # Header, Footer
│   │   ├── products/        # Product-specific components
│   │   ├── checkout/        # Checkout components
│   │   └── ...
│   ├── lib/                 # Utility functions and shared logic
│   ├── hooks/               # Custom hooks
│   └── context/             # Context providers
├── public/                  # Static assets
│   └── images/              # Public images
├── images/                  # Local images
├── adapters/
│   └── cloudflare-pages/    # Cloudflare Pages adapter
├── migrations/              # Database migrations
└── docs/                    # Documentation
```

## Key Conventions

### Routing
- Qwik City uses file-based routing
- `index.tsx` files represent routes
- `layout.tsx` files provide nested layouts
- Dynamic routes use `[param]` syntax (e.g., `products/[slug]/index.tsx`)

### Styling
- Custom brand colors defined in `tailwind.config.js`:
  - `solamp-forest`: #042e0d (Deep forest green - primary)
  - `solamp-green`: #56c270 (Vibrant green - CTAs, success)
  - `solamp-blue`: #5974c3 (Technical, links)
  - `solamp-bronze`: #c3a859 (Warnings)
  - `solamp-mist`: #f1f1f2 (Backgrounds)
  - `solamp-mint`: #b1e1bc (Light green)
- Custom fonts:
  - Headings: Barlow
  - Body: Source Sans 3
  - Mono: Roboto Mono
- DaisyUI theme: `solamp` (custom theme defined in config)

### TypeScript
- Strict mode enabled
- Path alias `~/*` maps to `src/*`
- JSX import source: `@builder.io/qwik`
- Module resolution: Bundler

## Important Features

### Products
- Product catalog with categories and subcategories
- Brand filtering
- Product detail pages with slugs

### Learning Center
- Articles and blog posts
- Video content
- Courses
- Calculators (wire gauge, battery sizing, array sizing, ROI estimator)
- Knowledge base and guides (archived content)

### Account Management
- Order tracking
- Quote management
- User authentication (login/register)

### E-Commerce
- Shopping cart
- Checkout flow with contact, shipping, and payment sections
- Quote requests
- Stripe integration

### API Endpoints
- Product sync (`/api/products/sync`)
- Category sync (`/api/categories/sync`)
- Brand sync (`/api/brands/sync`)
- Articles sync and import (`/api/articles/sync`, `/api/articles/import`)

### Visibility Control (ERPNext Integration)
Categories and brands use an **opt-in visibility model**:
- New items default to **hidden** (`is_visible = 0`)
- Staff enable items via ERPNext by setting `is_visible_on_website = true`
- The sync endpoints accept:
  - `is_visible_on_website`: Primary field (true = visible)
  - `disabled`: Legacy fallback (true = hidden)
- Frontend filters all queries by `is_visible = 1`

## Development Commands

```bash
npm run dev              # Start development server (SSR mode)
npm run build            # Build for production
npm run build.client     # Build client only
npm run build.server     # Build server for Cloudflare Pages
npm run build.types      # Type check
npm run preview          # Preview production build
npm run deploy           # Deploy to Cloudflare Pages via Wrangler
```

## Deployment

- Platform: Cloudflare Pages
- Adapter: Custom Cloudflare Pages adapter in `adapters/cloudflare-pages/`
- Deploy command: `npm run deploy` (uses Wrangler)
- Static assets in `/images/*` are excluded from worker routing

## Key Technical Notes

1. **Qwik's Resumability**: Unlike React, Qwik uses resumability instead of hydration. Components are lazy-loaded and executed on interaction.

2. **File-based Routing**: Routes are created by adding files to `src/routes/`. The file structure determines the URL structure.

3. **Component Patterns**: Use Qwik's `component$` for components and `$()` for event handlers to enable proper optimization.

4. **Image Handling**: Recent fix ensures images in `/public/images/` are served statically without worker routing.

5. **Color Usage**: Use solid color classes instead of opacity modifiers to prevent white box issues on certain backgrounds.

## Recent Changes (from git log)

- Fixed opacity text classes replaced with solid colors
- Excluded `/images/*` from worker routing for static file serving
- Implemented local category images for Shop by Category tiles
- Styled hero badge background to be more white
- Removed focus outline from hero mobile touch handler

## D1 Database (Cloudflare)

The project uses Cloudflare D1 for the database with binding `DB`.

### Database: `solampio-migration`
- **Database ID**: 3cc26873-0453-4331-9e0d-7eb89dcf085c
- **Binding**: DB

### Key Tables
- `storefront_products` - Product catalog (has `categories` JSON column for multi-category support)
- `storefront_categories` - Category hierarchy
- `storefront_brands` - Brand information
- `product_website_categories` - BigCommerce category mappings (product_sku → bc_category_id)
- `bc_category_mapping` - Maps BC categories to ERPNext item groups

### Syncing Local D1 from Remote

When products aren't showing in categories, the local D1 database is likely out of sync. **Run these steps:**

```bash
# 1. Export remote database to file
npx wrangler d1 export solampio-migration --remote --output=/tmp/solampio-full-dump.sql

# 2. Install sqlite3 if needed
sudo apt-get install -y sqlite3

# 3. Clear and reimport local database
rm -f .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite*
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/7dd5aa8328aaaad04230d62cf7e3534925f3d8783debd8fa6fee5e49a1ba52af.sqlite < /tmp/solampio-full-dump.sql

# 4. Restart dev server
npm run dev
```

**Note:** Using `wrangler d1 execute --local --file` for large imports can crash with workerd hash table errors. Use sqlite3 directly instead.

### Populating Product Categories

Products have a `categories` JSON column that must be populated from the mapping tables. If products don't appear under category pages:

```bash
# Run the migration on remote
npx wrangler d1 execute solampio-migration --remote --file=migrations/0001_populate_product_categories.sql

# Then sync to local (see above)
```

The migration joins: `product_website_categories` → `bc_category_mapping` → `storefront_categories`

### Checking Category Data

```bash
# Check how many products have categories
npx wrangler d1 execute solampio-migration --remote --command "SELECT COUNT(*) FROM storefront_products WHERE categories IS NOT NULL;"

# Check category counts
npx wrangler d1 execute solampio-migration --remote --command "SELECT title, count FROM storefront_categories WHERE count > 0 ORDER BY count DESC LIMIT 15;"
```

## Notes for AI Assistance

- When making changes, respect Qwik's optimization patterns
- Be mindful of the custom color palette and use defined brand colors
- Check both mobile and desktop layouts (responsive design is important)
- Consider Cloudflare Pages deployment constraints
- Maintain the file-based routing structure
- Keep components simple and follow existing patterns in the codebase
- **Qwik Serialization**: All values returned from hooks must be serializable. Plain functions cause "QWIK ERROR Code(3)". Use `$()` wrapper or compute values inline instead.
