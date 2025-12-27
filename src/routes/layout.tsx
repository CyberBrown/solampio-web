import { component$, Slot, useSignal, useContextProvider } from '@builder.io/qwik';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SidebarContext } from '../context/sidebar-context';

export default component$(() => {
  const sidebarVisible = useSignal(true);
  const sidebarEnabled = useSignal(false);

  // Provide sidebar context at root level
  useContextProvider(SidebarContext, {
    visible: sidebarVisible,
    enabled: sidebarEnabled,
  });

  return (
    <div class="min-h-screen flex flex-col">
      <Header />
      <main class="flex-1">
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
