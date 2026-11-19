import { describe, expect, it } from 'vitest';

import { buildLede, buildStatements } from './statements';
import type { Cell, HomeData, MetricId, Row, Status } from './types';

const THRESHOLDS: Record<MetricId, [number, number, number]> = {
  service: [1, 0.92, 0.8],
  frequency: [1, 0.9, 0.75],
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

const subway = (
  id: string,
  service: [Status, number],
  reliability: [Status, number, number],
  delays: [number, number]
) =>
  row(id, [
    cell('service', ...service),
    cell('reliability', reliability[0], reliability[1], { bunched: reliability[2] }),
    cell('delays', 'room', 0.05, { minutesPerDay: delays[0], trend: delays[1] }),
  ]);

/** Trimmed from the November 17, 2026 overview.json. */
const DATA: HomeData = {
  schemaVersion: 1,
  generatedAt: '2026-11-17T12:00:00.000Z',
  rows: [
    subway('red', ['good', 0.988], ['problem', 0.384, 0.098], [102.2, 0.657]),
    subway('orange', ['win', 1.43], ['room', 0.545, 0.069], [44.3, -0.022]),
    subway('blue', ['win', 1.032], ['room', 0.626, 0.036], [78.1, -0.236]),
    subway('green', ['good', 0.93], ['problem', 0.362, 0.127], [59, -0.241]),
    row('commuter-rail', [cell('service', 'win', 1.122), cell('frequency', 'na', null)]),
    row('frequent-bus', [
      cell('service', 'room', 0.872),
      cell('frequency', 'room', 0.892),
      cell('reliability', 'problem', 0.444),
    ]),
    row('all-bus', [
      cell('service', 'good', 0.946),
      cell('frequency', 'problem', 0.541),
      cell('reliability', 'room', 0.61),
    ]),
    row('mattapan', [cell('delays', 'win', 0.004, { minutesPerDay: 4.8, trend: -0.178 })]),
  ],
  hero: [
    { id: 'subwayFrequency', label: '', value: 0.927, unit: 'pct', direction: 'higher' },
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
  it('writes every statement, reliability first', () => {
    expect(buildStatements(DATA).map((s) => s.id)).toEqual([
      'reliability',
      'delays',
      'frequency',
      'service',
      'slowZones',
    ]);
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

  it('leaves Commuter Rail out of frequency', () => {
    const { frequency } = byId(DATA);
    expect(frequency.head).toBe(
      'A subway train comes every 10 minutes or better for 93% of the service day; a bus, every 15, for 54%.'
    );
    expect(frequency.viz.kind === 'meters' && frequency.viz.marks.map((m) => m.row)).toEqual([
      'subway',
      'frequent-bus',
      'all-bus',
    ]);
  });

  it('counts the lines near their best service and links to the furthest behind', () => {
    const { service } = byId(DATA);
    expect(service.head).toBe('6 of 7 lines run at least 92% of the trips they ran at their best.');
    expect(service.link.label).toBe('Frequent Bus service');
  });

  it('compares slow zones now with their peak', () => {
    expect(byId(DATA).slowZones.head).toBe(
      'Slow zones add 1.3 minutes a day across the subway, down from 2 hours a day in April 2023.'
    );
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
    expect(Object.keys(statements)).toEqual(['reliability', 'frequency', 'service']);
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
              : metric === 'frequency'
                ? { ...c, status: 'win', value: 1, score: 1 }
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
    expect(statements.slowZones.head).toBe(
      'There are no slow zones on the subway right now, down from 2 hours a day in April 2023.'
    );
  });

  it('leads with it under the title', () => {
    expect(buildLede(GREAT_DAY)).toEqual({
      lead: 'The T is running at or above its best service.',
      rest: 'Every line keeps its trains and buses evenly spaced.',
    });
  });
});
