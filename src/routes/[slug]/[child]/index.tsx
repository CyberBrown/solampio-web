import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link, routeLoader$ } from '@builder.io/qwik-city';
import { getDB, cleanSlug } from '../../../lib/db';
import { ProductCard } from '../../../components/product/ProductCard';
import { getCategoryImageUrl } from '../../../lib/images';

// Loader to fetch subcategory data and its products
export const useSubcategoryData = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const categorySlug = requestEvent.params.slug;
  const subcategorySlug = requestEvent.params.child;

  // Fetch parent category
  const parentCategory = await db.getCategory(categorySlug);
  if (!parentCategory) {
    return { parentCategory: null, subcategory: null, siblingSubcategories: [], products: [], pagination: null };
  }

  // Fetch the subcategory
  const subcategory = await db.getCategory(subcategorySlug);
  if (!subcategory) {
    return { parentCategory, subcategory: null, siblingSubcategories: [], products: [], pagination: null };
  }

  // Fetch all subcategories of the parent (siblings)
  const allCategories = await db.getCategories();
  const siblingSubcategories = allCategories.filter(cat => cat.parent_id === parentCategory.id);

  // Fetch products for this subcategory
  const result = await db.getProducts({
    category: subcategorySlug,
    limit: 50,
    sort: 'title',
    order: 'asc'
  });

  return {
    parentCategory,
    subcategory,
    siblingSubcategories,
    products: result.products,
    pagination: result.pagination
  };
});

export default component$(() => {
  const loc = useLocation();
  const categorySlug = loc.params.slug;
  const subcategorySlug = loc.params.child;
  const data = useSubcategoryData();

  const parentCategory = data.value.parentCategory;
  const subcategory = data.value.subcategory;
  const categoryName = parentCategory?.title || categorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const subcategoryName = subcategory?.title || subcategorySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const siblingSubcategories = data.value.siblingSubcategories;
  const products = data.value.products;
  const productCount = subcategory?.count || 0;

  // Use subcategory image if available, otherwise fall back to parent category image
  const subcategoryImageUrl = subcategory ? getCategoryImageUrl(subcategory, 'hero') : null;
  const categoryImageUrl = parentCategory ? getCategoryImageUrl(parentCategory, 'hero') : null;
  const heroImageUrl = subcategoryImageUrl || categoryImageUrl;

  return (
    <div>
      {/* Hero */}
      <section class="bg-[#042e0d] py-8 relative overflow-hidden">
        {heroImageUrl && (
          <div class="absolute inset-0 opacity-20">
            <img
              src={heroImageUrl}
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
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href={`/${categorySlug}/`} class="text-white/50 hover:text-white transition-colors">{categoryName}</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{subcategoryName}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <p class="text-[#c3a859] text-sm font-semibold mb-1">{categoryName}</p>
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
              {subcategoryName}
            </h1>
            <p class="text-white/80">
              Browse our selection of {subcategoryName.toLowerCase()} products.
              {productCount > 0 && ` ${productCount} products available.`}
            </p>
          </div>
        </div>
      </section>

      {/* Sibling Subcategories */}
      {siblingSubcategories.length > 1 && (
        <section class="border-b border-gray-200 py-4 bg-[#f1f1f2]">
          <div class="px-6">
            <div class="flex flex-wrap gap-2">
              <Link
                href={`/${categorySlug}/`}
                class="px-4 py-2 bg-white hover:bg-[#042e0d] hover:text-white text-sm font-semibold rounded transition-colors text-[#042e0d] border border-gray-200"
              >
                All {categoryName}
              </Link>
              {siblingSubcategories.map((sub) => {
                const subSlug = cleanSlug(sub.slug);
                return (
                  <Link
                    key={sub.id}
                    href={`/${categorySlug}/${subSlug}/`}
                    class={[
                      'px-4 py-2 text-sm font-semibold rounded transition-colors',
                      subSlug === subcategorySlug
                        ? 'bg-[#042e0d] text-white'
                        : 'bg-white hover:bg-[#042e0d] hover:text-white text-[#042e0d] border border-gray-200',
                    ].join(' ')}
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
              <p class="text-white/70 mt-1">Our team can help you select the right {subcategoryName.toLowerCase()} for your project.</p>
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

export const head: DocumentHead = ({ params, resolveValue }) => {
  const data = resolveValue(useSubcategoryData);
  const categorySlug = params.slug;
  const subcategorySlug = params.child;
  const subcategoryName = data?.subcategory?.title || subcategorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const categoryName = data?.parentCategory?.title || categorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${subcategoryName} - ${categoryName} | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `Shop ${subcategoryName.toLowerCase()} from trusted manufacturers. Professional-grade solar equipment with full warranty and technical support.`,
      },
    ],
  };
};
