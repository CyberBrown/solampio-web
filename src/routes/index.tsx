import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

const features = [
  {
    title: 'Real-Time Analytics',
    description: 'Monitor your solar installations with live data dashboards and instant alerts.',
    icon: '📊',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Leverage machine learning to optimize performance and predict maintenance needs.',
    icon: '🤖',
  },
  {
    title: 'Seamless Integration',
    description: 'Connect with all major inverters, weather services, and business tools.',
    icon: '🔗',
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance with SOC 2, GDPR, and ISO 27001.',
    icon: '🛡️',
  },
];

const testimonials = [
  {
    name: 'Michael Torres',
    company: 'SunRise Solar Co.',
    text: 'SolampIO transformed how we manage our installations. The analytics alone saved us 20% on maintenance costs.',
  },
  {
    name: 'Lisa Chen',
    company: 'GreenPower Solutions',
    text: 'The integration capabilities are unmatched. We connected our entire tech stack in days, not months.',
  },
  {
    name: 'James Wilson',
    company: 'Apex Energy Systems',
    text: 'Our team\'s productivity increased significantly after switching to SolampIO. Highly recommended.',
  },
];

export default component$(() => {
  return (
    <div>
      {/* Hero Section */}
      <div class="hero min-h-[80vh] bg-gradient-to-br from-secondary via-neutral to-secondary">
        <div class="hero-content text-center text-white py-20">
          <div class="max-w-4xl">
            <div class="badge badge-primary badge-lg mb-6">Now serving 5,000+ solar businesses</div>
            <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Power Your Solar Business with
              <span class="text-primary"> Intelligent Technology</span>
            </h1>
            <p class="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              SolampIO is the all-in-one B2B platform that helps solar companies monitor, analyze, and optimize their operations with cutting-edge tools.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <Link href="/contact" class="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/products" class="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-secondary">
                View Products
              </Link>
            </div>
            <p class="mt-6 text-sm opacity-70">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div class="bg-base-100 py-8 -mt-16 relative z-10">
        <div class="container mx-auto px-4">
          <div class="stats shadow-xl w-full bg-base-100">
            <div class="stat">
              <div class="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="stat-title">Installations</div>
              <div class="stat-value text-primary">250K+</div>
              <div class="stat-desc">Monitored worldwide</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="stat-title">Energy Tracked</div>
              <div class="stat-value text-secondary">50 GWh</div>
              <div class="stat-desc">Monthly production</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="stat-title">Uptime</div>
              <div class="stat-value text-accent">99.99%</div>
              <div class="stat-desc">Platform reliability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div class="bg-base-200 py-20">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <span class="badge badge-secondary mb-4">Features</span>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p class="text-base-content/70 max-w-2xl mx-auto">
              Built by solar industry veterans, SolampIO provides the tools you need to scale your business.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div class="card-body items-center text-center">
                  <span class="text-4xl mb-4">{feature.icon}</span>
                  <h3 class="card-title">{feature.title}</h3>
                  <p class="text-base-content/70 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div class="bg-base-100 py-20">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <span class="badge badge-primary mb-4">How It Works</span>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
          </div>
          <div class="flex flex-col lg:flex-row justify-center gap-8">
            <div class="flex flex-col items-center text-center max-w-xs">
              <div class="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 class="font-bold text-lg mb-2">Connect Your Systems</h3>
              <p class="text-base-content/70 text-sm">Integrate your inverters, meters, and existing tools in minutes.</p>
            </div>
            <div class="hidden lg:flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div class="flex flex-col items-center text-center max-w-xs">
              <div class="w-16 h-16 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 class="font-bold text-lg mb-2">Monitor & Analyze</h3>
              <p class="text-base-content/70 text-sm">Access real-time dashboards and AI-powered insights.</p>
            </div>
            <div class="hidden lg:flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-base-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div class="flex flex-col items-center text-center max-w-xs">
              <div class="w-16 h-16 rounded-full bg-accent text-accent-content flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 class="font-bold text-lg mb-2">Optimize & Grow</h3>
              <p class="text-base-content/70 text-sm">Improve efficiency, reduce costs, and scale your operations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div class="bg-base-200 py-20">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <span class="badge badge-accent mb-4">Testimonials</span>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Trusted by Solar Leaders</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} class="card bg-base-100 shadow-xl">
                <div class="card-body">
                  <div class="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p class="text-base-content/80 italic mb-4">"{testimonial.text}"</p>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-primary text-primary-content rounded-full w-10">
                        <span>{testimonial.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <p class="font-semibold">{testimonial.name}</p>
                      <p class="text-sm text-base-content/60">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div class="bg-gradient-to-r from-primary to-accent py-20">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Solar Business?
          </h2>
          <p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of solar professionals who trust SolampIO to power their operations.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <Link href="/contact" class="btn btn-secondary btn-lg">
              Start Free Trial
            </Link>
            <Link href="/learn" class="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
              Watch Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Partners/Integrations */}
      <div class="bg-base-100 py-12">
        <div class="container mx-auto px-4 text-center">
          <p class="text-base-content/60 mb-6">Integrates with your favorite tools</p>
          <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <span class="text-2xl font-bold text-base-content/40">SunPower</span>
            <span class="text-2xl font-bold text-base-content/40">Enphase</span>
            <span class="text-2xl font-bold text-base-content/40">SolarEdge</span>
            <span class="text-2xl font-bold text-base-content/40">Tesla</span>
            <span class="text-2xl font-bold text-base-content/40">Fronius</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'SolampIO - B2B Solar Industry Platform',
  meta: [
    {
      name: 'description',
      content: 'SolampIO is the leading B2B platform for the solar industry. Monitor, analyze, and optimize your solar operations with cutting-edge technology.',
    },
  ],
};
