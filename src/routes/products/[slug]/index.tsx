import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

export default component$(() => {
  const loc = useLocation();
  const slug = loc.params.slug;

  // Format slug to title
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div class="bg-base-200 min-h-screen">
      {/* Breadcrumb */}
      <div class="bg-base-100 border-b">
        <div class="container mx-auto px-4 py-3">
          <div class="breadcrumbs text-sm">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li class="text-primary">{title}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Product Hero */}
      <div class="container mx-auto px-4 py-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="badge badge-primary mb-4">Solar Solution</span>
            <h1 class="text-4xl font-bold mb-4">{title}</h1>
            <p class="text-lg text-base-content/70 mb-6">
              A comprehensive solution designed to revolutionize your solar operations with cutting-edge technology and industry-leading support.
            </p>
            <div class="flex gap-4 mb-8">
              <button class="btn btn-primary">Request Demo</button>
              <button class="btn btn-outline">Download Specs</button>
            </div>
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-title">Efficiency Boost</div>
                <div class="stat-value text-primary">+25%</div>
              </div>
              <div class="stat">
                <div class="stat-title">Active Users</div>
                <div class="stat-value text-secondary">1.2K+</div>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-48 w-48 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div class="container mx-auto px-4 py-8">
        <div role="tablist" class="tabs tabs-lifted">
          <input type="radio" name="product_tabs" role="tab" class="tab" aria-label="Overview" checked={true} />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <h3 class="text-xl font-semibold mb-4">Product Overview</h3>
            <p class="mb-4">
              {title} is designed from the ground up to meet the demanding requirements of modern solar installations. Our platform integrates seamlessly with existing infrastructure while providing powerful new capabilities.
            </p>
            <ul class="list-disc list-inside space-y-2 text-base-content/70">
              <li>Real-time monitoring and alerts</li>
              <li>AI-powered predictive analytics</li>
              <li>Seamless third-party integrations</li>
              <li>Enterprise-grade security</li>
            </ul>
          </div>

          <input type="radio" name="product_tabs" role="tab" class="tab" aria-label="Specifications" />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <h3 class="text-xl font-semibold mb-4">Technical Specifications</h3>
            <div class="overflow-x-auto">
              <table class="table">
                <tbody>
                  <tr><td class="font-medium">Data Update Frequency</td><td>Real-time (&lt; 1 second)</td></tr>
                  <tr><td class="font-medium">API Support</td><td>REST, GraphQL, WebSocket</td></tr>
                  <tr><td class="font-medium">Data Retention</td><td>Unlimited</td></tr>
                  <tr><td class="font-medium">Uptime SLA</td><td>99.99%</td></tr>
                  <tr><td class="font-medium">Compliance</td><td>SOC 2, GDPR, ISO 27001</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <input type="radio" name="product_tabs" role="tab" class="tab" aria-label="Documentation" />
          <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
            <h3 class="text-xl font-semibold mb-4">Documentation</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <Link href="/docs" class="card bg-base-200 hover:bg-base-300 transition-colors">
                <div class="card-body">
                  <h4 class="card-title text-base">Getting Started Guide</h4>
                  <p class="text-sm text-base-content/70">Quick setup and configuration</p>
                </div>
              </Link>
              <Link href="/docs" class="card bg-base-200 hover:bg-base-300 transition-colors">
                <div class="card-body">
                  <h4 class="card-title text-base">API Reference</h4>
                  <p class="text-sm text-base-content/70">Complete API documentation</p>
                </div>
              </Link>
              <Link href="/docs" class="card bg-base-200 hover:bg-base-300 transition-colors">
                <div class="card-body">
                  <h4 class="card-title text-base">Integration Guides</h4>
                  <p class="text-sm text-base-content/70">Connect with existing systems</p>
                </div>
              </Link>
              <Link href="/docs" class="card bg-base-200 hover:bg-base-300 transition-colors">
                <div class="card-body">
                  <h4 class="card-title text-base">Best Practices</h4>
                  <p class="text-sm text-base-content/70">Optimize your implementation</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div class="bg-secondary text-secondary-content py-12 mt-8">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p class="opacity-90 mb-6">Contact our team for a personalized demo and pricing.</p>
          <Link href="/contact" class="btn btn-accent">
            Schedule Demo
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const title = params.slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} - SolampIO Products`,
    meta: [
      {
        name: 'description',
        content: `Learn about ${title} - a powerful solar industry solution from SolampIO.`,
      },
    ],
  };
};
