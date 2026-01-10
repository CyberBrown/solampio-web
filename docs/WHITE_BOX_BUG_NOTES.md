# Solampio White Box CSS Bug - Investigation Notes

**Last Updated:** January 10, 2026

## Problem Description
White rectangular boxes appear where text with opacity classes should render (e.g., `text-white/80`, `text-white/70`). The issue:
- Happens across Chrome, Firefox, Brave (incognito and normal)
- Has occurred "every other day for weeks"
- Text content IS in the HTML, CSS classes ARE correct
- Only affects elements with semi-transparent white text

## Affected Elements
- Hero description paragraph (`text-white-80`)
- Contact card "Call a Solar Expert" label (`text-white-60`)
- Contact card description paragraph (`text-white-70`)
- Contact card hours text (`text-white-50`)

## What WORKS
- `text-white` (solid white, no opacity) - renders correctly
- Buttons, headings, phone numbers - all fine

## Test Results (Jan 9, 2026)

### Test 1: Remove DaisyUI entirely
URL: https://no-daisyui-test.solampio-web.pages.dev
Result: **LOOKS BAD** - issue persists

### Test 2: DaisyUI + added base-content variable
URL: https://base-content-test.solampio-web.pages.dev
Result: **LOOKS BAD** - issue persists

### Test 3: Aggressive CSS override
URL: https://aggressive-fix-test.solampio-web.pages.dev
Added to global.css:
```css
.text-white-80,
.text-white-70,
.text-white-60,
.text-white-50 {
  background: transparent !important;
  background-color: transparent !important;
  position: relative !important;
  z-index: 1 !important;
}
```
Result: **ALSO BAD BUT BETTER A BIT** - partial improvement

### Test 4: Inline styles (bypassing CSS entirely)
URL: https://inline-styles-test.solampio-web.pages.dev
Used JSX inline styles: `style={{ color: 'rgba(255, 255, 255, 0.8)' }}`
Result: **DID NOT WORK** - white boxes still appear

### Test 5: Solid white (no transparency at all)
URL: https://solid-white-test.solampio-web.pages.dev
Changed all affected elements to use `text-white` class (solid white, no alpha)
Result: **DID NOT WORK** - white boxes STILL appear

**CRITICAL FINDING:**
- Issue is NOT CSS-related (inline styles don't fix it)
- Issue is NOT about transparency/alpha values (solid white doesn't fix it)
- Issue is specific to CERTAIN ELEMENTS, not the color styling
- The same `text-white` class works on h1 heading but NOT on these p elements
- Must be something about the element structure or Qwik rendering

**WORKING vs BROKEN examples (same class!):**
```html
<!-- WORKS: h1 with text-white -->
<h1 class="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">Solar Power Systems</h1>

<!-- BROKEN: p with text-white - shows white box -->
<p class="text-white/80 text-lg mb-6 max-w-2xl">From barn installations...</p>
```

The difference is `<h1>` vs `<p>` tag - investigate if there's something targeting p elements specifically.

**SIBLING TEST - Same parent, different results:**
```jsx
// In hero section, these are SIBLINGS with the SAME parent div:
<h1 class="... text-white ...">Works fine</h1>
<p class="text-white/80 text-lg mb-6 max-w-2xl">Shows white box</p>
```
- Same container
- h1 renders correctly
- p shows white box
- NOT a parent/backdrop-blur issue for hero paragraph

**More broken examples - ALL are `<p>` tags:**
```html
<!-- Category page - also broken -->
<p class="text-white/80">Browse our selection of solar power systems from trusted manufacturers. 1 products available.</p>
```

Pattern: ALL broken elements are `<p>` tags with `text-white/XX` classes.

### Test 6: Change `<p>` to `<span class="block">`
URL: https://span-test.solampio-web.pages.dev
Changed problematic `<p>` tags to `<span class="block">` to test if element type matters.
Result: **DID NOT WORK** - white boxes still appear

### Test 7: Debug Test Page (Jan 10, 2026)
URL: https://solampio.com/debug-test/ (or preview deploy)
Created comprehensive test page to isolate specific cause:
- Test 1: Pure inline styles (no Tailwind at all)
- Test 2: Tailwind opacity syntax on different element types (h1, h2, h3, p, div, span)
- Test 3: Elements inside backdrop-blur container
- Test 4: Different font families
- Test 5: Exact reproduction of homepage hero
- Test 6: Zero CSS classes (100% inline styles)
- Test 7: Content length variations

**ACTION NEEDED:** Check this page in browser to see which specific tests fail.

**CSS Search Result:** No CSS rules found targeting `<p>` elements with background colors.
The white boxes are NOT coming from the stylesheet - must be:
1. Browser rendering bug
2. Qwik hydration issue
3. JavaScript adding elements
4. Browser extension interference

## Key Findings
1. Issue is NOT purely DaisyUI (persists without it)
2. Background transparency + z-index helps slightly
3. Custom rgba classes compile correctly in CSS
4. HTML output is correct
5. Both Tailwind slash-syntax (`text-white/80`) and custom classes (`text-white-80`) affected

## Stack
- Tailwind CSS 3.4.19
- DaisyUI 4.12.24
- Qwik framework with SSR
- Cloudflare Pages deployment

## Screenshot
See: `/home/chris/projects/solampio-web/tmp/Screenshot 2026-01-09 224606.png`

## Next Steps to Try

### IMMEDIATE: Check Debug Test Page
Visit `/debug-test/` and note which sections show white boxes:
1. If ALL tests show white boxes → Issue is environmental/deployment-related
2. If only specific tests fail → Issue is related to that specific pattern
3. If backdrop-blur tests fail but others don't → backdrop-blur is the culprit
4. If font-specific tests vary → Font loading is involved

### Browser Dev Tools Investigation
When white boxes appear, use dev tools to:
1. Right-click the white box → Inspect → What element is selected?
2. Check the computed styles → Is there a background-color being applied?
3. Check the Layers panel (Chrome DevTools) → Are there compositing layers?
4. Look for any ::before or ::after pseudo-elements
5. Check if there's a stacking context issue (z-index)

### Clear Cache Tests
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache completely
3. Test in a fresh private/incognito window
4. Unregister service worker (DevTools → Application → Service Workers)

### Possible Causes (Ranked by Likelihood)
1. **Service Worker caching old CSS** - The site has ServiceWorkerRegister
2. **Cloudflare edge caching** - Assets cached at max-age=1year
3. **Qwik resumability/hydration** - Something with SSR→client transition
4. **GPU compositing layer bug** - backdrop-blur creates compositing layers
5. **Font rendering fallback** - Font fails, placeholder boxes shown

## Files Modified During Investigation
- `src/global.css` - Added custom text-white-* classes with !important
- `src/routes/index.tsx` - Changed text-white/80 to text-white-80
- `tailwind.config.js` - Tested with/without DaisyUI
- `src/root.tsx` - Tested with/without data-theme attribute
