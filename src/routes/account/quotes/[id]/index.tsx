import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

const quoteItems = [
  { name: 'Sol-Ark 15K-2P Hybrid Inverter', sku: 'SA-15K-2P', quantity: 2, unitPrice: '$5,200.00', total: '$10,400.00' },
  { name: 'Fortress Power eFlex 5.4', sku: 'FP-EFLEX-54', quantity: 4, unitPrice: '$1,800.00', total: '$7,200.00' },
  { name: 'MidNite Classic 150', sku: 'MN-CL150', quantity: 2, unitPrice: '$650.00', total: '$1,300.00' },
];

export default component$(() => {
  const loc = useLocation();
  const quoteId = loc.params.id;

  return (
    <div class="bg-[#f1f1f2] min-h-screen">
      {/* Header */}
      <section class="bg-[#042e0d] py-8">
        <div class="container mx-auto px-4">
          <nav class="mb-4">
            <ol class="flex items-center gap-2 text-sm flex-wrap">
              <li><Link href="/" class="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/account/" class="text-white/50 hover:text-white transition-colors">Account</Link></li>
              <li class="text-white/30">/</li>
              <li><Link href="/account/quotes/" class="text-white/50 hover:text-white transition-colors">Quotes</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{quoteId}</li>
            </ol>
          </nav>
          <div class="flex items-center gap-4">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Quote {quoteId}
            </h1>
            <span class="text-xs font-bold px-3 py-1 rounded bg-[#5974c3]/20 text-white">
              Quoted
            </span>
          </div>
        </div>
      </section>

      {/* Quote Content */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div class="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              <div class="bg-[#5974c3]/10 border border-[#5974c3] rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="font-bold text-[#042e0d]">Quote Ready</p>
                    <p class="text-sm text-gray-600">Valid until December 24, 2024</p>
                  </div>
                </div>
                <button class="bg-[#56c270] text-[#042e0d] font-bold px-4 py-2 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                  Accept Quote
                </button>
              </div>

              {/* Items */}
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d]">Quoted Items</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-[#f1f1f2]">
                      <tr>
                        <th class="px-4 py-3 text-left font-bold text-[#042e0d]">Product</th>
                        <th class="px-4 py-3 text-center font-bold text-[#042e0d]">Qty</th>
                        <th class="px-4 py-3 text-right font-bold text-[#042e0d]">Unit Price</th>
                        <th class="px-4 py-3 text-right font-bold text-[#042e0d]">Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      {quoteItems.map((item) => (
                        <tr key={item.sku}>
                          <td class="px-4 py-4">
                            <p class="font-medium text-[#042e0d]">{item.name}</p>
                            <p class="text-xs text-gray-500">SKU: {item.sku}</p>
                          </td>
                          <td class="px-4 py-4 text-center">{item.quantity}</td>
                          <td class="px-4 py-4 text-right">{item.unitPrice}</td>
                          <td class="px-4 py-4 text-right font-bold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div class="bg-white rounded-lg border border-gray-200 p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-3">Notes from Sales Team</h3>
                <p class="text-gray-600 text-sm">
                  Thank you for your quote request. We've applied volume pricing for the Sol-Ark inverters.
                  Shipping is estimated at $450 for ground freight to your location. Lead time is 3-5 business days
                  for all items. Please let us know if you have any questions.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div class="lg:col-span-1 space-y-6">
              {/* Summary */}
              <div class="bg-white rounded-lg border border-gray-200 p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-4">Quote Summary</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Subtotal</span>
                    <span>$18,900.00</span>
                  </div>
                  <div class="flex justify-between text-[#56c270]">
                    <span>Volume Discount</span>
                    <span>-$900.00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Est. Shipping</span>
                    <span>$450.00</span>
                  </div>
                  <div class="flex justify-between font-heading font-bold text-lg text-[#042e0d] pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>$18,450.00</span>
                  </div>
                </div>
                <button class="w-full mt-4 bg-[#56c270] text-[#042e0d] font-heading font-bold py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                  Accept & Checkout
                </button>
              </div>

              {/* Quote Details */}
              <div class="bg-white rounded-lg border border-gray-200 p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-4">Quote Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Quote #</span>
                    <span class="font-medium">{quoteId}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Created</span>
                    <span>December 10, 2024</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Valid Until</span>
                    <span>December 24, 2024</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Sales Rep</span>
                    <span>Mike Johnson</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div class="space-y-3">
                <button class="w-full bg-white border border-gray-200 text-[#042e0d] font-heading font-bold py-3 rounded hover:border-[#042e0d] transition-colors">
                  Download PDF
                </button>
                <button class="w-full bg-white border border-gray-200 text-[#042e0d] font-heading font-bold py-3 rounded hover:border-[#042e0d] transition-colors">
                  Request Changes
                </button>
              </div>

              {/* Help */}
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-2">Questions about this quote?</p>
                <a href="tel:978-451-6890" class="text-[#5974c3] font-bold hover:underline">
                  Call 978-451-6890
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => ({
  title: `Quote ${params.id} | Solamp Solar & Energy Storage`,
  meta: [
    {
      name: 'description',
      content: `View details for quote ${params.id}.`,
    },
  ],
});
