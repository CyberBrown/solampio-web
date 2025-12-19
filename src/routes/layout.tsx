import { component$, Slot } from '@builder.io/qwik';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default component$(() => {
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
