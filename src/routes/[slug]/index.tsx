import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { useLocation, Link, routeLoader$ } from '~/lib/qwik-city';
import { getDB, cleanSlug, encodeSkuForUrl, getStockStatus, type Product, type ProductImage, type Brand, type Category } from '../../lib/db';
import { getProductImageUrl, getCategoryImageUrl, getBrandLogoVariant } from '../../lib/images';
import { ProductCard } from '../../components/product/ProductCard';
import { useCart } from '../../hooks/useCart';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSocialMeta,
  createJsonLdScript,
} from '../../lib/seo';

type ContentType = 'category' | 'brand' | 'product' | 'not_found';

interface PageData {
  type: ContentType;
  // Category data
  category?: Category | null;
  subcategories?: Category[];
  categoryProducts?: Product[];
  // Brand data
  brand?: Brand | null;
  brandProducts?: Product[];
  allBrands?: Brand[];
  // Product data
  product?: Product | null;
  productBrand?: Brand | null;
  variants?: Product[];
  parentProduct?: Product | null;
  images?: ProductImage[];
  productCategories?: { id: string; title: string; slug: string }[];
}

// Unified loader that checks category, brand, then product
export const usePageData = routeLoader$(async (requestEvent): Promise<PageData> => {
  const db = getDB(requestEvent.platform);
  const slug = requestEvent.params.slug;

  // 1. Check if it's a category
  const category = await db.getCategory(slug);
  if (category) {
    const subcategories = await db.getSubcategories(category.id);
    const products = await db.getProductsInCategoryTree(category.id, 100);
    return {
      type: 'category',
      category,
      subcategories,
      categoryProducts: products,
    };
  }

  // 2. Check if it's a brand
  const brand = await db.getBrand(slug);
  if (brand) {
    const allBrands = await db.getBrands();
    const result = await db.getProducts({
      brand: slug,
      limit: 50,
      sort: 'title',
      order: 'asc'
    });
    return {
      type: 'brand',
      brand,
      brandProducts: result.products,
      allBrands,
    };
  }

  // 3. Check if it's a product
  const product = await db.getProduct(slug);
  if (product) {
    let productBrand = null;
    if (product.brand_id) {
      productBrand = await db.getBrand(product.brand_id);
    }

    let variants: Product[] = [];
    if (product.has_variants && product.sku) {
      variants = await db.getVariants(product.sku);
    }

    let parentProduct: Product | null = null;
    let parentImages: ProductImage[] = [];
    if (product.variant_of) {
      parentProduct = await db.getParentProduct(product.variant_of);
      variants = await db.getVariants(product.variant_of);
      if (parentProduct) {
        parentImages = await db.getProductImages(parentProduct.id);
      }
    }

    const images = await db.getProductImages(product.id);
    const galleryImages = images.length > 0 ? images : parentImages;

    let productCategories: { id: string; title: string; slug: string }[] = [];
    if (product.categories) {
      try {
        const categoryIds = JSON.parse(product.categories) as string[];
        const allCategories = await db.getCategories();
        productCategories = categoryIds
          .map(id => allCategories.find(c => c.id === id))
          .filter((c): c is typeof allCategories[0] => c !== undefined)
          .map(c => ({ id: c.id, title: c.title, slug: c.slug }));
      } catch {
        // Skip invalid JSON
      }
    }

    return {
      type: 'product',
      product,
      productBrand,
      variants,
      parentProduct,
      images: galleryImages,
      productCategories,
    };
  }

  // 4. Not found - return proper 404 status for SEO
  requestEvent.status(404);
  return { type: 'not_found' };
});

// Category Page Component
const CategoryPage = component$<{ data: PageData }>(({ data }) => {
  const loc = useLocation();
  const categorySlug = loc.params.slug;

  const category = data.category;
  const categoryName = category?.title || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subcategories = data.subcategories || [];
  const products = data.categoryProducts || [];
  const productCount = products.length;

  const categoryImageUrl = category ? getCategoryImageUrl(category, 'hero') : null;

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#042e0d] py-8 relative overflow-hidden">
        {categoryImageUrl && (
          <div class="absolute inset-0 opacity-20">
            <img
              src={categoryImageUrl}
              alt=""
              class="w-full h-full object-cover"
              loading="eager"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-[#042e0d] via-[#042e0d]/80 to-transparent" />
          </div>
        )}
        <div class="px-6 relative z-10">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{categoryName}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
              {categoryName}
            </h1>
            <p class="text-white/80">
              Browse our selection of {categoryName.toLowerCase()} from trusted manufacturers.
              {productCount > 0 && ` ${productCount} products available.`}
            </p>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <section class="border-b border-gray-200 py-4 bg-[#f1f1f2]">
          <div class="px-6">
            <div class="flex flex-wrap gap-2">
              <Link
                href={`/${categorySlug}/`}
                class="px-4 py-2 bg-[#042e0d] text-white text-sm font-semibold rounded transition-colors"
              >
                All {categoryName}
              </Link>
              {subcategories.map((sub) => {
                const subSlug = cleanSlug(sub.slug);
                return (
                  <Link
                    key={sub.id}
                    href={`/${categorySlug}/${subSlug}/`}
                    class="px-4 py-2 bg-white hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d] border border-gray-200"
                  >
                    {sub.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section class="py-8">
        <div class="px-6">
          {products.length === 0 ? (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">No products found in this category.</p>
              <p class="text-gray-400 text-sm mt-2">Check back soon or contact us for availability.</p>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Need help choosing?</h3>
              <p class="text-white/70 mt-1">Our team can help you select the right {categoryName.toLowerCase()} for your project.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

// Brand Page Component
const BrandPage = component$<{ data: PageData }>(({ data }) => {
  const loc = useLocation();
  const brandSlug = loc.params.slug;

  const brand = data.brand;
  const brandName = brand?.title || brandSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const products = data.brandProducts || [];
  const allBrands = data.allBrands || [];
  const productCount = products.length;

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#5974c3] py-8">
        <div class="px-6">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/brands/" class="text-white/50 hover:text-white transition-colors">Brands</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{brandName}</li>
            </ol>
          </nav>
          <div class="flex items-center gap-6">
            {/* Brand Logo */}
            <div class="w-24 h-24 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              {brand && getBrandLogoVariant(brand, 'full') ? (
                <img src={getBrandLogoVariant(brand, 'full') || ''} alt={brandName} class="w-full h-full object-contain p-2" />
              ) : (
                /* Styled placeholder when no logo available */
                <div class="w-full h-full flex items-center justify-center bg-white/30 rounded-lg border-2 border-dashed border-white/40 p-2">
                  <span class="text-white font-heading font-bold text-sm text-center leading-tight line-clamp-2">
                    {brandName}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p class="text-white/60 text-sm font-semibold mb-1">Authorized Distributor</p>
              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
                {brandName}
              </h1>
              <p class="text-white/80">
                Browse our selection of {brandName} products.
                {productCount > 0 && ` ${productCount} products available.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Other Brands Quick Nav */}
      {allBrands.length > 0 && (
        <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] overflow-x-auto">
          <div class="px-6">
            <div class="flex gap-2 min-w-max">
              {allBrands.slice(0, 8).map((b) => {
                const bSlug = cleanSlug(b.slug);
                return (
                  <Link
                    key={b.id}
                    href={`/${bSlug}/`}
                    class={[
                      'px-4 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap',
                      bSlug === brandSlug
                        ? 'bg-[#5974c3] text-white'
                        : 'bg-white hover:bg-[#5974c3] hover:text-white text-[#042e0d] border border-gray-200',
                    ].join(' ')}
                  >
                    {b.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section class="py-8">
        <div class="px-6">
          {products.length === 0 ? (
            <div class="text-center py-12">
              <p class="text-gray-500 text-lg">No products found for this brand.</p>
              <p class="text-gray-400 text-sm mt-2">Check back soon or contact us for availability.</p>
            </div>
          ) : (
            <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Info */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="px-6">
          <div class="max-w-3xl">
            <h2 class="font-heading font-extrabold text-xl text-[#042e0d] mb-4">About {brandName}</h2>
            {brand?.description ? (
              <p class="text-gray-600 mb-4">{brand.description}</p>
            ) : (
              <p class="text-gray-600 mb-4">
                {brandName} is a trusted manufacturer of professional-grade solar and energy storage equipment.
                As an authorized distributor, Solamp provides full warranty support and technical assistance for all {brandName} products.
              </p>
            )}
            <div class="flex flex-wrap gap-4">
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Products</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">{productCount}+</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Warranty</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">Full</p>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <p class="text-xs font-mono text-[#c3a859] uppercase mb-1">Support</p>
                <p class="font-heading font-bold text-xl text-[#042e0d]">Technical</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Questions about {brandName}?</h3>
              <p class="text-white/70 mt-1">Our team can help you select the right products for your project.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

// Product Page Component
const ProductPage = component$<{ data: PageData }>(({ data }) => {
  const cart = useCart();
  const addedToCart = useSignal(false);

  const product = data.product;
  const brand = data.productBrand;
  const variants = data.variants || [];
  const parentProduct = data.parentProduct;
  const images = data.images || [];
  const categories = data.productCategories || [];

  const fallbackImage = product ? getProductImageUrl(product, 'hero') : null;

  const handleAddToQuote = $(() => {
    if (!product) return;

    cart.addToCart({
      id: product.id,
      sku: product.sku,
      title: product.title,
      price: product.price,
      thumbnail_url: getProductImageUrl(product, 'thumbnail'),
      stock_qty: product.stock_qty,
    });

    addedToCart.value = true;
    setTimeout(() => {
      addedToCart.value = false;
    }, 2000);
  });

  if (!product) {
    return (
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center">
          <h1 class="font-heading font-extrabold text-3xl text-[#042e0d] mb-4">Product Not Found</h1>
          <p class="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/" class="inline-flex bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const stockInfo = getStockStatus(product, true);
  const isOutOfStock = stockInfo.status === 'out_of_stock';
  const displayPrice = product.price ? `$${product.price}` : 'Call for Pricing';

  return (
    <div>
      {/* Breadcrumb */}
      <section class="bg-[#f1f1f2] border-b border-gray-200">
        <div class="px-6 py-3">
          <nav class="text-sm">
            <ol class="flex items-center gap-2 flex-wrap">
              <li><Link href="/" class="text-gray-500 hover:text-[#042e0d] transition-colors">Home</Link></li>
              {brand && (
                <>
                  <li class="text-gray-300">/</li>
                  <li><Link href={`/${cleanSlug(brand.slug)}/`} class="text-gray-500 hover:text-[#042e0d] transition-colors">{brand.title}</Link></li>
                </>
              )}
              <li class="text-gray-300">/</li>
              <li class="text-[#042e0d] font-semibold truncate">{product.title}</li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section class="py-8">
        <div class="px-6">
          <div class="grid lg:grid-cols-2 gap-8 items-start">
            {/* Product Image Gallery */}
            <div class="lg:sticky lg:top-24">
              <ProductImageGallery
                images={images}
                productTitle={product.title}
                fallbackImage={fallbackImage}
              />
            </div>

            {/* Product Info */}
            <div>
              {stockInfo.showBadge && (
                <div class={[
                  'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4',
                  stockInfo.badgeClass
                ].join(' ')}>
                  {stockInfo.label}
                  {stockInfo.status === 'in_stock' && product.stock_qty > 0 && ` (${product.stock_qty} available)`}
                </div>
              )}

              {brand && (
                <Link href={`/${cleanSlug(brand.slug)}/`} class="inline-block mb-2">
                  <p class="text-sm font-mono text-[#5974c3] hover:underline uppercase tracking-wide">
                    {brand.title}
                  </p>
                </Link>
              )}

              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-[#042e0d] mb-2">{product.title}</h1>
              <p class="text-sm text-gray-500 font-mono mb-4">SKU: {product.sku}</p>

              {/* Parent Product Link (for variants) */}
              {parentProduct && (
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-sm text-blue-700">
                    This is a variant of{' '}
                    <Link href={`/${encodeSkuForUrl(parentProduct.sku)}/`} class="font-semibold hover:underline">
                      {parentProduct.title}
                    </Link>
                  </p>
                </div>
              )}

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div class="mb-6">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">
                    {product.has_variants ? 'Available Options' : 'Other Options'}
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {variants.map((variant) => {
                      const isCurrentProduct = variant.sku === product.sku;
                      return isCurrentProduct ? (
                        <div
                          key={variant.id}
                          class="p-3 border-2 border-[#042e0d] bg-[#042e0d]/5 rounded-lg"
                        >
                          <p class="font-semibold text-[#042e0d] text-sm truncate">{variant.title}</p>
                          <p class="text-xs text-gray-500 font-mono">{variant.sku}</p>
                          {variant.price && (
                            <p class="text-sm font-bold text-[#042e0d] mt-1">${variant.price}</p>
                          )}
                        </div>
                      ) : (
                        <Link
                          key={variant.id}
                          href={`/${encodeSkuForUrl(variant.sku)}/`}
                          class="p-3 border border-gray-200 rounded-lg hover:border-[#042e0d] hover:bg-gray-50 transition-colors"
                        >
                          <p class="font-semibold text-[#042e0d] text-sm truncate">{variant.title}</p>
                          <p class="text-xs text-gray-500 font-mono">{variant.sku}</p>
                          {variant.price && (
                            <p class="text-sm font-bold text-[#042e0d] mt-1">${variant.price}</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  {product.has_variants && variants.length > 6 && (
                    <p class="text-xs text-gray-500 mt-2">
                      Showing {variants.length} options available
                    </p>
                  )}
                </div>
              )}

              {/* Product Summary */}
              {(product.seo_description_summary || product.description_summary || parentProduct?.seo_description_summary || parentProduct?.description_summary || product.description || parentProduct?.description) && (
                <p class="text-gray-600 mb-6">
                  {product.seo_description_summary || product.description_summary || parentProduct?.seo_description_summary || parentProduct?.description_summary ||
                    (product.description || parentProduct?.description)?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200) +
                    (((product.description || parentProduct?.description)?.length || 0) > 200 ? '...' : '')}
                </p>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div class="mb-6">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Categories</p>
                  <div class="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat.id} class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {cat.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs */}
              <div class="bg-[#f1f1f2] rounded-lg p-5 mb-6">
                <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-3">Product Details</p>
                <div class="space-y-2 text-sm">
                  {brand && (
                    <div class="flex justify-between py-1 border-b border-gray-200">
                      <span class="text-gray-500">Brand</span>
                      <span class="font-semibold text-[#042e0d]">{brand.title}</span>
                    </div>
                  )}
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">SKU</span>
                    <span class="font-semibold text-[#042e0d]">{product.sku}</span>
                  </div>
                  {product.weight_lbs && (
                    <div class="flex justify-between py-1 border-b border-gray-200">
                      <span class="text-gray-500">Weight</span>
                      <span class="font-semibold text-[#042e0d]">{product.weight_lbs} lbs</span>
                    </div>
                  )}
                  {stockInfo.showBadge && (
                    <div class="flex justify-between py-1 border-b border-gray-200">
                      <span class="text-gray-500">Stock</span>
                      <span class={['font-semibold', stockInfo.textClass].join(' ')}>
                        {stockInfo.label}
                      </span>
                    </div>
                  )}
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">Warranty</span>
                    <span class="font-semibold text-[#042e0d]">Manufacturer Warranty</span>
                  </div>
                </div>
              </div>

              {/* Price and CTA */}
              <div class="border border-gray-200 rounded-lg p-5 mb-6">
                <p class="font-heading font-extrabold text-2xl text-[#042e0d] mb-4">{displayPrice}</p>
                <div class="flex gap-3">
                  {isOutOfStock ? (
                    <>
                      <button
                        disabled
                        class="flex-1 font-heading font-bold py-3 rounded bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                      <a href="tel:978-451-6890" class="flex items-center justify-center gap-2 bg-[#042e0d] text-white font-bold px-5 py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call for Availability
                      </a>
                    </>
                  ) : (
                    <>
                      <button
                        onClick$={handleAddToQuote}
                        class={[
                          'flex-1 font-heading font-bold py-3 rounded transition-colors',
                          addedToCart.value
                            ? 'bg-[#56c270] text-white'
                            : 'bg-[#042e0d] text-white hover:bg-[#042e0d]/80'
                        ].join(' ')}
                      >
                        {addedToCart.value ? 'Added!' : 'Add to Cart'}
                      </button>
                      <a href="tel:978-451-6890" class="flex items-center justify-center gap-2 bg-[#c3a859] text-white font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Support */}
              <div class="flex items-start gap-3 text-sm text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p>Have questions? Our team can help you select the right equipment for your project. Call 978-451-6890.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Description Tab */}
      {(product.description_clean || parentProduct?.description_clean || product.description || parentProduct?.description) && (
        <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
          <div class="px-6">
            <div class="max-w-3xl">
              <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Product Overview</h2>
              {(product.description_clean || parentProduct?.description_clean) ? (
                <div class="prose prose-gray max-w-none">
                  {(product.description_clean || parentProduct?.description_clean)!.split('\n\n').map((paragraph, i) => (
                    <p key={i} class="text-gray-600 mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div
                  class="prose prose-gray max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-headings:font-bold prose-headings:text-lg prose-headings:mt-6 prose-headings:mb-2 prose-p:text-gray-600 prose-p:mb-4 prose-strong:text-[#042e0d] prose-ul:my-4 prose-li:text-gray-600"
                  dangerouslySetInnerHTML={product.description || parentProduct?.description || ''}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Product FAQs */}
      {(() => {
        const faqSource = product.seo_faqs || parentProduct?.seo_faqs;
        if (!faqSource) return null;
        try {
          const faqs = JSON.parse(faqSource);
          if (!Array.isArray(faqs) || faqs.length === 0) return null;
          return (
            <section class="py-8 border-t border-gray-200">
              <div class="px-6">
                <div class="max-w-3xl">
                  <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Frequently Asked Questions</h2>
                  <div class="space-y-3">
                    {faqs.map((faq: { question: string; answer: string }, i: number) => (
                      <details key={i} class="border rounded-lg group">
                        <summary class="px-4 py-3 cursor-pointer font-medium text-[#042e0d] hover:bg-gray-50 list-none flex justify-between items-center">
                          <span>{faq.question}</span>
                          <span class="text-xl text-gray-400 group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <div class="px-4 pb-4 text-gray-600">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        } catch { return null; }
      })()}

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to order?</h3>
              <p class="text-white/70 mt-1">Contact us for pricing and availability.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-5 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

// Not Found Component
const NotFoundPage = component$(() => {
  return (
    <div class="min-h-[60vh] flex items-center justify-center">
      <div class="text-center">
        <h1 class="font-heading font-extrabold text-3xl text-[#042e0d] mb-4">Page Not Found</h1>
        <p class="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" class="inline-flex bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
});

// Main Component - renders based on content type
export default component$(() => {
  const data = usePageData();

  if (data.value.type === 'category') {
    return <CategoryPage data={data.value} />;
  }

  if (data.value.type === 'brand') {
    return <BrandPage data={data.value} />;
  }

  if (data.value.type === 'product') {
    return <ProductPage data={data.value} />;
  }

  return <NotFoundPage />;
});

// Dynamic head based on content type
export const head: DocumentHead = ({ params, resolveValue }) => {
  const data = resolveValue(usePageData);
  const slug = params.slug;

  if (data?.type === 'category') {
    const category = data.category;
    const categoryName = category?.title || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const pageUrl = `${SITE_URL}/${slug}/`;
    const description = `Shop ${categoryName.toLowerCase()} from trusted manufacturers. Professional-grade solar equipment with full warranty and technical support.`;
    const imageUrl = category ? getCategoryImageUrl(category, 'hero') : null;

    return {
      title: `${categoryName} | Solamp Solar & Energy Storage`,
      meta: [
        { name: 'description', content: description },
        ...generateSocialMeta({
          title: `${categoryName} | Solamp Solar & Energy Storage`,
          description,
          url: pageUrl,
          image: imageUrl || DEFAULT_OG_IMAGE,
          type: 'website',
        }),
      ],
      scripts: [
        createJsonLdScript(generateBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: categoryName, url: pageUrl },
        ])),
      ],
    };
  }

  if (data?.type === 'brand') {
    const brand = data.brand;
    const brandName = brand?.title || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const pageUrl = `${SITE_URL}/${slug}/`;
    const description = `Shop ${brandName} products. Authorized distributor with full warranty support and technical assistance. Professional-grade solar equipment.`;
    const logoUrl = brand ? getBrandLogoVariant(brand, 'full') : null;

    return {
      title: `${brandName} Products | Solamp Solar & Energy Storage`,
      meta: [
        { name: 'description', content: description },
        ...generateSocialMeta({
          title: `${brandName} Products | Solamp Solar & Energy Storage`,
          description,
          url: pageUrl,
          image: logoUrl || DEFAULT_OG_IMAGE,
          type: 'website',
        }),
      ],
      scripts: [
        createJsonLdScript(generateBreadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Brands', url: `${SITE_URL}/brands/` },
          { name: brandName, url: pageUrl },
        ])),
      ],
    };
  }

  if (data?.type === 'product') {
    const product = data.product;
    const brand = data.productBrand;
    const fallbackTitle = slug.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const productName = product?.title || fallbackTitle;

    // Use SEO-optimized fields when available, with fallbacks
    const pageTitle = product?.seo_title || productName;
    const description = product?.seo_meta_description
      || product?.description_summary?.slice(0, 160)
      || product?.description_clean?.slice(0, 160)
      || product?.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      || `${productName} - Professional solar equipment from Solamp. Contact us for pricing and specifications.`;
    const ogTitle = product?.seo_og_title || pageTitle;
    const ogDescription = product?.seo_og_description || description;
    const robots = product?.seo_robots || 'index, follow';

    // Parse keywords from JSON string
    let keywords = '';
    if (product?.seo_keywords) {
      try {
        const parsed = JSON.parse(product.seo_keywords);
        keywords = Array.isArray(parsed) ? parsed.join(', ') : '';
      } catch { /* ignore */ }
    }

    const pageUrl = `${SITE_URL}/${slug}/`;
    const imageUrl = product ? getProductImageUrl(product, 'hero') : null;

    // Determine availability
    let availability: 'InStock' | 'OutOfStock' | 'PreOrder' = 'InStock';
    if (product) {
      const stockInfo = getStockStatus(product);
      if (stockInfo.status === 'out_of_stock') {
        availability = 'OutOfStock';
      } else if (stockInfo.status === 'low_stock') {
        availability = 'InStock';
      }
    }

    // Build breadcrumb items
    const breadcrumbs = [{ name: 'Home', url: SITE_URL }];
    if (brand) {
      breadcrumbs.push({ name: brand.title, url: `${SITE_URL}/${cleanSlug(brand.slug)}/` });
    }
    breadcrumbs.push({ name: productName, url: pageUrl });

    // Build JSON-LD schemas
    const schemas: object[] = [
      generateProductSchema({
        name: productName,
        description: description,
        sku: product?.sku || slug,
        image: imageUrl || undefined,
        brand: brand?.title,
        price: product?.price || undefined,
        priceCurrency: 'USD',
        availability,
        url: pageUrl,
        category: product?.gmc_google_category || product?.item_group || undefined,
      }),
      generateBreadcrumbSchema(breadcrumbs),
    ];

    // Add FAQ schema if FAQs exist
    if (product?.seo_faqs) {
      try {
        const faqs = JSON.parse(product.seo_faqs);
        if (Array.isArray(faqs) && faqs.length > 0) {
          schemas.push(generateFAQSchema(faqs));
        }
      } catch { /* ignore */ }
    }

    const meta = [
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
      ...generateSocialMeta({
        title: ogTitle,
        description: ogDescription,
        url: pageUrl,
        image: imageUrl || DEFAULT_OG_IMAGE,
        type: 'product',
      }),
    ];

    return {
      title: pageTitle.includes('Solamp') ? pageTitle : `${pageTitle} | Solamp Solar & Energy Storage`,
      meta,
      links: [
        { rel: 'canonical', href: pageUrl },
      ],
      scripts: [
        createJsonLdScript(schemas),
      ],
    };
  }

  // Not found
  return {
    title: 'Page Not Found | Solamp Solar & Energy Storage',
    meta: [
      {
        name: 'description',
        content: 'The page you are looking for could not be found.',
      },
    ],
  };
};
