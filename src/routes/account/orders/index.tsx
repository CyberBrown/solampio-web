import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const orders = [
  { id: 'ORD-2024-1234', date: '2024-12-15', status: 'Shipped', total: '$12,450.00', items: 3, tracking: '1Z999AA10123456784' },
  { id: 'ORD-2024-1189', date: '2024-12-01', status: 'Delivered', total: '$8,200.00', items: 5, tracking: '1Z999AA10123456783' },
  { id: 'ORD-2024-1045', date: '2024-11-15', status: 'Delivered', total: '$15,600.00', items: 8, tracking: '1Z999AA10123456782' },
  { id: 'ORD-2024-0892', date: '2024-10-28', status: 'Delivered', total: '$6,350.00', items: 2, tracking: '1Z999AA10123456781' },
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
              <li class="text-white font-semibold">Orders</li>
            </ol>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Order History
          </h1>
        </div>
      </section>

      {/* Orders */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-4xl">
            {/* Filter */}
            <div class="flex gap-3 mb-6">
              <button class="px-4 py-2 bg-[#042e0d] text-white text-sm font-bold rounded">All Orders</button>
              <button class="px-4 py-2 bg-white border border-gray-200 text-[#042e0d] text-sm font-bold rounded hover:border-[#042e0d] transition-colors">In Progress</button>
              <button class="px-4 py-2 bg-white border border-gray-200 text-[#042e0d] text-sm font-bold rounded hover:border-[#042e0d] transition-colors">Delivered</button>
            </div>

            {/* Orders List */}
            <div class="space-y-4">
              {orders.map((order) => (
                <div key={order.id} class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <div>
                        <p class="font-heading font-bold text-[#042e0d]">{order.id}</p>
                        <p class="text-sm text-gray-500">{order.date} | {order.items} items</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class={`text-xs font-bold px-3 py-1 rounded ${
                        order.status === 'Shipped' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                        order.status === 'Delivered' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                        order.status === 'Processing' ? 'bg-[#c3a859]/10 text-[#c3a859]' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                      <p class="font-heading font-bold text-[#042e0d]">{order.total}</p>
                    </div>
                  </div>
                  <div class="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#f1f1f2]/50">
                    <div class="flex items-center gap-2 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                      </svg>
                      <span class="text-gray-500">Tracking:</span>
                      <span class="font-mono text-[#042e0d]">{order.tracking}</span>
                    </div>
                    <div class="flex gap-3">
                      <Link href={`/account/orders/${order.id}/`} class="text-[#5974c3] text-sm font-bold hover:underline">
                        View Details
                      </Link>
                      <button class="text-[#042e0d] text-sm font-bold hover:underline">
                        Reorder
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div class="text-center mt-8">
              <button class="bg-white border-2 border-[#042e0d] text-[#042e0d] font-heading font-bold px-8 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors">
                Load More Orders
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Order History | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'View your order history, track shipments, and reorder products.',
    },
  ],
};
