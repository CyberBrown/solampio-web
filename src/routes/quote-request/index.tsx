import { component$, useSignal, $ } from '@builder.io/qwik';
import type { DocumentHead } from '~/lib/qwik-city';
import { Link } from '~/lib/qwik-city';
import { submitQuoteRequest } from '~/lib/quotes';

export default component$(() => {
  const firstName = useSignal('');
  const lastName = useSignal('');
  const email = useSignal('');
  const phone = useSignal('');
  const companyName = useSignal('');
  const projectType = useSignal('');
  const systemSize = useSignal('');
  const projectLocation = useSignal('');
  const productList = useSignal('');
  const timeline = useSignal('');
  const notes = useSignal('');
  const honeypot = useSignal('');

  const formState = useSignal<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const quoteNumber = useSignal('');
  const errorMessage = useSignal('');

  const handleSubmit = $(async () => {
    formState.value = 'submitting';
    errorMessage.value = '';

    const result = await submitQuoteRequest({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      companyName: companyName.value || undefined,
      projectType: projectType.value || undefined,
      systemSize: systemSize.value || undefined,
      projectLocation: projectLocation.value || undefined,
      productList: productList.value || undefined,
      timeline: timeline.value || undefined,
      notes: notes.value || undefined,
      honeypot: honeypot.value || undefined,
    });

    if (result.success) {
      quoteNumber.value = result.quoteNumber || '';
      formState.value = 'success';
    } else {
      errorMessage.value = result.error || 'Something went wrong.';
      formState.value = 'error';
    }
  });

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

      {/* Content */}
      <section class="py-8">
        <div class="container mx-auto px-4">
          <div class="max-w-2xl mx-auto">
            {formState.value === 'success' ? (
              <div class="bg-white rounded-lg border border-green-200 p-8 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 class="font-heading font-bold text-xl text-[#042e0d] mb-2">Quote Request Submitted</h2>
                <p class="text-gray-600 mb-4">
                  Your quote number is <span class="font-bold text-[#042e0d]">{quoteNumber.value}</span>
                </p>
                <p class="text-gray-500 text-sm">
                  We'll review your request and get back to you within 24 hours.
                </p>
                <Link
                  href="/"
                  class="inline-block mt-6 bg-[#56c270] text-[#042e0d] font-heading font-bold px-6 py-3 rounded hover:bg-[#042e0d] hover:text-white transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <div class="bg-white rounded-lg border border-gray-200 p-8">
                <form preventdefault:submit onSubmit$={handleSubmit}>
                  {/* Honeypot - hidden from real users */}
                  <div class="hidden" aria-hidden="true">
                    <label>
                      Leave this empty
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        bind:value={honeypot}
                      />
                    </label>
                  </div>

                  {/* Error Message */}
                  {formState.value === 'error' && errorMessage.value && (
                    <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                      {errorMessage.value}
                    </div>
                  )}

                  {/* Contact Info */}
                  <div class="mb-8">
                    <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Contact Information</h2>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">First Name *</label>
                        <input
                          type="text"
                          name="first_name"
                          required
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={firstName}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Last Name *</label>
                        <input
                          type="text"
                          name="last_name"
                          required
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={lastName}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={email}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={phone}
                        />
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Company Name</label>
                        <input
                          type="text"
                          name="company_name"
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={companyName}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div class="mb-8">
                    <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Project Details</h2>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Project Type</label>
                        <select
                          name="project_type"
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          bind:value={projectType}
                        >
                          <option value="">Select project type</option>
                          <option value="Residential - Grid-Tied">Residential - Grid-Tied</option>
                          <option value="Residential - Off-Grid">Residential - Off-Grid</option>
                          <option value="Residential - Hybrid/Battery Backup">Residential - Hybrid/Battery Backup</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">System Size (kW)</label>
                        <input
                          type="text"
                          name="system_size"
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          placeholder="e.g., 10 kW"
                          bind:value={systemSize}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-bold text-[#042e0d] mb-2">Project Location</label>
                        <input
                          type="text"
                          name="project_location"
                          class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                          placeholder="City, State or Zip Code"
                          bind:value={projectLocation}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div class="mb-8">
                    <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Products Needed</h2>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">Bill of Materials / Product List</label>
                      <textarea
                        name="product_list"
                        rows={6}
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                        placeholder="List the products you need with quantities, or describe your project requirements."
                        bind:value={productList}
                      ></textarea>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div class="mb-8">
                    <h2 class="font-heading font-bold text-lg text-[#042e0d] mb-4">Timeline</h2>
                    <div>
                      <label class="block text-sm font-bold text-[#042e0d] mb-2">When do you need these products?</label>
                      <select
                        name="timeline"
                        class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                        bind:value={timeline}
                      >
                        <option value="">Select timeline</option>
                        <option value="ASAP">ASAP</option>
                        <option value="Within 1 week">Within 1 week</option>
                        <option value="Within 2 weeks">Within 2 weeks</option>
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="Just planning / no rush">Just planning / no rush</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div class="mb-8">
                    <label class="block text-sm font-bold text-[#042e0d] mb-2">Additional Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                      placeholder="Any other information that would help us prepare your quote..."
                      bind:value={notes}
                    ></textarea>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formState.value === 'submitting'}
                    class="w-full bg-[#56c270] text-[#042e0d] font-heading font-bold py-4 rounded hover:bg-[#042e0d] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formState.value === 'submitting' ? (
                      <>
                        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Quote Request'
                    )}
                  </button>

                  <p class="text-center text-sm text-gray-500 mt-4">
                    We typically respond within 24 hours
                  </p>
                </form>
              </div>
            )}

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
