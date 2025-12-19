import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export const Header = component$(() => {
  return (
    <div class="drawer">
      <input id="mobile-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        {/* Navbar */}
        <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
          <div class="navbar-start">
            {/* Mobile hamburger */}
            <label for="mobile-drawer" class="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            {/* Logo */}
            <Link href="/" class="btn btn-ghost text-xl font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              SolampIO
            </Link>
          </div>
          {/* Desktop navigation */}
          <div class="navbar-center hidden lg:flex">
            <ul class="menu menu-horizontal px-1 gap-1">
              <li>
                <Link href="/products" class="font-medium hover:text-primary">Products</Link>
              </li>
              <li>
                <Link href="/learn" class="font-medium hover:text-primary">Learn</Link>
              </li>
              <li>
                <Link href="/docs" class="font-medium hover:text-primary">Docs</Link>
              </li>
              <li>
                <Link href="/about" class="font-medium hover:text-primary">About</Link>
              </li>
              <li>
                <Link href="/contact" class="font-medium hover:text-primary">Contact</Link>
              </li>
            </ul>
          </div>
          {/* Search and CTA */}
          <div class="navbar-end gap-2">
            <div class="form-control hidden md:block">
              <input type="text" placeholder="Search..." class="input input-bordered input-sm w-32 lg:w-48" />
            </div>
            <Link href="/contact" class="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile drawer sidebar */}
      <div class="drawer-side z-50">
        <label for="mobile-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <ul class="menu bg-base-100 min-h-full w-80 p-4">
          {/* Logo in drawer */}
          <li class="mb-4">
            <Link href="/" class="text-xl font-bold text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              SolampIO
            </Link>
          </li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/learn">Learn</Link></li>
          <li><Link href="/docs">Docs</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li class="mt-4">
            <div class="form-control">
              <input type="text" placeholder="Search..." class="input input-bordered w-full" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
});
