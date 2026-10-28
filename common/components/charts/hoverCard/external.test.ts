import { describe, expect, it } from 'vitest';

import { contentFromTooltipModel } from './external';

const model = (
  lines: string[][],
  extra: { title?: string[]; afterBody?: string[]; footer?: string[] } = {}
): Parameters<typeof contentFromTooltipModel>[0] => ({
  title: extra.title ?? ['Oct 1, 2026'],
  body: lines.map((itemLines) => ({ before: [], lines: itemLines, after: [] })),
  labelColors: lines.map((_, index) => ({
    backgroundColor: `#00000${index}`,
    borderColor: `#11111${index}`,
  })),
  beforeBody: [],
  afterBody: extra.afterBody ?? [],
  footer: extra.footer ?? [],
});

describe('contentFromTooltipModel', () => {
  it('splits "Label: value" lines into rows and keeps each series color', () => {
    const content = contentFromTooltipModel(model([['Red: 4m 10s'], ['Orange: 6m 02s']]));
    expect(content.hero).toBeUndefined();
    expect(content.rows).toEqual([
      { label: 'Red', value: '4m 10s', color: '#000000', borderColor: '#111110' },
      { label: 'Orange', value: '6m 02s', color: '#000001', borderColor: '#111111' },
    ]);
  });

  it('splits on the first colon only', () => {
    const content = contentFromTooltipModel(model([['Trips: 10:30 AM'], ['Other: 2']]));
    expect(content.rows?.[0]).toMatchObject({ label: 'Trips', value: '10:30 AM' });
  });

  it('promotes a lone value to the headline', () => {
    const content = contentFromTooltipModel(model([['Ridership: 120,000']]));
    expect(content.hero).toEqual({ value: '120,000', caption: 'Ridership', color: '#000000' });
    expect(content.rows).toBeUndefined();
  });

  it('keeps unlabeled lines as label-only rows', () => {
    const content = contentFromTooltipModel(model([['22.5 mph'], ['Peak']]));
    expect(content.rows?.map((row) => row.value)).toEqual([undefined, undefined]);
    expect(content.rows?.[0].label).toBe('22.5 mph');
  });

  it('drops rows whose callback returned an empty string', () => {
    const content = contentFromTooltipModel(model([['Actual: 2m 05s'], [''], ['Benchmark: 90s']]));
    expect(content.rows?.map((row) => row.label)).toEqual(['Actual', 'Benchmark']);
  });

  it('keeps the first title line as the heading and the rest as notes', () => {
    const content = contentFromTooltipModel(
      model([['Trains: 14']], { title: ['8 - 9 min.', '17% of trains'] })
    );
    expect(content.title).toBe('8 - 9 min.');
    expect(content.notes).toEqual(['17% of trains']);
  });

  it('turns afterBody and footer lines into notes', () => {
    const content = contentFromTooltipModel(
      model([['A: 1'], ['B: 2']], { afterBody: ['25%+ over benchmark', ''], footer: ['Footer'] })
    );
    expect(content.notes).toEqual(['25%+ over benchmark', 'Footer']);
  });
});
