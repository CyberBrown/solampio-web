import { component$, Slot, useSignal, useContextProvider, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SidebarContext } from '../context/sidebar-context';
import { CartContext, CART_STORAGE_KEY, type CartItem } from '../context/cart-context';
import { getDB } from '../lib/db';
import type { Category, Product, Brand } from '../lib/db';

// Type for navigation category with subcategories
export interface NavCategory extends Category {
  subcategories: Category[];
}

// Type for featured products by category
export type FeaturedProductsMap = Record<string, Product[]>;

// Type for brands by category
export type CategoryBrandsMap = Record<string, Brand[]>;

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

// Load featured products for mega menu (up to 3 per category)
export const useFeaturedProducts = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const featuredMap = await db.getAllFeaturedProductsForMenu();

  // Convert Map to plain object for serialization
  const result: FeaturedProductsMap = {};
  for (const [categoryId, products] of featuredMap) {
    result[categoryId] = products;
  }

  return result;
});

// Load brands associated with each category (for mega menu "Brands we carry" section)
export const useCategoryBrands = routeLoader$(async (requestEvent) => {
  const db = getDB(requestEvent.platform);
  const result: CategoryBrandsMap = {};

  // Get all categories
  const categories = await db.getCategories();

  // For each category, try to get associated brands
  for (const category of categories) {
    try {
      const brands = await db.getBrandsForCategory(category.id);
      if (brands.length > 0) {
        result[category.id] = brands;
      }
    } catch {
      // brand_category_associations table might not exist yet, skip
    }
  }

  return result;
});

export default component$(() => {
  const sidebarVisible = useSignal(true);
  const sidebarEnabled = useSignal(false);
  const navCategories = useNavCategories();
  const featuredProducts = useFeaturedProducts();
  const categoryBrands = useCategoryBrands();

  // Cart state with localStorage persistence
  const cartItems = useSignal<CartItem[]>([]);

  // Load cart from localStorage on mount
  useVisibleTask$(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        cartItems.value = JSON.parse(saved);
      } catch {
        // Invalid JSON, start with empty cart
        cartItems.value = [];
      }
    }
  });

  // Provide sidebar context at root level
  useContextProvider(SidebarContext, {
    visible: sidebarVisible,
    enabled: sidebarEnabled,
  });

  // Provide cart context at root level
  useContextProvider(CartContext, {
    items: cartItems,
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Header
        categories={navCategories.value}
        featuredProducts={featuredProducts.value}
        categoryBrands={categoryBrands.value}
      />
      <main class="flex-1">
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
