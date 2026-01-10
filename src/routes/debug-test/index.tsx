import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

/**
 * MINIMAL DEBUG PAGE
 * Purpose: Isolate the white box rendering issue
 *
 * This page tests various theories:
 * 1. Is it specific elements (p, span, div)?
 * 2. Is it Tailwind opacity syntax (text-white/80)?
 * 3. Is it font-related?
 * 4. Is it backdrop-blur related?
 * 5. Is it Qwik-specific?
 */

export default component$(() => {
  return (
    <div>
      {/* Test Section 1: Basic background - NO Tailwind color opacity */}
      <section class="bg-solamp-forest p-8">
        <h2 class="text-2xl font-bold text-white mb-4">Test 1: Raw HTML colors (no Tailwind opacity)</h2>

        <div class="space-y-4">
          {/* Using inline style - complete bypass of Tailwind */}
          <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            P tag with inline style rgba(255,255,255,0.8)
          </p>

          {/* Using solid white */}
          <p style={{ color: 'white' }}>
            P tag with inline style: solid white
          </p>

          {/* Div instead of p */}
          <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            DIV tag with inline style rgba(255,255,255,0.8)
          </div>

          {/* Span instead of p */}
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>
            SPAN tag with inline style rgba(255,255,255,0.8)
          </span>
        </div>
      </section>

      {/* Test Section 2: Tailwind opacity syntax */}
      <section class="bg-solamp-forest p-8 mt-4">
        <h2 class="text-2xl font-bold text-white mb-4">Test 2: Tailwind text-white/80 syntax</h2>

        <div class="space-y-4">
          <h1 class="text-white/80 text-xl">H1 with text-white/80</h1>
          <h2 class="text-white/80 text-xl">H2 with text-white/80</h2>
          <h3 class="text-white/80 text-xl">H3 with text-white/80</h3>
          <p class="text-white/80 text-lg">P with text-white/80 - IS THIS A WHITE BOX?</p>
          <div class="text-white/80 text-lg">DIV with text-white/80</div>
          <span class="text-white/80 text-lg block">SPAN with text-white/80</span>
        </div>
      </section>

      {/* Test Section 3: backdrop-blur parent */}
      <section class="bg-solamp-forest p-8 mt-4">
        <h2 class="text-2xl font-bold text-white mb-4">Test 3: backdrop-blur context</h2>

        <div class="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6">
          <p class="text-white/80">P inside backdrop-blur container - IS THIS A WHITE BOX?</p>
          <p class="text-white">P inside backdrop-blur with solid white</p>
          <span class="text-white/80 block">SPAN inside backdrop-blur</span>
        </div>
      </section>

      {/* Test Section 4: Font testing */}
      <section class="bg-solamp-forest p-8 mt-4">
        <h2 class="text-2xl font-bold text-white mb-4">Test 4: Font family comparison</h2>

        <div class="space-y-4">
          <p class="text-white/80 font-heading">P with font-heading (Barlow) + text-white/80</p>
          <p class="text-white/80 font-body">P with font-body (Source Sans) + text-white/80</p>
          <p class="text-white/80" style={{ fontFamily: 'Arial, sans-serif' }}>P with Arial fallback + text-white/80</p>
          <p class="text-white/80" style={{ fontFamily: 'system-ui' }}>P with system-ui + text-white/80</p>
        </div>
      </section>

      {/* Test Section 5: Exact reproduction from index.tsx */}
      <section class="bg-solamp-forest p-8 mt-4">
        <h2 class="text-2xl font-bold text-white mb-4">Test 5: Exact reproduction from homepage</h2>

        <div class="lg:col-span-3">
          <h1 class="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            Solar &amp; Energy Storage Components You Can Count On
          </h1>
          <p class="text-white/80 text-lg mb-6 max-w-2xl">
            From barn installations to off-grid cabins, we supply first-class components that power real projects.
            Technical guidance from engineers who've been there.
          </p>
        </div>
      </section>

      {/* Test Section 6: No classes at all */}
      <section style={{ backgroundColor: '#042e0d', padding: '2rem', marginTop: '1rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>Test 6: Zero CSS classes</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem' }}>
          P with absolutely no CSS classes - pure inline styles
        </p>
      </section>

      {/* Test Section 7: Check if it's text content related */}
      <section class="bg-solamp-forest p-8 mt-4">
        <h2 class="text-2xl font-bold text-white mb-4">Test 7: Content variations</h2>

        <div class="space-y-4">
          <p class="text-white/80">Short text</p>
          <p class="text-white/80">This is a longer paragraph with more content to see if text length matters for the white box issue.</p>
          <p class="text-white/80">Text with special chars: &amp; &lt; &gt; "quotes" 'apostrophes'</p>
          <p class="text-white/80">1 products available</p>
        </div>
      </section>

      {/* Reference: This should work */}
      <section class="bg-gray-100 p-8 mt-4">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Reference: Dark text on light bg (should work)</h2>
        <p class="text-gray-600">This paragraph should render correctly - dark text on light background.</p>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Debug Test - White Box Issue',
};
