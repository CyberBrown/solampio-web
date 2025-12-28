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

  const showSidebar = sidebar.visible.value;

  return (
    <div class="bg-white min-h-screen">
      {/* Fixed Sidebar - hidden on mobile, visible on lg when enabled */}
      <div class={[
        'hidden lg:block fixed top-0 left-0 w-64 h-full z-30 transition-transform duration-300',
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      ].join(' ')}>
        <div class="pt-16 h-full overflow-y-auto bg-white border-r border-gray-200 p-4">
          <ProductSidebar />
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
