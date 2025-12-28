import { component$, Slot, useContext, useVisibleTask$ } from '@builder.io/qwik';
import { ProductSidebar } from '../../components/products/ProductSidebar';
import { SidebarContext } from '../../context/sidebar-context';

export default component$(() => {
  const sidebar = useContext(SidebarContext);

  // Enable sidebar when this layout mounts, disable when it unmounts
  useVisibleTask$(() => {
    sidebar.enabled.value = true;
    return () => {
      sidebar.enabled.value = false;
    };
  });

  return (
    <div class="bg-white min-h-screen">
      {/* Fixed background layer behind sidebar to cover footer bleed-through */}
      {sidebar.visible.value && (
        <div class="hidden lg:block fixed top-0 left-0 w-64 h-full bg-white z-30" aria-hidden="true" />
      )}

      {/* Fixed Sidebar - hidden on mobile, toggleable on lg */}
      {sidebar.visible.value && (
        <div class="hidden lg:block">
          <ProductSidebar />
        </div>
      )}

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
