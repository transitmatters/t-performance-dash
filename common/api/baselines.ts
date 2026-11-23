import type { HistoricalBaselines } from '../types/baselines';

// Checks only the version and that metrics exist; the rest of the file is trusted.
const isHistoricalBaselines = (value: unknown): value is HistoricalBaselines =>
  typeof value === 'object' &&
  value !== null &&
  'schemaVersion' in value &&
  value.schemaVersion === 1 &&
  'metrics' in value &&
  Boolean(value.metrics);

// Resolves to null when the file is missing or unreadable, so callers fall back to hard-coded peaks.
export const fetchHistoricalBaselines = async (): Promise<HistoricalBaselines | null> => {
  const url = new URL(`/static/landing/baselines.json`, window.location.origin);
  try {
    const resp = await fetch(url.toString());
    if (!resp.ok) return null;
    const baselines: unknown = await resp.json();
    return isHistoricalBaselines(baselines) ? baselines : null;
  } catch {
    return null;
  }
};
