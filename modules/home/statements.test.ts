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

  it('says how evenly trains are spaced and where they bunch most', () => {
    const { reliability } = byId(DATA);
    expect(reliability.head).toBe('No subway line keeps its trains evenly spaced.');
    expect(reliability.body).toBe(
      'Between 36% and 63% of the gaps between trains are on schedule, and Good starts at 65%. On the Green Line, 13% of trains come bunched up behind the one ahead.'
    );
    expect(reliability.link.href).toBe('/reliability');
    // The four subway lines and both bus rows.
    expect(reliability.viz.kind === 'dots' && reliability.viz.marks).toHaveLength(6);
  });

  it('gives the range of delay alert minutes and which way they moved', () => {
    const { delays } = byId(DATA);
    expect(delays.head).toBe(
      'Each subway line spends 44 to 102 minutes a day under a delay alert.'
    );
    expect(delays.body).toBe(
      'That went up on 1 of 4 lines in the last two weeks. Mattapan, at 5 minutes, is the exception.'
    );
  });

  it('leaves Commuter Rail out of frequency and says why', () => {
    const { frequency } = byId(DATA);
    expect(frequency.head).toBe(
      'On the subway, a train comes every 10 minutes or better for 93% of the service day. Across all bus routes, a bus comes every 15 minutes for 54%.'
    );
    expect(frequency.body).toContain('Frequent Bus routes do better, at 89% of their hours.');
    expect(frequency.body).toContain("Commuter Rail isn't judged on frequency");
  });

  it('counts the lines near their best service and names the furthest behind', () => {
    const { service } = byId(DATA);
    expect(service.head).toBe('6 of 7 lines run at least 92% of the trips they ran at their best.');
    expect(service.body).toBe(
      'Across the system the T is scheduling 97% of the most trips it has ever scheduled. Frequent Bus is the furthest behind, at 87%.'
    );
  });

  it('compares slow zones now with their peak', () => {
    expect(byId(DATA).slowZones.head).toBe(
      'Slow zones add 1.3 minutes a day across the subway. In April 2023 they added 2 hours.'
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
    expect(statements.reliability.body).not.toContain('bunched');
  });

  it('is empty before the data loads', () => {
    expect(buildStatements(undefined)).toEqual([]);
  });
});

describe('buildLede', () => {
  it('leads with service and follows with spacing', () => {
    expect(buildLede(DATA)).toEqual({
      lead: 'The T is running close to its best service.',
      rest: 'Keeping trains evenly spaced is where it falls short.',
    });
  });

  it('counts lines when fewer are near their best, and drops spacing once every line is even', () => {
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
      rest: undefined,
    });
  });
});
