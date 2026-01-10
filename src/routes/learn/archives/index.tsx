import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link } from '@builder.io/qwik-city';
import type { DocumentHead } from '@builder.io/qwik-city';
import { getArticleCountBySection } from '~/lib/db';

export const useArchiveStats = routeLoader$(async ({ platform }) => {
  try {
    const db = platform.env?.DB;
    if (!db) return null;
    return await getArticleCountBySection(db);
  } catch {
    return null;
  }
});

export default component$(() => {
  const stats = useArchiveStats();

  const sections = [
    {
      title: 'Knowledge Base',
      description: 'Technical concepts, terminology, and solar energy fundamentals.',
      href: '/learn/archives/knowledge-base/',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'bg-[#042e0d]',
      count: stats.value?.['knowledge-base'] || 0,
    },
    {
      title: 'Guides',
      description: 'Step-by-step buying guides and how-to resources for installers.',
      href: '/learn/archives/guides/',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-[#5974c3]',
      count: stats.value?.['guides'] || 0,
    },
    {
      title: 'FAQ',
      description: 'Frequently asked questions about solar products and installation.',
      href: '/learn/archives/faq/',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-[#c3a859]',
      count: stats.value?.['faq'] || 0,
    },
    {
      title: 'Videos',
      description: 'Product demos, installation tutorials, and educational videos.',
      href: '/learn/archives/videos/',
      icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-[#56c270]',
      count: stats.value?.['videos'] || 0,
    },
  ];

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#042e0d] py-12">
        <div class="container mx-auto px-4">
          <div class="max-w-3xl">
            <nav class="text-sm mb-4">
              <Link href="/learn/" class="text-white/60 hover:text-white">Learn</Link>
              <span class="text-white/40 mx-2">/</span>
              <span class="text-white">Archives</span>
            </nav>
            <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-white mb-4">
              Cleantech Archives
            </h1>
            <p class="text-white/80 text-lg max-w-2xl">
              A comprehensive resource library covering solar technology, energy storage, and cleantech concepts. Originally curated from our Help Center.
            </p>
          </div>
        </div>
      </section>

      {/* Section Cards */}
      <section class="py-10">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-[#042e0d] transition-all group"
              >
                <div class="flex items-start gap-4">
                  <div class={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d={section.icon} />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <h2 class="font-heading font-bold text-lg text-[#042e0d] group-hover:text-[#5974c3] transition-colors">
                        {section.title}
                      </h2>
                      {section.count > 0 && (
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {section.count} articles
                        </span>
                      )}
                    </div>
                    <p class="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search Hint */}
      <section class="py-8 bg-[#f1f1f2] border-t border-gray-200">
        <div class="container mx-auto px-4 text-center">
          <p class="text-gray-600">
            Looking for something specific?{' '}
            <Link href="/learn/" class="text-[#5974c3] font-semibold hover:underline">
              Use our search
            </Link>{' '}
            or browse by category above.
          </p>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Cleantech Archives | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Comprehensive resource library covering solar technology, energy storage concepts, buying guides, and cleantech fundamentals.',
    },
  ],
};
