import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const products = [
  {
    slug: 'solar-analytics',
    name: 'Solar Analytics Platform',
    description: 'Real-time monitoring and analytics for solar installations.',
    price: 'From $299/mo',
    badge: 'Popular',
  },
  {
    slug: 'panel-optimizer',
    name: 'Panel Optimizer',
    description: 'AI-powered panel positioning and efficiency optimization.',
    price: 'From $199/mo',
    badge: null,
  },
  {
    slug: 'inverter-connect',
    name: 'Inverter Connect',
    description: 'Universal inverter integration and monitoring solution.',
    price: 'From $149/mo',
    badge: 'New',
  },
  {
    slug: 'maintenance-suite',
    name: 'Maintenance Suite',
    description: 'Predictive maintenance and service scheduling platform.',
    price: 'From $249/mo',
    badge: null,
  },
  {
    slug: 'energy-forecast',
    name: 'Energy Forecast',
    description: 'Weather-integrated energy production forecasting.',
    price: 'From $179/mo',
    badge: null,
  },
  {
    slug: 'fleet-manager',
    name: 'Fleet Manager',
    description: 'Multi-site solar installation management dashboard.',
    price: 'Custom pricing',
    badge: 'Enterprise',
  },
];

export default component$(() => {
  return (
    <div class="bg-base-200 min-h-screen">
      {/* Hero */}
      <div class="hero bg-gradient-to-r from-secondary to-neutral text-white py-16">
        <div class="hero-content text-center">
          <div class="max-w-2xl">
            <h1 class="text-4xl md:text-5xl font-bold">Our Products</h1>
            <p class="py-6 text-lg opacity-90">
              Industry-leading solar technology solutions designed for modern energy businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.slug} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <figure class="px-6 pt-6">
                <div class="w-full h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <h2 class="card-title">{product.name}</h2>
                  {product.badge && (
                    <span class={`badge ${product.badge === 'Popular' ? 'badge-primary' : product.badge === 'New' ? 'badge-accent' : 'badge-secondary'}`}>
                      {product.badge}
                    </span>
                  )}
                </div>
                <p class="text-base-content/70">{product.description}</p>
                <p class="font-semibold text-primary">{product.price}</p>
                <div class="card-actions justify-end mt-4">
                  <Link href={`/products/${product.slug}`} class="btn btn-primary btn-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div class="bg-base-100 py-12">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p class="text-base-content/70 mb-6">Contact our sales team for enterprise pricing and custom integrations.</p>
          <Link href="/contact" class="btn btn-secondary">
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Products - SolampIO',
  meta: [
    {
      name: 'description',
      content: 'Explore SolampIO\'s suite of solar industry products and solutions.',
    },
  ],
};
