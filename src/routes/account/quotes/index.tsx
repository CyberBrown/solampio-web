import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';

const quotes = [
  { id: 'QT-2024-0567', date: '2024-12-18', status: 'Pending', items: 8, total: 'Awaiting Quote', expires: '2024-12-25' },
  { id: 'QT-2024-0534', date: '2024-12-10', status: 'Quoted', items: 5, total: '$18,450.00', expires: '2024-12-24' },
  { id: 'QT-2024-0489', date: '2024-11-28', status: 'Accepted', items: 12, total: '$32,100.00', expires: null },
  { id: 'QT-2024-0412', date: '2024-11-15', status: 'Expired', items: 3, total: '$5,200.00', expires: null },
];

export default component$(() => {
  return (
    <div class="bg-[#f1f1f2] min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/account/" class="text-white/50 hover:text-white transition-colors">Account</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">Quotes</li>
            </ol>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Quote Requests
          </h1>
        </div>
      </section>

      {/* Quotes */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl">
            {/* Filter */}
            <div class="flex gap-3 mb-6">
              <button class="px-4 py-2 bg-[#042e0d] text-white text-sm font-bold rounded">All Quotes</button>
              <button class="px-4 py-2 bg-white border border-gray-200 text-[#042e0d] text-sm font-bold rounded hover:border-[#042e0d] transition-colors">Pending</button>
              <button class="px-4 py-2 bg-white border border-gray-200 text-[#042e0d] text-sm font-bold rounded hover:border-[#042e0d] transition-colors">Quoted</button>
              <button class="px-4 py-2 bg-white border border-gray-200 text-[#042e0d] text-sm font-bold rounded hover:border-[#042e0d] transition-colors">Accepted</button>
            </div>

            {/* Quotes List */}
            <div class="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p class="font-heading font-bold text-[#042e0d]">{quote.id}</p>
                      <p class="text-sm text-gray-500">{quote.date} | {quote.items} items</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class={`text-xs font-bold px-3 py-1 rounded ${
                        quote.status === 'Pending' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                        quote.status === 'Quoted' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                        quote.status === 'Accepted' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {quote.status}
                      </span>
                      <p class="font-heading font-bold text-[#042e0d]">{quote.total}</p>
                    </div>
                  </div>
                  <div class="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#f1f1f2]/50 border-t border-gray-100">
                    {quote.expires ? (
                      <p class="text-sm text-gray-500">Expires: {quote.expires}</p>
                    ) : (
                      <p class="text-sm text-gray-400">-</p>
                    )}
                    <div class="flex gap-3">
                      <Link href={`/account/quotes/${quote.id}/`} class="text-[#5974c3] text-sm font-bold hover:underline">
                        View Details
                      </Link>
                      {quote.status === 'Quoted' && (
                        <button class="text-[#56c270] text-sm font-bold hover:underline">
                          Accept Quote
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* New Quote CTA */}
            <div class="mt-8 text-center">
              <Link href="/quote-request/" class="inline-flex items-center gap-2 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Request New Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Quote Requests | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'View and manage your quote requests.',
    },
  ],
};
