import { component$, Slot, useContext, useVisibleTask$, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ProductSidebar } from '../../components/products/ProductSidebar';
import { SidebarContext } from '../../context/sidebar-context';
import { getDB } from '../../lib/db';
import type { Category, Brand } from '../../lib/db';

// Loader to fetch categories for sidebar navigation
export const useAllCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const allCategories = await db.getCategories();

  // Get top-level categories (parent_id = null, visible only)
  const topLevel = allCategories.filter(cat =>
    cat.parent_id === null && cat.is_visible === 1
  );

  // Build hierarchy with subcategories
  const hierarchical = topLevel.map(parent => ({
    ...parent,
    subcategories: allCategories.filter(cat =>
      cat.parent_id === parent.id && cat.is_visible === 1
    )
  }));

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
  const mobileFilterOpen = useSignal(false);

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

      {/* Mobile Filter Button - fixed at bottom on mobile only */}
      <button
        onClick$={() => { mobileFilterOpen.value = true; }}
        class="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-[#042e0d] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#042e0d]/90 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter & Browse
      </button>

      {/* Mobile Filter Drawer - slides up from bottom */}
      {mobileFilterOpen.value && (
        <div class="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            class="absolute inset-0 bg-black/50"
            onClick$={() => { mobileFilterOpen.value = false; }}
          />
          {/* Drawer */}
          <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden animate-slide-up">
            {/* Handle and Header */}
            <div class="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div class="flex items-center justify-between">
                <h2 class="font-heading font-bold text-lg text-[#042e0d]">Browse Products</h2>
                <button
                  onClick$={() => { mobileFilterOpen.value = false; }}
                  class="p-2 text-gray-500 hover:text-[#042e0d] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Sidebar Content */}
            <div class="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              <ProductSidebar categories={categories.value} brands={brands.value} isMobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Content Area - offset for sidebar on large screens when visible */}
      <div class={[
        'transition-all duration-300 pb-20 lg:pb-0',
        sidebar.visible.value ? 'lg:ml-64' : 'lg:ml-0'
      ].join(' ')}>
        <Slot />
      </div>
    </div>
  );
});
