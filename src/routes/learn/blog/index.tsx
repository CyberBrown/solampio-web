import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// Placeholder blog posts - will come from Strapi/solampio.com
const blogPosts = [
  {
    title: 'New Sol-Ark 30K Now Available',
    excerpt: 'The highly anticipated Sol-Ark 30K hybrid inverter is now in stock. This powerhouse brings 30kW of continuous power with industry-leading efficiency.',
    date: '2024-12-15',
    slug: 'sol-ark-30k-available',
    category: 'Product News',
    image: null,
  },
  {
    title: 'Winter Installation Tips for New England',
    excerpt: 'Best practices for solar installations during cold weather months. From panel handling to battery temperature considerations.',
    date: '2024-12-10',
    slug: 'winter-installation-tips',
    category: 'Tips',
    image: null,
  },
  {
    title: 'Q4 Product Availability Update',
    excerpt: 'Current stock levels and lead times for popular products heading into 2025. Plan your projects with confidence.',
    date: '2024-12-01',
    slug: 'q4-availability-update',
    category: 'Company News',
    image: null,
  },
  {
    title: 'Fortress Power eFlex Max Now Shipping',
    excerpt: 'The new eFlex Max battery system with enhanced capacity is now available for order. Perfect for larger residential and commercial installations.',
    date: '2024-11-20',
    slug: 'fortress-eflex-max-shipping',
    category: 'Product News',
    image: null,
  },
  {
    title: 'Holiday Schedule 2024',
    excerpt: 'Our holiday hours and shipping cutoff dates for the 2024 holiday season. Plan your orders accordingly.',
    date: '2024-11-15',
    slug: 'holiday-schedule-2024',
    category: 'Company News',
    image: null,
  },
  {
    title: 'MidNite Solar Training Event Recap',
    excerpt: 'Highlights from our recent MidNite Solar training event. Thank you to everyone who attended!',
    date: '2024-11-01',
    slug: 'midnite-training-recap',
    category: 'Events',
    image: null,
  },
];

const categories = ['All', 'Product News', 'Company News', 'Tips', 'Events'];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#c3a859] py-10">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/learn/" class="text-white/50 hover:text-white transition-colors">Learn</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Blog</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-3">
              Blog
            </h1>
            <p class="text-white/80 text-lg">
              Company news, product announcements, and updates from Solamp.
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
                      ? 'bg-[#c3a859] text-white'
                      : 'bg-white hover:bg-[#c3a859] hover:text-white text-[#042e0d] border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div class="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search posts..."
                class="w-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm rounded focus:outline-none focus:border-[#c3a859]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {blogPosts[0] && (
        <section class="py-10 bg-white">
          <div class="container mx-auto px-4">
            <Link
              href={`/learn/blog/${blogPosts[0].slug}/`}
              class="block bg-[#f1f1f2] rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div class="md:flex">
                <div class="md:w-1/2 aspect-video bg-[#042e0d] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="md:w-1/2 p-6 md:p-8">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-xs font-bold px-2 py-1 rounded bg-[#c3a859]/10 text-[#c3a859]">{blogPosts[0].category}</span>
                    <span class="text-xs text-gray-400">
                      {new Date(blogPosts[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 class="font-heading font-extrabold text-2xl text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-3">
                    {blogPosts[0].title}
                  </h2>
                  <p class="text-gray-500">{blogPosts[0].excerpt}</p>
                  <p class="text-[#5974c3] font-bold mt-4">Read More →</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post) => (
              <Link
                key={post.slug}
                href={`/learn/blog/${post.slug}/`}
                class="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div class="aspect-video bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-xs font-bold px-2 py-1 rounded bg-[#c3a859]/10 text-[#c3a859]">{post.category}</span>
                  </div>
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p class="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  <p class="text-xs text-gray-400 mt-3">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div class="text-center mt-10">
            <button class="bg-white border-2 border-[#c3a859] text-[#c3a859] font-heading font-bold px-8 py-3 rounded hover:bg-[#c3a859] hover:text-white transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="max-w-2xl mx-auto text-center">
            <h3 class="font-heading font-extrabold text-2xl text-white mb-3">Stay Updated</h3>
            <p class="text-white/70 mb-6">Get product announcements and industry news delivered to your inbox.</p>
            <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                class="flex-1 px-4 py-3 rounded text-sm focus:outline-none"
              />
              <button
                type="submit"
                class="bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Blog | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Company news, product announcements, and updates from Solamp Solar & Energy Storage.',
    },
  ],
};
