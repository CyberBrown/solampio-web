import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../../lib/db';
import { ProductCard } from '../../../components/product/ProductCard';
import { getCategoryImageUrl } from '../../../lib/images';

// Loader to fetch category data and its products (including subcategory products)
export const useCategoryData = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const categorySlug = requestEvent.params.slug;

  // Fetch the category by slug
  const category = await db.getCategory(categorySlug);
  if (!category) {
    return { category: null, subcategories: [], products: [] };
  }

  // Fetch subcategories (children of this category)
  const subcategories = await db.getSubcategories(category.id);

  // Fetch products from this category AND all subcategories
  const products = await db.getProductsInCategoryTree(category.id, 100);

  return {
    category,
    subcategories,
    products
  };
});

export default component$(() => {
  const loc = useLocation();
  const categorySlug = loc.params.slug;
  const data = useCategoryData();

  const category = data.value.category;
  const categoryName = category?.title || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subcategories = data.value.subcategories;
  const products = data.value.products;
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
                href={`/categories/${categorySlug}/`}
                class="px-4 py-2 bg-[#042e0d] text-white text-sm font-semibold rounded transition-colors"
              >
                All {categoryName}
              </Link>
              {subcategories.map((sub) => {
                const subSlug = cleanSlug(sub.slug);
                return (
                  <Link
                    key={sub.id}
                    href={`/categories/${categorySlug}/${subSlug}/`}
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
  const data = resolveValue(useCategoryData);
  const categorySlug = params.slug;
  const categoryName = data?.category?.title || categorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
