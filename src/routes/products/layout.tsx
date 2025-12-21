import { component$, Slot } from '@builder.io/qwik';
import { ProductSidebar } from '../../components/products/ProductSidebar';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Fixed Sidebar - hidden on mobile */}
      <div class="hidden lg:block">
        <ProductSidebar />
      </div>

      {/* Content Area - offset for sidebar on large screens */}
      <div class="lg:ml-64">
        <Slot />
      </div>
    </div>
  );
});
