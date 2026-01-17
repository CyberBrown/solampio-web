/**
 * Brand Scroll Component
 *
 * Displays featured brand logos in a scrolling marquee.
 * Shows greyscale logos that transition to color on hover.
 */
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { cleanSlug, type Brand } from '../../lib/db';
import { getBrandLogoVariant } from '../../lib/images';

interface BrandScrollProps {
  brands: Brand[];
  title?: string;
  subtitle?: string;
}

export const BrandScroll = component$<BrandScrollProps>(({
  brands,
  title = 'Authorized Technical Distributor',
  subtitle,
}) => {
  const isPaused = useSignal(false);
  const scrollRef = useSignal<HTMLDivElement>();

  // Auto-scroll animation
  useVisibleTask$(({ cleanup }) => {
    const el = scrollRef.value;
    if (!el) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused.value && el) {
        scrollPosition += speed;
        // Reset when we've scrolled through half (since we duplicate items)
        if (scrollPosition >= el.scrollWidth / 2) {
          scrollPosition = 0;
        }
        el.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    cleanup(() => {
      cancelAnimationFrame(animationId);
    });
  });

  // Don't render if no brands
  if (!brands || brands.length === 0) {
    return null;
  }

  // Duplicate brands for seamless infinite scroll
  const scrollBrands = [...brands, ...brands];

  return (
    <section class="bg-solamp-mist border-b border-gray-300 py-8 overflow-hidden">
      <div class="container mx-auto px-4">
        {/* Header */}
        <div class="text-center mb-6">
          <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest">
            {title}
          </p>
          {subtitle && (
            <p class="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Scrolling brand logos */}
        <div
          ref={scrollRef}
          class="flex items-center gap-8 overflow-hidden"
          onMouseEnter$={() => (isPaused.value = true)}
          onMouseLeave$={() => (isPaused.value = false)}
        >
          {scrollBrands.map((brand, index) => {
            const greyLogoUrl = getBrandLogoVariant(brand, 'greyscale');
            const colorLogoUrl = getBrandLogoVariant(brand, 'full');

            return (
              <Link
                key={`${brand.id}-${index}`}
                href={`/products/brand/${cleanSlug(brand.slug)}/`}
                class="flex-shrink-0 group relative block"
                title={brand.title}
              >
                <div class="w-[150px] h-[75px] flex items-center justify-center bg-white rounded border border-gray-200 px-4 py-2 transition-all group-hover:border-solamp-green group-hover:shadow-md">
                  {greyLogoUrl || colorLogoUrl ? (
                    <div class="relative w-full h-full">
                      {/* Greyscale logo (default) */}
                      {greyLogoUrl && (
                        <img
                          src={greyLogoUrl}
                          alt={brand.title}
                          class="absolute inset-0 w-full h-full object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
                          width="150"
                          height="75"
                          loading="lazy"
                        />
                      )}
                      {/* Color logo (on hover) */}
                      <img
                        src={colorLogoUrl || greyLogoUrl || ''}
                        alt={brand.title}
                        class={[
                          'absolute inset-0 w-full h-full object-contain transition-opacity duration-300',
                          greyLogoUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
                        ].join(' ')}
                        width="150"
                        height="75"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    // Fallback: text-only
                    <span class="font-heading font-bold text-gray-400 group-hover:text-solamp-forest transition-colors text-center text-sm">
                      {brand.title}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all brands link */}
        <div class="text-center mt-6">
          <Link
            href="/products/"
            class="text-solamp-blue text-sm font-bold hover:underline"
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
});

/**
 * Static Brand Grid (no animation)
 *
 * Alternative display for featured brands without scrolling animation.
 * Useful for slower connections or accessibility needs.
 */
export const BrandGrid = component$<BrandScrollProps>(({
  brands,
  title = 'Authorized Technical Distributor',
}) => {
  if (!brands || brands.length === 0) {
    return null;
  }

  return (
    <section class="bg-solamp-mist border-b border-gray-300 py-8">
      <div class="container mx-auto px-4 text-center">
        <p class="text-xs font-mono text-solamp-bronze-dark uppercase tracking-widest mb-6">
          {title}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {brands.map((brand) => {
            const greyLogoUrl = getBrandLogoVariant(brand, 'greyscale');
            const colorLogoUrl = getBrandLogoVariant(brand, 'full');

            return (
              <Link
                key={brand.id}
                href={`/products/brand/${cleanSlug(brand.slug)}/`}
                class="group"
                title={brand.title}
              >
                <div class="w-[120px] h-[60px] md:w-[150px] md:h-[75px] flex items-center justify-center bg-white rounded border border-gray-200 px-3 py-2 transition-all group-hover:border-solamp-green group-hover:shadow-md">
                  {greyLogoUrl || colorLogoUrl ? (
                    <div class="relative w-full h-full">
                      {greyLogoUrl && (
                        <img
                          src={greyLogoUrl}
                          alt={brand.title}
                          class="absolute inset-0 w-full h-full object-contain opacity-60 transition-opacity duration-300 group-hover:opacity-0"
                          width="150"
                          height="75"
                          loading="lazy"
                        />
                      )}
                      <img
                        src={colorLogoUrl || greyLogoUrl || ''}
                        alt={brand.title}
                        class={[
                          'absolute inset-0 w-full h-full object-contain transition-opacity duration-300',
                          greyLogoUrl ? 'opacity-0 group-hover:opacity-100' : 'opacity-100',
                        ].join(' ')}
                        width="150"
                        height="75"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <span class="font-heading font-bold text-gray-400 group-hover:text-solamp-forest transition-colors text-center text-sm">
                      {brand.title}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
});
