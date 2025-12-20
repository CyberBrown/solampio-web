import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// Placeholder articles - will come from Strapi/info.solampio.com
const articles = [
  {
    title: '2025 Solar Tax Credit Guide',
    description: 'Federal ITC and state incentives explained for installers and their customers. Updated for 2025 with latest IRS guidance.',
    category: 'Guide',
    slug: 'solar-tax-credit-2025',
    readTime: '8 min read',
    date: '2024-12-01',
  },
  {
    title: 'LiFePO4 vs Lithium-Ion Batteries',
    description: 'Battery chemistry comparison to help you choose the right storage solution. Covers lifespan, safety, cost, and performance.',
    category: 'Comparison',
    slug: 'lifepo4-vs-lithium-ion',
    readTime: '12 min read',
    date: '2024-11-15',
  },
  {
    title: 'Ground Mount vs Roof Mount',
    description: 'When to choose ground mount systems and site assessment considerations. Includes cost analysis and permitting differences.',
    category: 'Guide',
    slug: 'ground-mount-vs-roof-mount',
    readTime: '10 min read',
    date: '2024-11-01',
  },
  {
    title: 'Battery Sizing for Off-Grid',
    description: 'Calculate battery bank size for off-grid residential and commercial systems. Step-by-step methodology with examples.',
    category: 'Calculator',
    slug: 'battery-sizing-off-grid',
    readTime: '15 min read',
    date: '2024-10-20',
  },
  {
    title: 'Sol-Ark 15K Installation Guide',
    description: 'Step-by-step installation and commissioning for Sol-Ark hybrid inverters. Includes wiring diagrams and configuration.',
    category: 'Product',
    slug: 'sol-ark-15k-installation',
    readTime: '20 min read',
    date: '2024-10-10',
  },
  {
    title: 'MidNite Rosie Inverter Overview',
    description: 'Technical specs, installation tips, and configuration for the Rosie series. Complete feature breakdown.',
    category: 'Product',
    slug: 'midnite-rosie-overview',
    readTime: '10 min read',
    date: '2024-09-25',
  },
  {
    title: 'NEC 2023 Changes for Solar',
    description: 'Key code changes affecting solar installations. Rapid shutdown, wire sizing, and grounding updates.',
    category: 'Code',
    slug: 'nec-2023-solar-changes',
    readTime: '12 min read',
    date: '2024-09-15',
  },
  {
    title: 'Hybrid Inverter Comparison',
    description: 'Side-by-side comparison of Sol-Ark, Schneider, and OutBack hybrid inverters for residential applications.',
    category: 'Comparison',
    slug: 'hybrid-inverter-comparison',
    readTime: '18 min read',
    date: '2024-09-01',
  },
];

const categories = ['All', 'Guide', 'Comparison', 'Product', 'Calculator', 'Code'];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#5974c3] py-10">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Articles</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Technical Articles
            </h1>
            <p class="text-white/80 text-lg">
              In-depth guides, comparisons, and technical resources for professional solar installers.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] sticky top-16 z-30">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  class={`px-4 py-2 text-sm font-semibold rounded transition-colors ${
                    cat === 'All'
                      ? 'bg-[#5974c3] text-white'
                      : 'bg-white hover:bg-[#5974c3] hover:text-white text-[#042e0d] border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div class="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search articles..."
                class="w-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm rounded focus:outline-none focus:border-[#5974c3]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/learn/articles/${article.slug}/`}
                class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#5974c3] transition-all group"
              >
                <div class="flex items-center gap-3 mb-3">
                  <span class={`text-xs font-bold px-2 py-1 rounded ${
                    article.category === 'Guide' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                    article.category === 'Comparison' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                    article.category === 'Product' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                    article.category === 'Calculator' ? 'bg-[#042e0d]/10 text-[#042e0d]' :
                    'bg-gray-100 text-gray-600'
                  }`}>{article.category}</span>
                  <span class="text-xs text-gray-400">{article.readTime}</span>
                </div>
                <h2 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">
                  {article.title}
                </h2>
                <p class="text-sm text-gray-500 mb-4">{article.description}</p>
                <p class="text-xs text-gray-400">
                  {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div class="text-center mt-10">
            <button class="bg-white border-2 border-[#5974c3] text-[#5974c3] font-heading font-bold px-8 py-3 rounded hover:bg-[#5974c3] hover:text-white transition-colors">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Have a topic suggestion?</h3>
              <p class="text-white/70 mt-1">Let us know what guides would help your work.</p>
            </div>
            <Link href="/contact/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-white transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Technical Articles | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'In-depth guides, comparisons, and technical resources for professional solar installers. Learn about batteries, inverters, mounting, and more.',
    },
  ],
};
