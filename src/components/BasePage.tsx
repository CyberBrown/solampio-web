import { component$, Slot } from '@builder.io/qwik';
import { Link } from '~/lib/qwik-city';

interface BasePageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export const BasePage = component$<BasePageProps>(({ title, subtitle, breadcrumbs }) => {
  return (
    <div class="bg-white min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav class="mb-4">
              <ol class="flex items-center gap-2 text-sm flex-wrap">
                <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
                {breadcrumbs.map((crumb, i) => (
                  <>
                    <li class="text-white/30">/</li>
                    <li>
                      {crumb.href ? (
                        <Link href={crumb.href} class="text-white/50 hover:text-white transition-colors">{crumb.label}</Link>
                      ) : (
                        <span class="text-white font-semibold">{crumb.label}</span>
                      )}
                    </li>
                  </>
                ))}
              </ol>
            </nav>
          )}
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              {title}
            </h1>
            {subtitle && (
              <p class="text-white/80 text-lg">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl mx-auto prose prose-lg prose-gray prose-headings:font-heading prose-headings:text-[#042e0d] prose-p:text-gray-700 prose-li:text-gray-700 prose-a:text-[#5974c3]">
            <Slot />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Questions?</h3>
              <p class="text-white/70 mt-1">Our team is here to help.</p>
            </div>
            <div class="flex gap-4">
              <Link href="/contact-us/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
                Contact Us
              </Link>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
                978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});
