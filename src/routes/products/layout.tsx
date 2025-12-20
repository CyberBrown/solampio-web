import { component$, Slot } from '@builder.io/qwik';
import { ProductSidebar } from '../../components/products/ProductSidebar';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen flex">
      {/* Fixed Sidebar - hidden on mobile */}
      <div class="hidden lg:block">
        <ProductSidebar />
      </div>

      {/* Scrollable Content Area */}
      <main class="flex-1 lg:ml-64">
        <Slot />
      </main>
    </div>
  );
});
