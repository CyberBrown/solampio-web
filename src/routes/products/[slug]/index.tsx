import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug, encodeSkuForUrl, type Product, type ProductImage } from '../../../lib/db';
import { getProductImageUrl } from '../../../lib/images';
import { useCart } from '../../../hooks/useCart';
import ProductImageGallery from '../../../components/product/ProductImageGallery';

// Loader to fetch product data by SKU
export const useProductData = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const slug = requestEvent.params.slug; // This is the SKU

  // Fetch the product by SKU
  const product = await db.getProduct(slug);
  if (!product) {
    return { product: null, brand: null, variants: [], parentProduct: null, images: [], categories: [] };
  }

  // Fetch brand if available
  let brand = null;
  if (product.brand_id) {
    brand = await db.getBrand(product.brand_id);
  }

  // Fetch variants if this product has them
  let variants: Product[] = [];
  if (product.has_variants && product.sku) {
    variants = await db.getVariants(product.sku);
  }

  // Fetch parent product if this is a variant
  let parentProduct: Product | null = null;
  let parentImages: ProductImage[] = [];
  if (product.variant_of) {
    parentProduct = await db.getParentProduct(product.variant_of);
    // Also fetch sibling variants (other variants of the same parent)
    variants = await db.getVariants(product.variant_of);
    // Fetch parent images for fallback
    if (parentProduct) {
      parentImages = await db.getProductImages(parentProduct.id);
    }
  }

  // Fetch all images for this product
  const images = await db.getProductImages(product.id);

  // If variant has no images, fall back to parent images
  const galleryImages = images.length > 0 ? images : parentImages;

  // Resolve category IDs to names
  let categories: { id: string; title: string; slug: string }[] = [];
  if (product.categories) {
    try {
      const categoryIds = JSON.parse(product.categories) as string[];
      const allCategories = await db.getCategories();
      categories = categoryIds
        .map(id => allCategories.find(c => c.id === id))
        .filter((c): c is typeof allCategories[0] => c !== undefined)
        .map(c => ({ id: c.id, title: c.title, slug: c.slug }));
    } catch {
      // Skip invalid JSON
    }
  }

  return {
    product,
    brand,
    variants,
    parentProduct,
    images: galleryImages,
    categories
  };
});

export default component$(() => {
  const data = useProductData();
  const cart = useCart();
  const addedToCart = useSignal(false);

  const product = data.value.product;
  const brand = data.value.brand;
  const variants = data.value.variants;
  const parentProduct = data.value.parentProduct;
  const images = data.value.images;
  const categories = data.value.categories;

  // Get fallback image from product if no gallery images
  const fallbackImage = product ? getProductImageUrl(product, 'detail') : null;

  // Handler for Add to Cart button
  const handleAddToQuote = $(() => {
    if (!product) return;

    cart.addToCart({
      id: product.id,
      sku: product.sku,
      title: product.title,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
      stock_qty: product.stock_qty,
    });

    // Show feedback
    addedToCart.value = true;
    setTimeout(() => {
      addedToCart.value = false;
    }, 2000);
  });

  // If no product found, show error state
  if (!product) {
    return (
      <div class="min-h-[60vh] flex items-center justify-center">
        <div class="text-center">
          <h1 class="font-heading font-extrabold text-3xl text-[#042e0d] mb-4">Product Not Found</h1>
          <p class="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products/" class="inline-flex bg-[#042e0d] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = product.stock_qty > 0 ? 'In Stock' : 'Out of Stock';
  const displayPrice = product.price ? `$${product.price}` : 'Call for Pricing';

  return (
    <div>
      {/* Breadcrumb */}
      <section class="bg-[#f1f1f2] border-b border-gray-200">
        <div class="px-6 py-3">
          <nav class="text-sm">
            <ol class="flex items-center gap-2 flex-wrap">
              <li><Link href="/" class="text-gray-500 hover:text-[#042e0d] transition-colors">Home</Link></li>
              <li class="text-gray-300">/</li>
              <li><Link href="/products/" class="text-gray-500 hover:text-[#042e0d] transition-colors">Products</Link></li>
              {brand && (
                <>
                  <li class="text-gray-300">/</li>
                  <li><Link href={`/products/brand/${cleanSlug(brand.slug)}/`} class="text-gray-500 hover:text-[#042e0d] transition-colors">{brand.title}</Link></li>
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
              <div class={[
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4',
                stockStatus === 'In Stock' ? 'bg-[#56c270]/10 text-[#042e0d]' : 'bg-gray-200 text-gray-600'
              ].join(' ')}>
                {stockStatus} {product.stock_qty > 0 && `(${product.stock_qty} available)`}
              </div>

              {brand && (
                <Link href={`/products/brand/${cleanSlug(brand.slug)}/`} class="inline-block mb-2">
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
                    <Link href={`/products/${encodeSkuForUrl(parentProduct.sku)}/`} class="font-semibold hover:underline">
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
                    {/* Show current product as selected if it's a variant */}
                    {product.variant_of && (
                      <div class="p-3 border-2 border-[#042e0d] bg-[#042e0d]/5 rounded-lg">
                        <p class="font-semibold text-[#042e0d] text-sm truncate">{product.title}</p>
                        <p class="text-xs text-gray-500 font-mono">{product.sku}</p>
                        {product.price && (
                          <p class="text-sm font-bold text-[#042e0d] mt-1">${product.price}</p>
                        )}
                      </div>
                    )}
                    {variants
                      .filter(v => v.sku !== product.sku) // Don't show current product again
                      .map((variant) => (
                        <Link
                          key={variant.id}
                          href={`/products/${encodeSkuForUrl(variant.sku)}/`}
                          class="p-3 border border-gray-200 rounded-lg hover:border-[#042e0d] hover:bg-gray-50 transition-colors"
                        >
                          <p class="font-semibold text-[#042e0d] text-sm truncate">{variant.title}</p>
                          <p class="text-xs text-gray-500 font-mono">{variant.sku}</p>
                          {variant.price && (
                            <p class="text-sm font-bold text-[#042e0d] mt-1">${variant.price}</p>
                          )}
                        </Link>
                      ))}
                  </div>
                  {product.has_variants && variants.length > 6 && (
                    <p class="text-xs text-gray-500 mt-2">
                      Showing {variants.length} options available
                    </p>
                  )}
                </div>
              )}

              {product.description && (
                <p class="text-gray-600 mb-6">
                  {product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200)}
                  {product.description.length > 200 ? '...' : ''}
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
                  <div class="flex justify-between py-1 border-b border-gray-200">
                    <span class="text-gray-500">Stock</span>
                    <span class="font-semibold text-[#042e0d]">{product.stock_qty} units</span>
                  </div>
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
      {product.description && (
        <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
          <div class="px-6">
            <div class="max-w-3xl">
              <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-4">Product Overview</h2>
              <div
                class="prose prose-gray max-w-none prose-headings:font-heading prose-headings:text-[#042e0d] prose-headings:font-bold prose-headings:text-lg prose-headings:mt-6 prose-headings:mb-2 prose-p:text-gray-600 prose-p:mb-4 prose-strong:text-[#042e0d] prose-ul:my-4 prose-li:text-gray-600"
                dangerouslySetInnerHTML={product.description}
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="px-6">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Ready to order?</h3>
              <p class="text-white/70 mt-1">Contact us for pricing and availability.</p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-5 py-3 rounded hover:bg-white transition-colors">
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

export const head: DocumentHead = ({ params, resolveValue }) => {
  const data = resolveValue(useProductData);
  const product = data?.product;

  const title = product?.title || params.slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const description = product?.description
    ? product.description.slice(0, 160)
    : `${title} - Professional solar equipment from Solamp. Contact us for pricing and specifications.`;

  return {
    title: `${title} | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: description,
      },
    ],
  };
};
