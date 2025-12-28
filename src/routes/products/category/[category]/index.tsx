import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';
import { categories } from '../../../../components/products/ProductSidebar';

// Placeholder products - will be replaced with real data
const generateProducts = (categoryName: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
    name: `${categoryName} Product ${i + 1}`,
    category: categoryName,
    price: 'Call for Pricing',
    stock: i % 3 === 0 ? 'Low Stock' : 'In Stock',
    specs: 'Professional Grade | Full Warranty',
    image: null,
  }));
};

export default component$(() => {
  const loc = useLocation();
  const categorySlug = loc.params.category;

  // Find category data
  const category = categories.find((c) => c.slug === categorySlug);
  const categoryName = category?.name || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subcategories = category?.subcategories || [];
  const productCount = category?.count || 0;

  // Generate placeholder products
  const products = generateProducts(categoryName, Math.min(productCount, 12));

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#042e0d] py-8">
        <div class="px-6">
          {/* Breadcrumbs */}
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/products/" class="text-white/50 hover:text-white transition-colors">Products</Link></li>
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
                href={`/products/category/${categorySlug}/`}
                class="px-4 py-2 bg-[#042e0d] text-white text-sm font-semibold rounded transition-colors"
              >
                All {categoryName}
              </Link>
              {subcategories.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/products/category/${categorySlug}/${sub.slug}/`}
                  class="px-4 py-2 bg-white hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d] border border-gray-200"
                >
                  {sub.name} ({sub.count})
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section class="py-8">
        <div class="px-6">
          <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} class="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                <Link href={`/products/${product.id}/`} class="block">
                  <div class="aspect-[4/3] bg-gray-100 flex items-center justify-center relative p-4">
                    <div class="text-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-xs">Product Photo</span>
                    </div>
                    <span class={[
                      'absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded',
                      product.stock === 'In Stock' ? 'bg-[#56c270] text-[#042e0d]' : 'bg-[#c3a859] text-white',
                    ].join(' ')}>{product.stock}</span>
                  </div>
                </Link>
                <div class="p-4">
                  <p class="text-xs font-mono text-[#c3a859] uppercase tracking-wide mb-1">{product.category}</p>
                  <Link href={`/products/${product.id}/`} class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors block">
                    {product.name}
                  </Link>
                  <p class="text-sm text-gray-500 font-mono mt-1">{product.specs}</p>
                  <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span class="font-heading font-bold text-[#042e0d]">{product.price}</span>
                    <button class="bg-[#042e0d] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#042e0d]/80 transition-colors">
                      Add to Quote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {products.length < productCount && (
            <div class="text-center mt-8">
              <button class="bg-white border-2 border-[#042e0d] text-[#042e0d] font-heading font-bold px-8 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                Load More Products
              </button>
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
              <p class="text-white/70 mt-1">Our engineers can help you select the right {categoryName.toLowerCase()} for your project.</p>
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

export const head: DocumentHead = ({ params }) => {
  const categorySlug = params.category;
  const category = categories.find((c) => c.slug === categorySlug);
  const categoryName = category?.name || categorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${categoryName} | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `Shop ${categoryName.toLowerCase()} from trusted manufacturers. Professional-grade solar equipment with full warranty and technical support.`,
      },
    ],
  };
};
