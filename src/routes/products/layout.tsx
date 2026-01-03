import { component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { ProductSidebar } from '../../components/products/ProductSidebar';
import { SidebarContext } from '../../context/sidebar-context';
import { getDB } from '../../lib/db';
import type { Category, Brand } from '../../lib/db';

// Loader to fetch all categories from D1
export const useAllCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const allCategories = await db.getCategories();

  // Find "All Item Groups" root - this is the ERPNext default root
  const allItemGroups = allCategories.find(cat => cat.erpnext_name === 'All Item Groups');
  const rootId = allItemGroups?.id;

  // Build hierarchical structure:
  // - Top-level = children of "All Item Groups" (the real product categories)
  // - Subcategories = children of those top-level categories
  const topLevelCategories = allCategories.filter(cat => cat.parent_id === rootId);

  const hierarchical = topLevelCategories.map(parent => ({
    ...parent,
    subcategories: allCategories.filter(cat => cat.parent_id === parent.id)
  }));

  // Sort by sort_order, then alphabetically
  hierarchical.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });

  return hierarchical;
});

// Loader to fetch all brands from D1
export const useAllBrands = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  return await db.getBrands();
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

  const showSidebar = sidebar.visible.value;

  return (
    <div class="bg-white min-h-screen">
      {/* Fixed Sidebar - hidden on mobile, visible on lg when enabled */}
      <div class={[
        'hidden lg:block fixed top-0 left-0 w-64 h-full z-30 transition-transform duration-300',
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      ].join(' ')}>
        <div class="pt-16 h-full overflow-y-auto bg-white border-r border-gray-200 p-4">
          <ProductSidebar categories={categories.value} brands={brands.value} />
        </div>
      </div>

      {/* Content Area - offset for sidebar on large screens when visible */}
      <div class={[
        'transition-all duration-300',
        showSidebar ? 'lg:ml-64' : 'lg:ml-0'
      ].join(' ')}>
        <Slot />
      </div>
    </div>
  );
});
