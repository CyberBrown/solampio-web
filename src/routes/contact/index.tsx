import { component$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const formData = useSignal({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  return (
    <div class="bg-base-200 min-h-screen">
      {/* Hero */}
      <div class="hero bg-gradient-to-r from-primary to-accent text-white py-16">
        <div class="hero-content text-center">
          <div class="max-w-2xl">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p class="text-lg opacity-90">
              Have questions? We'd love to hear from you. Our team is here to help.
            </p>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <div class="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div class="lg:col-span-2">
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h2 class="card-title text-2xl mb-6">Send us a message</h2>
                <form class="space-y-4">
                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Full Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        class="input input-bordered"
                        bind:value={formData.value.name}
                        required
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Email *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        class="input input-bordered"
                        bind:value={formData.value.email}
                        required
                      />
                    </div>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Company</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Your company name"
                        class="input input-bordered"
                        bind:value={formData.value.company}
                      />
                    </div>
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text font-medium">Subject *</span>
                      </label>
                      <select class="select select-bordered" required>
                        <option disabled selected>Select a topic</option>
                        <option>Sales Inquiry</option>
                        <option>Technical Support</option>
                        <option>Partnership</option>
                        <option>General Question</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text font-medium">Message *</span>
                    </label>
                    <textarea
                      placeholder="How can we help you?"
                      class="textarea textarea-bordered h-32"
                      bind:value={formData.value.message}
                      required
                    ></textarea>
                  </div>

                  <div class="form-control">
                    <label class="cursor-pointer label justify-start gap-3">
                      <input type="checkbox" class="checkbox checkbox-primary" />
                      <span class="label-text">I agree to receive communications from SolampIO</span>
                    </label>
                  </div>

                  <button type="submit" class="btn btn-primary btn-block">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div class="space-y-6">
            {/* Quick Contact */}
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="font-bold text-lg mb-4">Quick Contact</h3>
                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p class="font-medium">Email</p>
                      <a href="mailto:hello@solampio.com" class="text-primary hover:underline">hello@solampio.com</a>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p class="font-medium">Phone</p>
                      <a href="tel:+1-800-SOLAMPIO" class="text-primary hover:underline">+1-800-SOLAMPIO</a>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p class="font-medium">Address</p>
                      <p class="text-base-content/70">
                        123 Solar Way<br />
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div class="card bg-base-100 shadow-xl">
              <div class="card-body">
                <h3 class="font-bold text-lg mb-4">Office Hours</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-base-content/70">Monday - Friday</span>
                    <span class="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-base-content/70">Saturday</span>
                    <span class="font-medium">10:00 AM - 2:00 PM PST</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-base-content/70">Sunday</span>
                    <span class="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div class="card bg-secondary text-secondary-content">
              <div class="card-body">
                <h3 class="font-bold text-lg">Need Technical Support?</h3>
                <p class="text-sm opacity-90">
                  Our dedicated support team is available 24/7 for customers.
                </p>
                <button class="btn btn-accent btn-sm mt-2">
                  Open Support Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div class="bg-base-100 py-12">
        <div class="container mx-auto px-4">
          <h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div class="max-w-3xl mx-auto">
            <div class="join join-vertical w-full">
              <div class="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="faq-accordion" checked={true} />
                <div class="collapse-title font-medium">
                  How quickly can I get started with SolampIO?
                </div>
                <div class="collapse-content text-base-content/70">
                  <p>Most customers are up and running within 24-48 hours. Our team will guide you through the onboarding process and help configure your account.</p>
                </div>
              </div>
              <div class="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="faq-accordion" />
                <div class="collapse-title font-medium">
                  Do you offer a free trial?
                </div>
                <div class="collapse-content text-base-content/70">
                  <p>Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.</p>
                </div>
              </div>
              <div class="collapse collapse-arrow join-item border border-base-300">
                <input type="radio" name="faq-accordion" />
                <div class="collapse-title font-medium">
                  What integrations do you support?
                </div>
                <div class="collapse-content text-base-content/70">
                  <p>We integrate with all major inverter manufacturers, weather services, CRM systems, and accounting software. Check our documentation for a full list.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Contact Us - SolampIO',
  meta: [
    {
      name: 'description',
      content: 'Get in touch with the SolampIO team. We\'re here to help with your solar business needs.',
    },
  ],
};
