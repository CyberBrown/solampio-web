import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

// Sample user data
const user = {
  name: 'John Smith',
  email: 'john@solarcompany.com',
  company: 'Solar Company LLC',
};

const recentOrders = [
  { id: 'ORD-2024-1234', date: '2024-12-15', status: 'Shipped', total: '$12,450.00', items: 3 },
  { id: 'ORD-2024-1189', date: '2024-12-01', status: 'Delivered', total: '$8,200.00', items: 5 },
];

const activeQuotes = [
  { id: 'QT-2024-0567', date: '2024-12-18', status: 'Pending', items: 8, expires: '2024-12-25' },
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
              <li class="text-white font-semibold">My Account</li>
            </ol>
          </nav>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
                Welcome, {user.name.split(' ')[0]}
              </h1>
              <p class="text-white/70 mt-1">{user.company}</p>
            </div>
            <button class="text-white/70 hover:text-white transition-colors text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <nav class="divide-y divide-gray-100">
                  <Link href="/account/" class="flex items-center gap-3 p-4 bg-[#042e0d] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span class="font-bold">Dashboard</span>
                  </Link>
                  <Link href="/account/orders/" class="flex items-center gap-3 p-4 hover:bg-[#f1f1f2] transition-colors text-[#042e0d]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="font-medium">Orders</span>
                  </Link>
                  <Link href="/account/quotes/" class="flex items-center gap-3 p-4 hover:bg-[#f1f1f2] transition-colors text-[#042e0d]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="font-medium">Quotes</span>
                  </Link>
                  <Link href="/account/saved-carts/" class="flex items-center gap-3 p-4 hover:bg-[#f1f1f2] transition-colors text-[#042e0d]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="font-medium">Saved Carts</span>
                  </Link>
                  <Link href="/account/profile/" class="flex items-center gap-3 p-4 hover:bg-[#f1f1f2] transition-colors text-[#042e0d]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="font-medium">Profile</span>
                  </Link>
                  <Link href="/account/settings/" class="flex items-center gap-3 p-4 hover:bg-[#f1f1f2] transition-colors text-[#042e0d]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-medium">Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div class="lg:col-span-3 space-y-6">
              {/* Quick Actions */}
              <div class="grid md:grid-cols-3 gap-4">
                <Link href="/cart/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                  <div class="w-10 h-10 bg-[#56c270]/10 rounded-lg flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#56c270]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">View Cart</h3>
                  <p class="text-sm text-gray-500 mt-1">3 items</p>
                </Link>
                <Link href="/products/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                  <div class="w-10 h-10 bg-[#5974c3]/10 rounded-lg flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#5974c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Browse Products</h3>
                  <p class="text-sm text-gray-500 mt-1">Shop catalog</p>
                </Link>
                <Link href="/contact/" class="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg hover:border-[#042e0d] transition-all group">
                  <div class="w-10 h-10 bg-[#c3a859]/10 rounded-lg flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#c3a859]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 class="font-heading font-bold text-[#042e0d] group-hover:text-[#5974c3] transition-colors">Get Support</h3>
                  <p class="text-sm text-gray-500 mt-1">Contact us</p>
                </Link>
              </div>

              {/* Recent Orders */}
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d]">Recent Orders</h2>
                  <Link href="/account/orders/" class="text-[#5974c3] text-sm font-bold hover:underline">View All</Link>
                </div>
                <div class="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/account/orders/${order.id}/`} class="flex items-center justify-between p-4 hover:bg-[#f1f1f2] transition-colors">
                      <div>
                        <p class="font-bold text-[#042e0d]">{order.id}</p>
                        <p class="text-sm text-gray-500">{order.date} | {order.items} items</p>
                      </div>
                      <div class="text-right">
                        <p class="font-bold text-[#042e0d]">{order.total}</p>
                        <span class={`text-xs font-bold px-2 py-0.5 rounded ${
                          order.status === 'Shipped' ? 'bg-[#5974c3]/10 text-[#5974c3]' :
                          order.status === 'Delivered' ? 'bg-[#56c270]/10 text-[#042e0d]' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Active Quotes */}
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="p-5 border-b border-gray-200 flex items-center justify-between">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d]">Active Quotes</h2>
                  <Link href="/account/quotes/" class="text-[#5974c3] text-sm font-bold hover:underline">View All</Link>
                </div>
                <div class="divide-y divide-gray-100">
                  {activeQuotes.map((quote) => (
                    <Link key={quote.id} href={`/account/quotes/${quote.id}/`} class="flex items-center justify-between p-4 hover:bg-[#f1f1f2] transition-colors">
                      <div>
                        <p class="font-bold text-[#042e0d]">{quote.id}</p>
                        <p class="text-sm text-gray-500">{quote.date} | {quote.items} items</p>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#c3a859]/10 text-[#c3a859]">
                          {quote.status}
                        </span>
                        <p class="text-xs text-gray-400 mt-1">Expires {quote.expires}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'My Account | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Manage your Solamp account, orders, quotes, and saved carts.',
    },
  ],
};
