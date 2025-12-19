import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const docCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    docs: [
      { title: 'Quick Start Guide', description: 'Get up and running in minutes' },
      { title: 'Installation', description: 'System requirements and setup' },
      { title: 'Configuration', description: 'Initial platform configuration' },
    ],
  },
  {
    title: 'API Reference',
    icon: '📡',
    docs: [
      { title: 'Authentication', description: 'API keys and OAuth setup' },
      { title: 'REST Endpoints', description: 'Complete REST API documentation' },
      { title: 'Webhooks', description: 'Real-time event notifications' },
    ],
  },
  {
    title: 'Integrations',
    icon: '🔗',
    docs: [
      { title: 'Inverter Integration', description: 'Connect popular inverter brands' },
      { title: 'Weather Services', description: 'Weather data integration' },
      { title: 'CRM Systems', description: 'Salesforce, HubSpot, and more' },
    ],
  },
  {
    title: 'Best Practices',
    icon: '✨',
    docs: [
      { title: 'Security Guidelines', description: 'Keep your data safe' },
      { title: 'Performance Tips', description: 'Optimize your implementation' },
      { title: 'Troubleshooting', description: 'Common issues and solutions' },
    ],
  },
];

export default component$(() => {
  const searchQuery = useSignal('');

  return (
    <div class="bg-base-200 min-h-screen">
      {/* Header */}
      <div class="bg-secondary text-secondary-content py-16">
        <div class="container mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">Documentation</h1>
          <p class="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Everything you need to integrate and get the most out of SolampIO's platform.
          </p>

          {/* Search */}
          <div class="max-w-xl mx-auto">
            <div class="join w-full">
              <input
                type="text"
                placeholder="Search documentation..."
                class="input input-bordered join-item w-full"
                bind:value={searchQuery}
              />
              <button class="btn btn-primary join-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div class="container mx-auto px-4 -mt-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/docs" class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center py-4">
              <span class="text-2xl">📖</span>
              <span class="font-medium">Guides</span>
            </div>
          </Link>
          <Link href="/docs" class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center py-4">
              <span class="text-2xl">📡</span>
              <span class="font-medium">API</span>
            </div>
          </Link>
          <Link href="/docs" class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center py-4">
              <span class="text-2xl">💻</span>
              <span class="font-medium">SDKs</span>
            </div>
          </Link>
          <Link href="/docs" class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div class="card-body items-center text-center py-4">
              <span class="text-2xl">❓</span>
              <span class="font-medium">FAQ</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Documentation Categories */}
      <div class="container mx-auto px-4 py-12">
        <div class="grid md:grid-cols-2 gap-8">
          {docCategories.map((category) => (
            <div key={category.title} class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title text-xl">
                  <span class="text-2xl mr-2">{category.icon}</span>
                  {category.title}
                </h2>
                <div class="divider my-2"></div>
                <ul class="space-y-3">
                  {category.docs.map((doc) => (
                    <li key={doc.title}>
                      <Link href="/docs" class="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <h3 class="font-medium hover:text-primary">{doc.title}</h3>
                          <p class="text-sm text-base-content/60">{doc.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Status */}
      <div class="bg-base-100 py-12">
        <div class="container mx-auto px-4">
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 class="font-bold text-lg">API Status</h3>
                  <p class="text-base-content/70">All systems operational</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="badge badge-success gap-1">
                    <span class="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                    Operational
                  </span>
                  <a href="#" class="link link-primary text-sm">View status page →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help CTA */}
      <div class="container mx-auto px-4 py-12">
        <div class="card bg-gradient-to-r from-primary to-accent text-white">
          <div class="card-body text-center">
            <h2 class="text-2xl font-bold">Need help?</h2>
            <p class="opacity-90">Our support team is here to help you succeed.</p>
            <div class="card-actions justify-center mt-4">
              <Link href="/contact" class="btn btn-secondary">Contact Support</Link>
              <button class="btn btn-outline btn-white">Join Community</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Documentation - SolampIO',
  meta: [
    {
      name: 'description',
      content: 'SolampIO documentation - API reference, guides, and integration tutorials.',
    },
  ],
};
