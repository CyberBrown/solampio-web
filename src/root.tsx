import { component$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
          onLoad$={(e) => { (e.target as HTMLLinkElement).media = 'all'; }}
        />
        {/* Fallback for no-JS */}
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
        </noscript>
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en" data-theme="solamp" class="font-body">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
