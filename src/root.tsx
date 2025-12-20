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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="en" data-theme="solamp" class="font-body">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
