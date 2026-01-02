import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../../lib/db';

// Loader to fetch product data by SKU
export const useProductData = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const slug = requestEvent.params.slug; // This is the SKU

  // Fetch the product by SKU
  const product = await db.getProduct(slug);
  if (!product) {
    return { product: null, brand: null };
  }

  // Fetch brand if available
  let brand = null;
  if (product.brand_id) {
    brand = await db.getBrand(product.brand_id);
  }

  return {
    product,
    brand
  };
});

export default component$(() => {
  const loc = useLocation();
  const slug = loc.params.slug;
  const data = useProductData();

  const product = data.value.product;
  const brand = data.value.brand;

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

  const firstImage = product.image_url || product.thumbnail_url || null;
  const stockStatus = product.stock_qty > 0 ? 'In Stock' : 'Out of Stock';
  const displayPrice = product.price ? `$${product.price}` : 'Call for Pricing';
  // Parse categories JSON if it's a string
  const categories = product.categories
    ? (typeof product.categories === 'string' ? JSON.parse(product.categories) : product.categories)
    : [];

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
            {/* Product Image */}
            <div class="bg-gray-100 rounded-lg aspect-square flex items-center justify-center sticky top-24 p-8">
              {firstImage ? (
                <img src={firstImage} alt={product.title} class="w-full h-full object-contain" />
              ) : (
                <div class="text-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">Product Photo</span>
                </div>
              )}
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

              {product.description && (
                <p class="text-gray-600 mb-6">
                  {product.description}
                </p>
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div class="mb-6">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-2">Categories</p>
                  <div class="flex flex-wrap gap-2">
                    {categories.map((cat: string) => (
                      <span key={cat} class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                        {cat}
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
                  <button class="flex-1 bg-[#042e0d] text-white font-heading font-bold py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
                    Add to Quote
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
                <p>Have questions? Our engineers can help you select the right equipment for your project. Call 978-451-6890.</p>
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
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-600">{product.description}</p>
              </div>
              <ul class="space-y-2 text-gray-600 mt-6">
                <li class="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Professional-grade quality
                </li>
                <li class="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Full manufacturer warranty
                </li>
                <li class="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Technical support available
                </li>
                {product.stock_qty > 0 && (
                  <li class="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    In stock and ready to ship
                  </li>
                )}
              </ul>
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
            <div class="flex gap-4">
              <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Request Quote
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
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
