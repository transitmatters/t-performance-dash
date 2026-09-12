// maplibre-gl v6 ships its worker as a standalone ES module and resolves the sibling file
// it needs (`maplibre-gl-shared.mjs`) via `new URL('./...', import.meta.url)` built from a
// runtime template literal. Webpack's `new Worker(new URL(...))` bundling only recognizes a
// static literal path, so it never emits these as build assets -- at runtime `import.meta.url`
// then points at whatever chunk webpack inlined maplibre-gl's code into, and the worker
// request 404s (returning Next's HTML fallback, which is why the browser reports a
// "non-JavaScript MIME type" error instead of anything maplibre-specific).
//
// The fix is to serve fixed copies ourselves and point maplibre at them with
// `setWorkerUrl()` (see BusSpeedMapView.tsx). This script vends those copies into public/ so
// they're never bundled or transformed, matching how the worker expects to load itself.
const { copyFileSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const SOURCE_DIR = join(__dirname, '..', 'node_modules', 'maplibre-gl', 'dist');
const DEST_DIR = join(__dirname, '..', 'public');

const FILES = [
  'maplibre-gl-worker.mjs',
  'maplibre-gl-worker-dev.mjs',
  'maplibre-gl-shared.mjs',
  'maplibre-gl-shared-dev.mjs',
];

mkdirSync(DEST_DIR, { recursive: true });

for (const file of FILES) {
  const source = join(SOURCE_DIR, file);
  if (!existsSync(source)) continue; // dev-only builds may omit the -dev variants in some versions
  copyFileSync(source, join(DEST_DIR, file));
}
