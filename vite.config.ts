import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import { defineConfig, runnerImport } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import svgr from 'vite-plugin-svgr';
import type * as MetaTagsModule from './common/utils/metaTags.ts';
import type * as StaticRoutesModule from './common/constants/staticRoutes.ts';

const OUT_DIR = 'out';

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Writes `<path>/index.html` for every route, each carrying that page's title and social-card
 * tags. S3 serves these directly, so deep links load without a redirect and link previews
 * (which don't run JS) still see a page-specific card.
 */
const prerenderMetaTags = (): Plugin => ({
  name: 'tm-prerender-meta-tags',
  apply: 'build',
  async writeBundle() {
    // Loaded through Vite rather than imported, so app code stays out of this config's own graph.
    const inlineConfig = { configFile: false as const };
    const [{ module: metaTags }, { module: staticRoutes }] = await Promise.all([
      runnerImport<typeof MetaTagsModule>('./common/utils/metaTags.ts', inlineConfig),
      runnerImport<typeof StaticRoutesModule>('./common/constants/staticRoutes.ts', inlineConfig),
    ]);
    const { getMetaTagEntries, getMetaTags } = metaTags;
    const template = readFileSync(join(OUT_DIR, 'index.html'), 'utf8');
    const render = (pathname: string) => {
      const tags = getMetaTags(pathname);
      const head = [
        `<title data-prerendered>${escapeHtml(tags.title)}</title>`,
        ...getMetaTagEntries(tags).map(
          ([attribute, key, content]) =>
            `<meta data-prerendered ${attribute}="${key}" content="${escapeHtml(content)}" />`
        ),
      ].join('\n    ');
      return template.replace(/<title>.*<\/title>/, head);
    };

    for (const pathname of staticRoutes.STATIC_PATHS) {
      const file = join(OUT_DIR, pathname, 'index.html');
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, render(pathname));
    }
    const notFoundPage = render('/404/');
    writeFileSync(join(OUT_DIR, '404.html'), notFoundPage);
    mkdirSync(join(OUT_DIR, '404'), { recursive: true });
    writeFileSync(join(OUT_DIR, '404', 'index.html'), notFoundPage);
  },
});

export default defineConfig(() => {
  const apiProxy = process.env.TM_API_PROXY || 'http://127.0.0.1:5000';
  return {
    plugins: [
      tanstackRouter({
        target: 'react',
        routesDirectory: './routes',
        generatedRouteTree: './routeTree.gen.ts',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
      svgr(),
      prerenderMetaTags(),
    ],
    resolve: {
      alias: { '@': dirname(fileURLToPath(import.meta.url)) },
    },
    build: {
      outDir: OUT_DIR,
      rolldownOptions: {
        onLog(level, log, handler) {
          // lottie-web's expression engine uses eval; nothing we can change from here.
          if (log.code === 'EVAL' && log.id?.includes('lottie-web')) return;
          handler(level, log);
        },
      },
    },
    server: {
      // The Chalice dev server allows CORS from localhost:3000.
      port: 3000,
      // Proxies /api to the local Chalice backend on :5000 by default. To develop the frontend
      // against a real backend without running one locally, set TM_API_PROXY, e.g.
      //   TM_API_PROXY=https://dashboard-api.labs.transitmatters.org npm run start-react
      proxy: {
        '/api': { target: apiProxy, changeOrigin: true },
        // Dev only: in production CloudFront serves this path from the bus insights bucket.
        '/businsights/BusSpeedSegments': {
          target: 'https://dashboard-beta.labs.transitmatters.org',
          changeOrigin: true,
        },
      },
    },
  };
});
