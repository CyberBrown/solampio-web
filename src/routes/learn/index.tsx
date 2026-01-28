import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';

// Featured content from different sources
const featuredArticles = [
  {
    title: '2025 Solar Tax Credit Guide',
    description: 'Federal ITC and state incentives explained for installers and their customers.',
    category: 'Guide',
    source: 'articles',
    slug: 'solar-tax-credit-2025',
  },
  {
    title: 'LiFePO4 vs Lithium-Ion Batteries',
    description: 'Battery chemistry comparison to help you choose the right storage solution.',
    category: 'Comparison',
    source: 'articles',
    slug: 'lifepo4-vs-lithium-ion',
  },
  {
    title: 'Ground Mount vs Roof Mount',
    description: 'When to choose ground mount systems and site assessment considerations.',
    category: 'Guide',
    source: 'articles',
    slug: 'ground-mount-vs-roof-mount',
  },
];

const featuredCourses = [
  {
    title: 'Solar Fundamentals',
    description: 'Core concepts of PV systems, components, and installation basics.',
    duration: '4 hours',
    lessons: 12,
    level: 'Beginner',
    slug: 'solar-fundamentals',
  },
  {
    title: 'Battery Storage Design',
    description: 'Design energy storage systems for residential and commercial applications.',
    duration: '6 hours',
    lessons: 18,
    level: 'Intermediate',
    slug: 'battery-storage-design',
  },
  {
    title: 'Off-Grid System Design',
    description: 'Complete off-grid system sizing, component selection, and installation.',
    duration: '8 hours',
    lessons: 24,
    level: 'Advanced',
    slug: 'off-grid-system-design',
  },
];

const recentBlogPosts = [
  {
    title: 'New Sol-Ark 30K Now Available',
    excerpt: 'The highly anticipated Sol-Ark 30K hybrid inverter is now in stock. Here\'s what you need to know.',
    date: '2024-12-15',
    slug: 'sol-ark-30k-available',
  },
  {
    title: 'Winter Installation Tips',
    excerpt: 'Best practices for solar installations during cold weather months.',
    date: '2024-12-10',
    slug: 'winter-installation-tips',
  },
  {
    title: 'Q4 Product Availability Update',
    excerpt: 'Current stock levels and lead times for popular products heading into 2025.',
    date: '2024-12-01',
    slug: 'q4-availability-update',
  },
];

export default component$(() => {
  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <div class="inline-flex items-center gap-2 bg-[#c3a859]/20 text-[#c3a859] px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Resources for Installers
            </div>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Learning &amp; Resources
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              Training courses, technical articles, product guides, and the latest news to help you design and install better solar systems.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section class="py-8 bg-[#f1f1f2] border-b border-gray-200">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-4 gap-4">
            <Link href="/learn/courses/" class="bg-white rounded-lg p-5 border border-gray-200 hover:border-[#042e0d] hover:shadow-lg transition-all group">
              <div class="w-10 h-10 bg-[#042e0d] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Training Courses</h3>
              <p class="text-sm text-gray-500 mt-1">Structured learning via Moodle</p>
            </Link>
            <Link href="/learn/articles/" class="bg-white rounded-lg p-5 border border-gray-200 hover:border-[#042e0d] hover:shadow-lg transition-all group">
              <div class="w-10 h-10 bg-[#5974c3] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Technical Articles</h3>
              <p class="text-sm text-gray-500 mt-1">Guides and how-tos</p>
            </Link>
            <Link href="/learn/blog/" class="bg-white rounded-lg p-5 border border-gray-200 hover:border-[#042e0d] hover:shadow-lg transition-all group">
              <div class="w-10 h-10 bg-[#c3a859] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Blog</h3>
              <p class="text-sm text-gray-500 mt-1">News and updates</p>
            </Link>
            <Link href="/docs/" class="bg-white rounded-lg p-5 border border-gray-200 hover:border-[#042e0d] hover:shadow-lg transition-all group">
              <div class="w-10 h-10 bg-[#56c270] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Document Library</h3>
              <p class="text-sm text-gray-500 mt-1">Datasheets and manuals</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Training Courses */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d]">Training Courses</h2>
              <p class="text-gray-500 text-sm mt-1">Structured learning paths via Moodle LMS</p>
            </div>
            <Link href="/learn/courses/" class="text-[#5974c3] font-bold text-sm hover:underline">View All →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            {featuredCourses.map((course) => (
              <Link key={course.slug} href={`/learn/courses/${course.slug}/`} class="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
                <div class="h-28 bg-[#042e0d] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="p-4">
                  <div class="flex gap-2 mb-2">
                    <span class={`text-xs font-bold px-2 py-0.5 rounded ${course.level === 'Beginner' ? 'bg-[#56c270]/10 text-[#042e0d]' : course.level === 'Advanced' ? 'bg-[#c3a859]/10 text-[#c3a859]' : 'bg-[#5974c3]/10 text-[#5974c3]'}`}>
                      {course.level}
                    </span>
                    <span class="text-xs text-gray-400">{course.duration}</span>
                  </div>
                  <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-1">{course.title}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                  <p class="text-xs text-gray-400 mt-2">{course.lessons} lessons</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Articles */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d]">Technical Articles</h2>
              <p class="text-gray-500 text-sm mt-1">Guides and resources for professional installers</p>
            </div>
            <Link href="/learn/articles/" class="text-[#5974c3] font-bold text-sm hover:underline">View All →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            {featuredArticles.map((article) => (
              <Link key={article.slug} href={`/learn/articles/${article.slug}/`} class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <span class={`text-xs font-bold px-2 py-1 rounded ${
                  article.category === 'Guide' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                  article.category === 'Comparison' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                  'bg-[#5974c3]/10 text-[#5974c3]'
                }`}>{article.category}</span>
                <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mt-3 mb-2">{article.title}</h3>
                <p class="text-sm text-gray-500">{article.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d]">Latest from the Blog</h2>
              <p class="text-gray-500 text-sm mt-1">News, updates, and announcements</p>
            </div>
            <Link href="/learn/blog/" class="text-[#5974c3] font-bold text-sm hover:underline">View All →</Link>
          </div>
          <div class="grid md:grid-cols-3 gap-5">
            {recentBlogPosts.map((post) => (
              <Link key={post.slug} href={`/learn/blog/${post.slug}/`} class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <p class="text-xs text-gray-400 mb-2">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors mb-2">{post.title}</h3>
                <p class="text-sm text-gray-500">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Design Tools */}
      <section class="py-10 bg-[#f1f1f2]">
        <div class="container mx-auto px-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-heading font-extrabold text-xl text-[#042e0d]">Design Tools</h2>
              <p class="text-gray-500 text-sm mt-1">Calculators to help size systems and select components</p>
            </div>
            <Link href="/learn/calculators/" class="text-[#5974c3] font-bold text-sm hover:underline">View All →</Link>
          </div>
          <div class="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Battery Sizing', desc: 'Calculate battery bank capacity', slug: 'battery-sizing', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-[#5974c3]' },
              { name: 'Array Sizing', desc: 'Size PV arrays for loads', slug: 'array-sizing', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-[#c3a859]' },
              { name: 'Wire Gauge', desc: 'Calculate conductor sizes', slug: 'wire-gauge', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-[#56c270]' },
              { name: 'ROI Estimator', desc: 'Calculate payback period', slug: 'roi-estimator', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-[#042e0d]' },
            ].map((tool) => (
              <Link key={tool.name} href={`/learn/calculators/${tool.slug}/`} class="bg-white rounded-lg p-5 text-center border border-gray-200 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                <div class={`w-12 h-12 ${tool.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
                  </svg>
                </div>
                <h3 class="font-heading font-bold text-[#042e0d] text-sm mb-1 group-hover:text-[#5974c3] transition-colors">{tool.name}</h3>
                <p class="text-xs text-gray-500">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Have a technical question?</h3>
              <p class="text-white/70 mt-1">Our team is here to help with system design and troubleshooting.</p>
            </div>
            <a href="tel:978-451-6890" class="inline-flex items-center gap-2 bg-[#c3a859] text-white font-heading font-bold px-6 py-3 rounded hover:bg-[#c3a859]/80 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 978-451-6890
            </a>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Learning & Resources | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Training courses, technical articles, product guides, and design tools for professional solar installers.',
    },
  ],
};
