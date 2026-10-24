import { describe, expect, it } from 'vitest';
import type { Shutdown } from '../../../common/types/shutdowns';
import type { Station } from '../../../common/types/stations';
import {
  affectsTrip,
  describeShutdowns,
  explainGapBlocks,
  explainGaps,
  shutdownDays,
  shutdownLineId,
  stationForStop,
} from './shutdowns';

const shutdown = (overrides: Partial<Shutdown> = {}): Shutdown => ({
  line: 'Red',
  alert_id: '1',
  effect: 'SHUTTLE',
  cause: 'MAINTENANCE',
  header: 'Shuttle buses replace Red Line service between Alewife and Harvard',
  stops: ['place-alfcl', 'place-davis', 'place-portr', 'place-harsq'],
  periods: [{ start: '2026-03-07T03:00:00-05:00', end: '2026-03-09T03:00:00-04:00' }],
  first_start: '2026-03-07',
  last_end: '2026-03-08',
  ...overrides,
});

const station = (line: string, stopId: string) => stationForStop(line, stopId) as Station;

describe('shutdownLineId', () => {
  it('covers rapid transit and commuter rail only', () => {
    expect(shutdownLineId('Red')).toBe('Red');
    expect(shutdownLineId('Green')).toBe('Green');
    expect(shutdownLineId('Commuter Rail', 'CR-Worcester')).toBe('CR-Worcester');
    expect(shutdownLineId('Bus')).toBeUndefined();
  });
});

describe('describeShutdowns', () => {
  it('labels the segment from its end stations', () => {
    const [view] = describeShutdowns(
      [shutdown({ stops: ['70068', 'place-alfcl', '70064'] })],
      'Red'
    );
    expect(view.label).toBe('Shuttle: Alewife–Harvard');
  });

  it('drops the branch from station names', () => {
    const [view] = describeShutdowns(
      [shutdown({ effect: 'SUSPENSION', stops: ['place-jfk', 'place-asmnl'] })],
      'Red'
    );
    expect(view.label).toBe('Suspended: JFK/UMass–Ashmont');
  });

  it('calls the band a partial shutdown unless the whole line is out', () => {
    const [partial, whole] = describeShutdowns(
      [shutdown(), shutdown({ alert_id: '2', effect: 'SUSPENSION', stops: [] })],
      'Red'
    );
    expect(partial.bandLabel).toBe('Partial shutdown');
    expect(whole.bandLabel).toBe('Shutdown');
  });

  it('names closed stations', () => {
    const [view] = describeShutdowns(
      [shutdown({ effect: 'STATION_CLOSURE', stops: ['place-symcl'], line: 'Green' })],
      'Green'
    );
    expect(view.label).toBe('Closed: Symphony');
  });

  it('falls back to the effect alone', () => {
    const [view] = describeShutdowns([shutdown({ effect: 'SUSPENSION', stops: [] })], 'Red');
    expect(view.label).toBe('Suspended');
  });

  it('finds commuter rail stations by child stop', () => {
    expect(stationForStop('CR-Fairmount', 'DB-2205-01')?.stop_name).toBe('Fairmount');
  });
});

describe('shutdownDays', () => {
  it('counts days the shutdown took up most of', () => {
    // Friday 8:45pm through the end of Sunday's service
    const weekend = shutdown({
      periods: [{ start: '2026-03-06T20:45:00-05:00', end: '2026-03-09T03:00:00-04:00' }],
    });
    expect(shutdownDays(weekend)).toEqual(['2026-03-07', '2026-03-08']);
  });

  it('skips evening-only shutdowns', () => {
    const evening = shutdown({
      periods: [{ start: '2026-03-10T20:45:00-04:00', end: '2026-03-11T02:30:00-04:00' }],
    });
    expect(shutdownDays(evening)).toEqual([]);
  });

  it('merges consecutive days into ranges', () => {
    const [view] = describeShutdowns(
      [
        shutdown({
          periods: [
            { start: '2026-03-07T03:00:00-05:00', end: '2026-03-09T03:00:00-04:00' },
            { start: '2026-03-14T03:00:00-04:00', end: '2026-03-15T03:00:00-04:00' },
          ],
        }),
      ],
      'Red'
    );
    expect(view.dayRanges).toEqual([
      ['2026-03-07', '2026-03-08'],
      ['2026-03-14', '2026-03-14'],
    ]);
  });
});

describe('affectsTrip', () => {
  const [view] = describeShutdowns([shutdown()], 'Red');

  it('includes trips through the shutdown', () => {
    expect(affectsTrip(view, station('Red', 'place-alfcl'), station('Red', 'place-pktrm'))).toBe(
      true
    );
    expect(affectsTrip(view, station('Red', 'place-pktrm'), station('Red', 'place-davis'))).toBe(
      true
    );
  });

  it('leaves out trips that only touch its end', () => {
    expect(affectsTrip(view, station('Red', 'place-harsq'), station('Red', 'place-pktrm'))).toBe(
      false
    );
  });

  it('leaves out trips on another branch', () => {
    const [ashmont] = describeShutdowns(
      [shutdown({ stops: ['place-shmnl', 'place-fldcr', 'place-smmnl'] })],
      'Red'
    );
    expect(affectsTrip(ashmont, station('Red', 'place-pktrm'), station('Red', 'place-brntn'))).toBe(
      false
    );
    expect(affectsTrip(ashmont, station('Red', 'place-pktrm'), station('Red', 'place-asmnl'))).toBe(
      true
    );
  });

  it('only counts a station closure at either end of the trip', () => {
    const [closure] = describeShutdowns(
      [shutdown({ effect: 'STATION_CLOSURE', stops: ['place-cntsq'] })],
      'Red'
    );
    expect(affectsTrip(closure, station('Red', 'place-alfcl'), station('Red', 'place-pktrm'))).toBe(
      false
    );
    expect(affectsTrip(closure, station('Red', 'place-cntsq'), station('Red', 'place-pktrm'))).toBe(
      true
    );
  });
});

describe('explainGaps', () => {
  // Alewife–Harvard, shut down Mar 7-8
  const views = describeShutdowns([shutdown()], 'Red');
  const noData = (xMin?: string, xMax?: string) => ({
    type: 'box' as const,
    xMin,
    xMax,
    label: { content: 'No data', display: true },
  });

  it('replaces a gap the shutdown covers, edge to edge', () => {
    expect(explainGaps([noData('2026-03-06', '2026-03-09')], views)).toMatchObject([
      { xMin: '2026-03-06', xMax: '2026-03-09', label: { content: 'Partial shutdown' } },
    ]);
  });

  it('keeps "No data" for the days the shutdown leaves unexplained', () => {
    // Missing Mar 7 through Mar 11
    expect(explainGaps([noData('2026-03-06', '2026-03-12')], views)).toMatchObject([
      {
        xMin: '2026-03-06',
        xMax: '2026-03-08T12:00:00',
        label: { content: 'Partial shutdown' },
      },
      { xMin: '2026-03-08T12:00:00', xMax: '2026-03-12', label: { content: 'No data' } },
    ]);
  });

  it('leaves gaps without a shutdown alone', () => {
    const gap = noData('2026-04-01', '2026-04-03');
    expect(explainGaps([gap], views)).toEqual([gap]);
  });

  it('runs a gap at the end of the data to the edge of the chart', () => {
    expect(explainGaps([noData('2026-03-06', undefined)], views)).toMatchObject([
      { xMin: '2026-03-06', xMax: '2026-03-08T12:00:00' },
      { xMin: '2026-03-08T12:00:00', xMax: undefined, label: { content: 'No data' } },
    ]);
  });

  it('leaves narrow bands unlabelled', () => {
    const [band] = explainGaps([noData('2026-03-06', '2026-03-09')], views, {
      startDate: '2025-01-01',
      endDate: '2026-03-31',
    });
    expect(band).toMatchObject({ label: { display: false } });
  });

  it('describes the shutdown on hover', () => {
    const [block] = explainGapBlocks([{ from: '2026-03-06', to: '2026-03-09' }], views);
    expect(block).toMatchObject({
      from: '2026-03-06',
      to: '2026-03-09',
      label: 'Partial shutdown',
      tooltip: {
        title: 'Shuttle: Alewife–Harvard',
        lines: [expect.any(String), shutdown().header],
      },
    });
  });
});
