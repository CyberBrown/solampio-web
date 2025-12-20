import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

// Placeholder documents
const generateDocs = (categoryName: string, count: number) => {
  const docTypes = ['Datasheet', 'Manual', 'Installation Guide', 'Spec Sheet', 'Quick Start', 'Wiring Diagram'];
  const brands = ['Sol-Ark', 'MidNite Solar', 'Fortress Power', 'ZNShine', 'Tamarack', 'OutBack'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-doc-${i + 1}`,
    name: `${brands[i % brands.length]} ${categoryName} ${docTypes[i % docTypes.length]} ${i + 1}`,
    type: 'PDF',
    size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
    updated: '2024-12-01',
    slug: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-doc-${i + 1}`,
  }));
};

export default component$(() => {
  const loc = useLocation();
  const categorySlug = loc.params.category;

  // Format slug to title
  const categoryName = categorySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const documents = generateDocs(categoryName, 12);

  return (
    <div class="bg-white min-h-screen">
      {/* Hero */}
      <section class="bg-[#56c270] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/docs/" class="text-white/50 hover:text-white transition-colors">Documents</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{categoryName}</li>
            </ol>
          </nav>
          <div class="max-w-3xl">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
              {categoryName} Documents
            </h1>
            <p class="text-white/90">
              Datasheets, manuals, and technical documentation for {categoryName.toLowerCase()}.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section class="border-b border-gray-200 py-4 bg-[#f1f1f2] sticky top-16 z-30">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="relative w-full md:w-80">
              <input
                type="text"
                placeholder={`Search ${categoryName.toLowerCase()} documents...`}
                class="w-full border border-gray-300 bg-white px-4 py-2 pr-10 text-sm rounded focus:outline-none focus:border-[#56c270]"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex gap-2">
              <select class="border border-gray-300 bg-white px-3 py-2 text-sm rounded">
                <option disabled selected>Document Type</option>
                <option>Datasheet</option>
                <option>Manual</option>
                <option>Installation Guide</option>
                <option>Spec Sheet</option>
              </select>
              <select class="border border-gray-300 bg-white px-3 py-2 text-sm rounded">
                <option disabled selected>Brand</option>
                <option>Sol-Ark</option>
                <option>MidNite Solar</option>
                <option>Fortress Power</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <p class="text-sm text-gray-500 mb-4">Showing {documents.length} documents</p>
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="divide-y divide-gray-100">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/docs/${doc.slug}/`}
                  class="flex items-center justify-between p-4 hover:bg-[#f1f1f2] transition-colors group"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-heading font-bold text-[#042e0d] group-hover:text-[#56c270] transition-colors">{doc.name}</p>
                      <p class="text-sm text-gray-500">{doc.type} | {doc.size} | Updated {doc.updated}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <button class="text-[#5974c3] text-sm font-bold hover:underline hidden md:block">Preview</button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-[#56c270] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div class="text-center mt-8">
            <button class="bg-white border-2 border-[#56c270] text-[#56c270] font-heading font-bold px-8 py-3 rounded hover:bg-[#56c270] hover:text-white transition-colors">
              Load More Documents
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="bg-[#042e0d] py-10">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-extrabold text-2xl text-white">Need a specific document?</h3>
              <p class="text-white/70 mt-1">Contact us and we'll send it to you.</p>
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

export const head: DocumentHead = ({ params }) => {
  const categoryName = params.category
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${categoryName} Documents | Solamp Solar & Energy Storage`,
    meta: [
      {
        name: 'description',
        content: `Download ${categoryName.toLowerCase()} datasheets, manuals, and technical documentation from Solamp.`,
      },
    ],
  };
};
