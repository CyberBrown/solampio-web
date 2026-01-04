import { component$, Slot, useSignal, useContextProvider } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SidebarContext } from '../context/sidebar-context';
import { getDB } from '../lib/db';
import type { Category } from '../lib/db';

// Type for navigation category with subcategories
export interface NavCategory extends Category {
  subcategories: Category[];
}

// Load categories for navigation header
export const useNavCategories = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const allCategories = await db.getCategories();

  // Get top-level categories (parent_id = null, visible only)
  const topLevel = allCategories.filter(cat =>
    cat.parent_id === null && cat.is_visible === 1
  );

  // Build hierarchy with subcategories
  const navCategories: NavCategory[] = topLevel.map(parent => ({
    ...parent,
    subcategories: allCategories.filter(cat =>
      cat.parent_id === parent.id && cat.is_visible === 1
    )
  }));

  // Sort by sort_order, then alphabetically
  navCategories.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.title.localeCompare(b.title);
  });

  return navCategories;
});

export default component$(() => {
  const sidebarVisible = useSignal(true);
  const sidebarEnabled = useSignal(false);
  const navCategories = useNavCategories();

  // Provide sidebar context at root level
  useContextProvider(SidebarContext, {
    visible: sidebarVisible,
    enabled: sidebarEnabled,
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Header categories={navCategories.value} />
      <main class="flex-1">
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
