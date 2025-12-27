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
      {/* Sidebar Toggle Button - visible on lg screens */}
      <button
        onClick$={() => { sidebar.visible.value = !sidebar.visible.value; }}
        class={[
          'fixed top-20 z-40 hidden lg:flex items-center justify-center w-10 h-10 bg-[#042e0d] text-white rounded-lg shadow-lg hover:bg-[#042e0d]/90 transition-all duration-300',
          sidebar.visible.value ? 'left-[216px]' : 'left-4'
        ].join(' ')}
        aria-label={sidebar.visible.value ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebar.visible.value ? (
          // Chevron left icon when sidebar is visible
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        ) : (
          // Hamburger icon when sidebar is hidden
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Fixed Sidebar - hidden on mobile, toggleable on lg */}
      <div class={[
        'hidden lg:block transition-transform duration-300',
        sidebar.visible.value ? 'translate-x-0' : '-translate-x-full'
      ].join(' ')}>
        <ProductSidebar />
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
