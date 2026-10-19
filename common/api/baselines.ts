import type { HistoricalBaselines } from '../types/baselines';

// Resolves to null when the file is missing or unreadable, so callers fall back to hard-coded peaks.
export const fetchHistoricalBaselines = async (): Promise<HistoricalBaselines | null> => {
  const url = new URL(`/static/landing/baselines.json`, window.location.origin);
  try {
    const resp = await fetch(url.toString());
    if (!resp.ok) return null;
    const baselines = await resp.json();
    return baselines?.schemaVersion === 1 && baselines.metrics ? baselines : null;
  } catch {
    return null;
  }
};
