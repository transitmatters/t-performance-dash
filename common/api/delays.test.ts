import { afterEach, describe, expect, it, vi } from 'vitest';
import red from '../../server/tests/fixtures/api_samples/linedelays/red_daily.json';
import { fetchLineDelaysByLine } from './delays';

describe('fetchLineDelaysByLine', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('keeps every row of a production response, whose line is a route ID', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://dashboard.transitmatters.org' } });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(red), { status: 200 }))
    );
    const rows = await fetchLineDelaysByLine({
      line: 'Red',
      start_date: '2025-01-01',
      end_date: '2025-01-25',
      agg: 'daily',
    });
    expect(rows).toHaveLength(red.length);
    expect(rows[0]?.line).toBe('Red');
  });
});
