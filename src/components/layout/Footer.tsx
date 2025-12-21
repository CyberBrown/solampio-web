import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const Footer = component$(() => {
  return (
    <footer class="bg-[#042e0d] text-white">
      {/* Brand Partners */}
      <div class="border-b border-white/10">
        <div class="container mx-auto px-4 py-6">
          <p class="text-center text-xs text-[#c3a859] mb-4">Authorized Distributor for Leading Manufacturers</p>
          <div class="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">MidNite Solar</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Sol-Ark</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Fortress Power</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Tamarack</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">Morningstar</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">S-5!</span>
            <span class="font-heading text-sm text-white/60 hover:text-white transition-colors cursor-pointer">OutBack Power</span>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div class="container mx-auto px-4 py-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Products Column */}
          <div>
            <p class="text-xs font-mono text-[#c3a859] mb-3 uppercase tracking-wide">Products</p>
            <ul class="space-y-2 text-sm">
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Solar Panels</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Batteries &amp; Storage</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Inverters</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Charge Controllers</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Mounting &amp; Racking</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Balance of System</Link></li>
              <li><Link href="/products/" class="text-white/80 hover:text-[#56c270] transition-colors">Wind Turbines</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <p class="text-xs font-mono text-[#c3a859] mb-3 uppercase tracking-wide">Resources</p>
            <ul class="space-y-2 text-sm">
              <li><Link href="/learn/" class="text-white/80 hover:text-[#56c270] transition-colors">Guides &amp; Articles</Link></li>
              <li><Link href="/learn/courses/" class="text-white/80 hover:text-[#56c270] transition-colors">Training &amp; Education</Link></li>
              <li><Link href="/docs/" class="text-white/80 hover:text-[#56c270] transition-colors">Product Library</Link></li>
              <li><Link href="/learn/" class="text-white/80 hover:text-[#56c270] transition-colors">System Design Tools</Link></li>
              <li><a href="#" class="text-white/80 hover:text-[#56c270] transition-colors">Customer Reviews</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <p class="text-xs font-mono text-[#c3a859] mb-3 uppercase tracking-wide">Company</p>
            <ul class="space-y-2 text-sm">
              <li><Link href="/about/" class="text-white/80 hover:text-[#56c270] transition-colors">About Us</Link></li>
              <li><a href="#" class="text-white/80 hover:text-[#56c270] transition-colors">Portfolio</a></li>
              <li><a href="#" class="text-white/80 hover:text-[#56c270] transition-colors">Careers</a></li>
              <li><a href="#" class="text-white/80 hover:text-[#56c270] transition-colors">Sponsorships</a></li>
              <li><Link href="/contact/" class="text-white/80 hover:text-[#56c270] transition-colors">Contact Us</Link></li>
              <li><a href="#" class="text-white/80 hover:text-[#56c270] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <p class="text-xs font-mono text-[#c3a859] mb-3 uppercase tracking-wide">Contact</p>
            <div class="space-y-4 text-sm">
              <div>
                <p class="text-white/60 text-xs mb-0.5">Address</p>
                <p class="text-white/80">330 Codman Hill Road<br />Boxboro, MA 01719</p>
              </div>
              <div>
                <p class="text-white/60 text-xs mb-0.5">Phone</p>
                <a href="tel:978-451-6890" class="text-[#56c270] font-semibold hover:text-white transition-colors">978-451-6890</a>
              </div>
              <div>
                <p class="text-white/60 text-xs mb-0.5">Email</p>
                <a href="mailto:info@solampio.com" class="text-white/80 hover:text-[#56c270] transition-colors">info@solampio.com</a>
              </div>
              <div>
                <p class="text-white/60 text-xs mb-0.5">Hours</p>
                <p class="text-white/80">Mon-Fri 8am-5pm EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Blue */}
      <div class="bg-[#5974c3]">
        <div class="container mx-auto px-4 py-4">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo and Copyright */}
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span class="text-sm text-white/90">&copy; {new Date().getFullYear()} Solamp. All rights reserved.</span>
            </div>

            {/* Social Links */}
            <div class="flex items-center gap-4">
              <a href="#" class="text-white/70 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#" class="text-white/70 hover:text-white transition-colors" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
              <a href="#" class="text-white/70 hover:text-white transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" class="text-white/70 hover:text-white transition-colors" aria-label="Pinterest">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" class="text-white/70 hover:text-white transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Policy Links */}
            <div class="flex flex-wrap justify-center gap-4 text-xs text-white/80">
              <Link href="/terms/" class="hover:text-white transition-colors">Terms &amp; Conditions</Link>
              <Link href="/shipping/" class="hover:text-white transition-colors">Shipping Policy</Link>
              <Link href="/privacy/" class="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/returns/" class="hover:text-white transition-colors">Return Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
