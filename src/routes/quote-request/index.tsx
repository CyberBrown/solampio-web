import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';

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
              <li class="text-white font-semibold">Request Quote</li>
            </ol>
          </nav>
          <h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white">
            Request a Quote
          </h1>
          <p class="text-white/70 mt-2">Get custom pricing for your project</p>
        </div>
      </section>

      {/* Form */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg border border-gray-200 p-8">
              <form>
                {/* Contact Info */}
                <div class="mb-8">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Contact Information</h2>
                  <div class="grid md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">First Name *</label>
                      <input type="text" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Last Name *</label>
                      <input type="text" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Email *</label>
                      <input type="email" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Phone *</label>
                      <input type="tel" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" />
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Company Name</label>
                      <input type="text" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div class="mb-8">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Project Details</h2>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Project Type</label>
                      <select class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]">
                        <option>Select project type</option>
                        <option>Residential - Grid-Tied</option>
                        <option>Residential - Off-Grid</option>
                        <option>Residential - Hybrid/Battery Backup</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">System Size (kW)</label>
                      <input type="text" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" placeholder="e.g., 10 kW" />
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Project Location</label>
                      <input type="text" class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]" placeholder="City, State or Zip Code" />
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div class="mb-8">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Products Needed</h2>
                  <div>
                    <label class="block text-sm font-bold text-[#042e0d] mb-2">Bill of Materials / Product List</label>
                    <textarea
                      rows={6}
                      class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      placeholder="List the products you need with quantities, or describe your project requirements. You can also upload a BOM below."
                    ></textarea>
                  </div>
                  <div class="mt-4">
                    <label class="block text-sm font-bold text-[#042e0d] mb-2">Upload BOM (Optional)</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#042e0d] transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="text-gray-500 text-sm">Drop files here or click to upload</p>
                      <p class="text-gray-400 text-xs mt-1">PDF, Excel, CSV (max 10MB)</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div class="mb-8">
                  <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Timeline</h2>
                  <div>
                    <label class="block text-sm font-bold text-[#042e0d] mb-2">When do you need these products?</label>
                    <select class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]">
                      <option>Select timeline</option>
                      <option>ASAP</option>
                      <option>Within 1 week</option>
                      <option>Within 2 weeks</option>
                      <option>Within 1 month</option>
                      <option>1-3 months</option>
                      <option>Just planning / no rush</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div class="mb-8">
                  <label class="block text-sm font-bold text-[#042e0d] mb-2">Additional Notes</label>
                  <textarea
                    rows={3}
                    class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                    placeholder="Any other information that would help us prepare your quote..."
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold py-4 rounded hover:bg-[#042e0d] hover:text-white transition-colors"
                >
                  Submit Quote Request
                </button>

                <p class="text-center text-sm text-gray-500 mt-4">
                  We typically respond within 24 hours
                </p>
              </form>
            </div>

            {/* Contact Alternative */}
            <div class="mt-8 text-center">
              <p class="text-gray-500 mb-3">Prefer to talk to someone?</p>
              <a href="tel:978-451-6890" class="inline-flex items-center gap-2 text-[#042e0d] font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call 978-451-6890
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Request Quote | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Request a custom quote for your solar project. Get competitive pricing on panels, inverters, batteries, and more.',
    },
  ],
};
