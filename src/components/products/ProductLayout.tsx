import { component$, Slot } from '@builder.io/qwik';

interface ProductLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showHero?: boolean;
}

export const ProductLayout = component$<ProductLayoutProps>(({
  title,
  subtitle,
  breadcrumbs = [],
  showHero = true
}) => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero - SOLID Forest Green */}
      {showHero && (
        <section class="bg-[#042e0d] py-8">
          <div class="container mx-auto px-4">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav class="mb-4">
                <ol class="flex items-center gap-2 text-sm">
                  <li>
                    <a href="/" class="text-white/50 hover:text-white transition-colors">Home</a>
                  </li>
                  {breadcrumbs.map((crumb, i) => (
                    <li key={i} class="flex items-center gap-2">
                      <span class="text-white/30">/</span>
                      {crumb.href ? (
                        <a href={crumb.href} class="text-white/50 hover:text-white transition-colors">
                          {crumb.label}
                        </a>
                      ) : (
                        <span class="text-white font-semibold">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div class="max-w-3xl">
              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p class="text-white/80 text-lg">{subtitle}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main content area */}
      <main class="flex-1 min-h-[calc(100vh-4rem)]">
        <Slot />
      </main>
    </div>
  );
});
