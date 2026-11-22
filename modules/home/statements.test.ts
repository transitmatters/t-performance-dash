import { describe, expect, it } from 'vitest';

import { buildLede, buildStatements } from './statements';
import type { Cell, HomeData, MetricId, Row, Status } from './types';

const THRESHOLDS: Partial<Record<MetricId, [number, number, number]>> = {
  service: [1, 0.92, 0.8],
  dropped: [0.01, 0.02, 0.05],
  reliability: [0.8, 0.65, 0.5],
  delays: [0.02, 0.04, 0.08],
  speed: [1, 0.95, 0.88],
};

const cell = (
  metric: MetricId,
  status: Status,
  value: number | null,
  extra: Partial<Cell> = {}
): Cell => ({
  metric,
  status,
  value,
  score: value,
  unit: 'pct',
  thresholds: THRESHOLDS[metric],
  trend: null,
  href: `/${metric}`,
  ...extra,
});

const row = (id: string, cells: Cell[]): Row => ({
  id,
  label: id,
  line: 'line-red',
  href: `/${id}`,
  headline: { kind: 'room', heldBackBy: [] },
  cells: Object.fromEntries(cells.map((c) => [c.metric, c])),
});

/** Speed against the line's best, judged together with slow zones. */
const speed = (score: number): Cell =>
  cell('speed', 'room', 20, {
    unit: 'mph',
    parts: [
      { label: 'Speed', status: 'room', score, scoreUnit: 'pct' },
      { label: 'Slow zones', status: 'win', score: 10, scoreUnit: 'seconds' },
    ],
  });

const ridership = (value: number): Cell => cell('ridership', 'unscored', value);

const subway = (
  id: string,
  service: [Status, number],
  reliability: [Status, number, number],
  delays: [number, number],
  speedScore: number,
  riders: number
) =>
  row(id, [
    cell('service', ...service),
    cell('reliability', reliability[0], reliability[1], { bunched: reliability[2] }),
    cell('delays', 'room', 0.05, { minutesPerDay: delays[0], trend: delays[1] }),
    speed(speedScore),
    ridership(riders),
  ]);

/** Trimmed from the November 17, 2026 overview.json, with the November 21 speeds and ridership. */
const DATA: HomeData = {
  schemaVersion: 1,
  generatedAt: '2026-11-17T12:00:00.000Z',
  rows: [
    subway('red', ['good', 0.988], ['problem', 0.384, 0.098], [102.2, 0.657], 0.95, 0.102),
    subway('orange', ['win', 1.43], ['room', 0.545, 0.069], [44.3, -0.022], 1.093, 0.111),
    subway('blue', ['win', 1.032], ['room', 0.626, 0.036], [78.1, -0.236], 0.915, 0.059),
    subway('green', ['good', 0.93], ['problem', 0.362, 0.127], [59, -0.241], 0.829, 0.032),
    row('commuter-rail', [
      cell('service', 'win', 1.122),
      cell('dropped', 'win', 0.001),
      ridership(0.158),
    ]),
    row('frequent-bus', [
      cell('service', 'room', 0.872),
      cell('dropped', 'win', 0.008),
      cell('reliability', 'problem', 0.444),
    ]),
    row('all-bus', [
      cell('service', 'good', 0.946),
      cell('dropped', 'win', 0.005, { trend: -0.035, trendBasis: 'yearAgo' }),
      cell('reliability', 'room', 0.61),
      ridership(0.06),
    ]),
    row('mattapan', [cell('delays', 'win', 0.004, { minutesPerDay: 4.8, trend: -0.178 })]),
  ],
  hero: [
    { id: 'service', label: '', value: 0.971, unit: 'pct', direction: 'higher' },
    {
      id: 'slowZones',
      label: '',
      value: 1.3,
      unit: 'minutes',
      direction: 'lower',
      history: [
        ...Array.from({ length: 12 }, (_, i): [string, number] => [
          `2022-${String(i + 1).padStart(2, '0')}`,
          40,
        ]),
        ['2023-04', 121.4],
        ['2026-11', 1.2],
      ],
    },
  ],
};

const byId = (data: HomeData) => Object.fromEntries(buildStatements(data).map((s) => [s.id, s]));

describe('buildStatements', () => {
  it('writes every statement, in the scoreboard order', () => {
    expect(buildStatements(DATA).map((s) => s.id)).toEqual([
      'service',
      'dropped',
      'reliability',
      'delays',
      'speed',
      'ridership',
    ]);
  });

  it('leads dropped trips with buses and the year before', () => {
    const { dropped } = byId(DATA);
    expect(dropped.head).toBe(
      'Buses drop 0.5% of scheduled trips, down from 4% a year ago. Commuter Rail cancels 0.1%.'
    );
    expect(dropped.viz.kind === 'shares' && dropped.viz.marks.map((m) => m.row)).toEqual([
      'commuter-rail',
      'frequent-bus',
      'all-bus',
    ]);
  });

  it('leaves the year before out of dropped trips without one', () => {
    const rows = DATA.rows.map((r) =>
      r.id === 'all-bus' && r.cells.dropped
        ? { ...r, cells: { ...r.cells, dropped: { ...r.cells.dropped, trend: null } } }
        : r
    );
    expect(byId({ ...DATA, rows }).dropped.head).toBe(
      'Buses drop 0.5% of scheduled trips. Commuter Rail cancels 0.1%.'
    );
  });

  it('says how much ridership changed and where it grew most', () => {
    const { ridership } = byId(DATA);
    expect(ridership.head).toBe(
      'Every line carries more riders than a year ago, up to +16% on Commuter Rail.'
    );
    expect(ridership.viz.kind === 'changes' && ridership.viz.marks).toHaveLength(6);
  });

  it('says how evenly trains are spaced and links to the line furthest off', () => {
    const { reliability } = byId(DATA);
    expect(reliability.head).toBe('No line keeps its trains or buses evenly spaced.');
    expect(reliability.link.label).toBe('Green Line reliability');
    expect(reliability.link.href).toBe('/reliability');
    // The four subway lines and both bus rows.
    expect(reliability.viz.kind === 'dots' && reliability.viz.marks).toHaveLength(6);
  });

  it('talks about the subway alone when no bus has headway data', () => {
    const subwayOnly: HomeData = {
      ...DATA,
      rows: DATA.rows.map((r) =>
        r.id.includes('bus') ? { ...r, cells: { ...r.cells, reliability: undefined } } : r
      ),
    };
    expect(byId(subwayOnly).reliability.head).toBe(
      'No subway line keeps its trains evenly spaced.'
    );
    expect(buildLede(subwayOnly)?.rest).toBe(
      'Keeping trains evenly spaced is where it falls short.'
    );
  });

  it('gives the range of delay alert minutes, with Mattapan charted beside the subway', () => {
    const { delays } = byId(DATA);
    expect(delays.head).toBe(
      'Each subway line spends 44 to 102 minutes a day under a delay alert.'
    );
    expect(delays.viz.kind === 'bars' && delays.viz.marks.map((m) => m.row)).toContain('mattapan');
  });

  it('counts the lines near their best service and links to the furthest behind', () => {
    const { service } = byId(DATA);
    expect(service.head).toBe('6 of 7 lines run at least 92% of the trips they ran at their best.');
    expect(service.link.label).toBe('Frequent Bus scheduled service');
  });

  it('says what "best" is, since the Orange Line runs 143% of it', () => {
    const { service } = byId(DATA);
    expect(
      service.viz.kind === 'meters' && service.viz.marks.find((m) => m.row === 'orange')?.value
    ).toBe(1.43);
    expect(service.note).toBe(
      "Best means a line's busiest stretch at least 3 years ago, so one that has added trips since can pass 100%."
    );
  });

  it('gives the range of subway speeds and compares slow zones now with their peak', () => {
    const { speed } = byId(DATA);
    expect(speed.head).toBe(
      'Subway trains run at 83% to 109% of their best speeds. Slow zones add 1.3 minutes a day across the subway, down from 2 hours a day in April 2023.'
    );
    expect(speed.link.label).toBe('Green Line speed');
  });

  it('falls back to slow zones alone without speed baselines', () => {
    const rows = DATA.rows.map((r) => ({ ...r, cells: { ...r.cells, speed: undefined } }));
    const { speed } = byId({ ...DATA, rows });
    expect(speed.head).toBe(
      'Slow zones add 1.3 minutes a day across the subway, down from 2 hours a day in April 2023.'
    );
    expect(speed.viz.kind).toBe('area');
  });

  it('leaves out a statement whose numbers an older file lacks', () => {
    const older: HomeData = {
      ...DATA,
      rows: DATA.rows.map((r) => ({
        ...r,
        cells: Object.fromEntries(
          Object.entries(r.cells).map(([m, c]) => [
            m,
            { ...c, minutesPerDay: undefined, bunched: undefined },
          ])
        ),
      })),
      hero: DATA.hero.map((h) => ({ ...h, history: undefined })),
    };
    const statements = byId(older);
    expect(Object.keys(statements)).toEqual([
      'service',
      'dropped',
      'reliability',
      'speed',
      'ridership',
    ]);
  });

  it('is empty before the data loads', () => {
    expect(buildStatements(undefined)).toEqual([]);
  });
});

describe('buildLede', () => {
  it('leads with service and follows with spacing', () => {
    expect(buildLede(DATA)).toEqual({
      lead: 'The T is running close to its best service.',
      rest: 'Keeping trains and buses evenly spaced is where it falls short.',
    });
  });

  it('counts lines when fewer are near their best, and praises spacing once every line is even', () => {
    const rows = DATA.rows.map((r) => ({
      ...r,
      cells: {
        ...r.cells,
        ...(r.cells.service && { service: { ...r.cells.service, status: 'room' as const } }),
        ...(r.cells.reliability && {
          reliability: { ...r.cells.reliability, status: 'good' as const },
        }),
      },
    }));
    expect(buildLede({ ...DATA, rows })).toEqual({
      lead: '0 of 7 lines run close to their best service.',
      rest: 'Every line keeps its trains and buses evenly spaced.',
    });
  });
});

/** Every number at its best: no slow zones, no alerts, every line past its best and evenly spaced. */
const GREAT_DAY: HomeData = {
  ...DATA,
  rows: DATA.rows.map((r) => ({
    ...r,
    cells: Object.fromEntries(
      Object.entries(r.cells).map(([metric, c]) => [
        metric,
        metric === 'service'
          ? { ...c, status: 'win', score: 1.05, value: 1.05 }
          : metric === 'reliability'
            ? { ...c, status: 'win', value: 0.85, score: 0.85, bunched: 0.02 }
            : metric === 'delays'
              ? { ...c, status: 'win', minutesPerDay: 0, trend: -0.5 }
              : metric === 'speed'
                ? { ...c, parts: c.parts?.map((p) => ({ ...p, score: 1.05 })) }
                : c,
      ])
    ),
  })),
  hero: DATA.hero.map((h) => ({ ...h, value: h.id === 'slowZones' ? 0 : 1 })),
};

describe('a great day', () => {
  const statements = byId(GREAT_DAY);

  it('says so in every statement', () => {
    expect(statements.reliability.head).toBe(
      'Every line keeps its trains and buses evenly spaced.'
    );
    expect(statements.delays.head).toBe(
      'No subway line has had a delay alert in the last four weeks.'
    );
    expect(statements.service.head).toBe(
      'Every line runs as many trips as it did at its best, or more.'
    );
    expect(statements.speed.head).toBe(
      'Every subway line runs as fast as it did at its best, or faster. There are no slow zones on the subway right now, down from 2 hours a day in April 2023.'
    );
  });

  it('leads with it under the title', () => {
    expect(buildLede(GREAT_DAY)).toEqual({
      lead: 'The T is running at or above its best service.',
      rest: 'Every line keeps its trains and buses evenly spaced.',
    });
  });
});
