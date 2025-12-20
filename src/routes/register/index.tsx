import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="bg-[#f1f1f2] min-h-screen flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        {/* Logo */}
        <div class="text-center mb-8">
          <Link href="/" class="inline-block">
            <span class="font-heading font-extrabold text-2xl text-[#042e0d]">
              SOLAMP<span class="text-[#56c270]">IO</span>
            </span>
          </Link>
          <p class="text-gray-500 mt-2">Create your account</p>
        </div>

        {/* Register Form */}
        <div class="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
          <form>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-bold text-[#042e0d] mb-2">First Name</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                  placeholder="John"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-[#042e0d] mb-2">Last Name</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold text-[#042e0d] mb-2">Company Name</label>
              <input
                type="text"
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                placeholder="Solar Company LLC"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold text-[#042e0d] mb-2">Email Address</label>
              <input
                type="email"
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                placeholder="you@company.com"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold text-[#042e0d] mb-2">Phone Number</label>
              <input
                type="tel"
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                placeholder="(555) 123-4567"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-bold text-[#042e0d] mb-2">Password</label>
              <input
                type="password"
                class="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#042e0d]"
                placeholder="Create a password"
              />
            </div>
            <div class="mb-6">
              <label class="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" class="rounded border-gray-300 mt-1" />
                <span>I agree to the <Link href="/terms/" class="text-[#5974c3] hover:underline">Terms & Conditions</Link> and <Link href="/privacy/" class="text-[#5974c3] hover:underline">Privacy Policy</Link></span>
              </label>
            </div>
            <button
              type="submit"
              class="w-full bg-[#042e0d] text-white font-heading font-bold py-3 rounded hover:bg-[#042e0d]/80 transition-colors"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div class="grid grid-cols-2 gap-3">
            <button class="flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded hover:bg-gray-50 transition-colors">
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-sm font-medium text-gray-600">Google</span>
            </button>
            <button class="flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded hover:bg-gray-50 transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="text-sm font-medium text-gray-600">GitHub</span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p class="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/login/" class="text-[#5974c3] font-bold hover:underline">
            Sign in
          </Link>
        </p>

        {/* Back to Home */}
        <p class="text-center mt-4">
          <Link href="/" class="text-sm text-gray-500 hover:text-[#042e0d] transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Create Account | Solamp Solar & Energy Storage',
  meta: [
    {
      name: 'description',
      content: 'Create a Solamp account to manage orders, request quotes, and access exclusive pricing.',
    },
  ],
};
