import { component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ProductSidebar } from '../../components/products/ProductSidebar';
import { SidebarContext } from '../../context/sidebar-context';
import { getDB } from '../../lib/db';
import type { Category, Brand } from '../../lib/db';

// Loader to fetch categories that have products
export const useAllCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const [allCategories, categoryIdsWithProducts] = await Promise.all([
    db.getCategories(),
    db.getCategoryIdsWithProducts()
  ]);

  // Build hierarchical structure from BigCommerce categories:
  // - Top-level = categories with parent_id = null (visible only)
  // - Subcategories = children of those top-level categories
  // - Only include categories that have products (or have subcategories with products)
  const topLevelCategories = allCategories.filter(cat =>
    cat.parent_id === null && cat.is_visible === 1
  );

  const hierarchical = topLevelCategories.map(parent => ({
    ...parent,
    subcategories: allCategories.filter(cat =>
      cat.parent_id === parent.id &&
      cat.is_visible === 1 &&
      categoryIdsWithProducts.has(cat.id)
    )
  })).filter(parent =>
    // Keep parent if it has products directly OR has subcategories with products
    categoryIdsWithProducts.has(parent.id) || parent.subcategories.length > 0
  );

  // Sort by sort_order, then alphabetically
  hierarchical.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });

  return hierarchical;
});

// Loader to fetch brands that have products
export const useAllBrands = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  return await db.getBrandsWithProducts();
});

export default component$(() => {
  const sidebar = useContext(SidebarContext);
  const categories = useAllCategories();
  const brands = useAllBrands();

  // Enable sidebar when this layout mounts, disable when it unmounts
  useVisibleTask$(() => {
    sidebar.enabled.value = true;
    return () => {
      sidebar.enabled.value = false;
    };
  });

  return (
    <div class="bg-white min-h-screen">
      {/* Fixed Sidebar - hidden on mobile, visible on lg when enabled */}
      <div class={[
        'hidden lg:block fixed top-0 left-0 w-64 h-full z-30 transition-transform duration-300',
        sidebar.visible.value ? 'translate-x-0' : '-translate-x-full'
      ].join(' ')}>
        <div class="pt-16 h-full overflow-y-auto bg-white border-r border-gray-200 p-4">
          <ProductSidebar categories={categories.value} brands={brands.value} />
        </div>
      </div>

      {/* Content Area - offset for sidebar on large screens when visible */}
      <div class={[
        'transition-all duration-300',
        sidebar.visible.value ? 'lg:ml-64' : 'lg:ml-0'
      ].join(' ')}>
        <Slot />
      </div>
    </div>
  );
});
