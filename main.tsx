import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import './styles/dashboard.css';
import './styles/globals.css';
import './common/utils/setupCharts';
import type { Layout } from './common/layouts/layoutTypes';
import { NotFound } from './common/components/NotFound';
import { parseSearch, stringifySearch } from './common/utils/searchParams';
import { routeTree } from './routeTree.gen';

config.autoAddCss = false;

const router = createRouter({
  routeTree,
  // Every published URL has a trailing slash (S3 serves `<path>/index.html`); keep links that way.
  trailingSlash: 'always',
  parseSearch,
  stringifySearch,
  defaultNotFoundComponent: NotFound,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
  interface StaticDataRouteOption {
    layout?: Layout;
  }
}

// The build writes crawler-facing meta tags into each page's HTML; DynamicMetaTags owns them now.
document.querySelectorAll('[data-prerendered]').forEach((element) => element.remove());

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
