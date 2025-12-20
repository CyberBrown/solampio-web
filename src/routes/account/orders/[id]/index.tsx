import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useLocation, Link } from '@builder.io/qwik-city';

const orderItems = [
  { name: 'Sol-Ark 15K-2P Hybrid Inverter', sku: 'SA-15K-2P', quantity: 1, price: '$5,200.00' },
  { name: 'Fortress Power eFlex 5.4', sku: 'FP-EFLEX-54', quantity: 2, price: '$3,600.00' },
  { name: 'MidNite Classic 150', sku: 'MN-CL150', quantity: 1, price: '$650.00' },
];

const trackingEvents = [
  { date: '2024-12-17 14:30', status: 'Out for Delivery', location: 'Boston, MA' },
  { date: '2024-12-17 06:00', status: 'Arrived at Local Facility', location: 'Boston, MA' },
  { date: '2024-12-16 18:45', status: 'In Transit', location: 'Newark, NJ' },
  { date: '2024-12-15 12:00', status: 'Shipped', location: 'Warehouse' },
  { date: '2024-12-15 09:30', status: 'Order Processed', location: '' },
];

export default component$(() => {
  const loc = useLocation();
  const orderId = loc.params.id;

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
              <li><Link href="/account/orders/" class="text-white/50 hover:text-white transition-colors">Orders</Link></li>
              <li class="text-white/30">/</li>
              <li class="text-white font-semibold">{orderId}</li>
            </ol>
          </nav>
          <div class="flex items-center gap-4">
            <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
              Order {orderId}
            </h1>
            <span class="text-xs font-bold px-3 py-1 rounded bg-[#5974c3]/20 text-white">
              Shipped
            </span>
          </div>
        </div>
      </section>

      {/* Order Content */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div class="lg:col-span-2 space-y-6">
              {/* Tracking */}
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d]">Tracking</h2>
                </div>
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                    </svg>
                    <span class="font-mono text-[#042e0d]">1Z999AA10123456784</span>
                    <span class="text-sm text-gray-500">via UPS</span>
                  </div>
                  <div class="space-y-4">
                    {trackingEvents.map((event, i) => (
                      <div key={i} class="flex gap-4">
                        <div class="flex flex-col items-center">
                          <div class={`w-3 h-3 rounded-full ${i === 0 ? 'bg-[#56c270]' : 'bg-gray-300'}`}></div>
                          {i < trackingEvents.length - 1 && <div class="w-0.5 h-full bg-gray-200 mt-1"></div>}
                        </div>
                        <div class="pb-4">
                          <p class="font-bold text-[#042e0d]">{event.status}</p>
                          <p class="text-sm text-gray-500">{event.date}</p>
                          {event.location && <p class="text-sm text-gray-400">{event.location}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d]">Items</h2>
                </div>
                <div class="divide-y divide-gray-100">
                  {orderItems.map((item) => (
                    <div key={item.sku} class="p-4 flex gap-4">
                      <div class="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="font-bold text-[#042e0d]">{item.name}</p>
                        <p class="text-sm text-gray-500">SKU: {item.sku}</p>
                        <p class="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p class="font-bold text-[#042e0d]">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div class="lg:col-span-1 space-y-6">
              {/* Summary */}
              <div class="bg-white rounded-lg border border-gray-200 p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-4">Order Summary</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Subtotal</span>
                    <span>$11,850.00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Shipping</span>
                    <span>$600.00</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div class="flex justify-between font-heading font-bold text-lg text-[#042e0d] pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>$12,450.00</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div class="bg-white rounded-lg border border-gray-200 p-5">
                <h3 class="font-heading font-bold text-[#042e0d] mb-4">Shipping Address</h3>
                <p class="text-sm text-gray-600">
                  John Smith<br />
                  Solar Company LLC<br />
                  123 Main Street<br />
                  Boston, MA 02101
                </p>
              </div>

              {/* Actions */}
              <div class="space-y-3">
                <button class="w-full bg-[#042e0d] text-white font-heading font-bold py-3 rounded hover:bg-[#042e0d]/80 transition-colors">
                  Reorder
                </button>
                <button class="w-full bg-white border border-gray-200 text-[#042e0d] font-heading font-bold py-3 rounded hover:border-[#042e0d] transition-colors">
                  Download Invoice
                </button>
              </div>

              {/* Help */}
              <div class="text-center">
                <p class="text-sm text-gray-500 mb-2">Need help with this order?</p>
                <a href="tel:978-451-6890" class="text-[#5974c3] font-bold hover:underline">
                  Contact Support
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
  title: `Order ${params.id} | Solamp Solar & Energy Storage`,
  meta: [
    {
      name: 'description',
      content: `View details and tracking for order ${params.id}.`,
    },
  ],
});
