import { component$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterOutlet,
} from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://imagedelivery.net" />
        {/* Preload mobile hero image for LCP - loads before CSS parsing */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-cabin-mobile.webp"
          type="image/webp"
        />
        {/* Preload critical font files to eliminate request chain */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/barlow/v13/7cHqv4kjgoGqM7E3p-ks51os.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/sourcesans3/v15/nwpBtKy2OAdR1K-IwhWudF-R9QMylBJAV3Bo8Ky46lEN_io6npfB.woff2"
          crossOrigin="anonymous"
        />
        {/* Load font CSS asynchronously */}
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
          media="print"
          onLoad$={(e) => {
            const link = e.target as HTMLLinkElement | null;
            if (link) link.media = 'all';
          }}
        />
        {/* Fallback for no-JS */}
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
        </noscript>
        <RouterHead />
        {/* ServiceWorkerRegister removed - it triggers 70+ q-data.json prefetches
            which devastates Lighthouse scores under throttled conditions */}
      </head>
      <body lang="en" data-theme="solamp" class="font-body">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
