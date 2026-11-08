import { describe, expect, it } from 'vitest';
import {
  getNoDataSinceLatestAnnotation,
  getNoDataSinceLatestBlock,
  getServiceDatesBlockAnnotations,
} from './graphUtils';

const spans = (blocks: ReturnType<typeof getServiceDatesBlockAnnotations>) =>
  blocks.map((block) => ({
    xMin: 'xMin' in block ? block.xMin : undefined,
    xMax: 'xMax' in block ? block.xMax : undefined,
    content: 'label' in block ? block.label?.content : undefined,
  }));

describe('getServiceDatesBlockAnnotations', () => {
  it('blocks the range before service began', () => {
    expect(
      spans(getServiceDatesBlockAnnotations('2024-09-01', '2025-10-01', '2025-03-24', undefined))
    ).toEqual([{ xMin: '2024-09-01', xMax: '2025-03-24', content: 'Service began Mar 24, 2025' }]);
  });

  it('blocks the range after service ended', () => {
    expect(
      spans(getServiceDatesBlockAnnotations('2024-09-01', '2025-10-01', undefined, '2025-03-23'))
    ).toEqual([{ xMin: '2025-03-23', xMax: '2025-10-01', content: 'Service ended Mar 23, 2025' }]);
  });

  it('clamps to the range when it is entirely outside service', () => {
    expect(
      spans(getServiceDatesBlockAnnotations('2025-10-01', '2026-10-01', undefined, '2025-03-23'))
    ).toEqual([{ xMin: '2025-10-01', xMax: '2026-10-01', content: 'Service ended Mar 23, 2025' }]);
  });

  it('adds nothing when the range is within service', () => {
    expect(
      getServiceDatesBlockAnnotations('2025-04-01', '2025-10-01', '2025-03-24', undefined)
    ).toEqual([]);
    expect(
      getServiceDatesBlockAnnotations('2025-04-01', '2025-10-01', undefined, undefined)
    ).toEqual([]);
  });
});

describe('getNoDataSinceLatestAnnotation', () => {
  it('stops at `until` instead of today', () => {
    const [block] = getNoDataSinceLatestAnnotation(['2025-02-17', '2025-02-24'], '2025-03-23');
    expect(block).toMatchObject({ xMin: '2025-02-24', xMax: '2025-03-23' });
  });

  it('adds nothing when the latest datapoint is at or past `until`', () => {
    expect(getNoDataSinceLatestAnnotation(['2025-03-24'], '2025-03-23')).toEqual([]);
  });
});

describe('getNoDataSinceLatestBlock', () => {
  const today = '2026-11-07';
  const daily = (...dates: string[]) => getNoDataSinceLatestBlock(dates, today);

  it('adds nothing when daily data runs through the last couple of days', () => {
    expect(daily('2026-11-05', '2026-11-06')).toEqual([]);
    expect(daily('2026-11-03', '2026-11-04')).toEqual([]);
  });

  it('blocks from the latest date when daily data has fallen behind', () => {
    expect(daily('2026-11-02', '2026-11-03')).toEqual([{ from: '2026-11-03', to: today }]);
  });

  it('adds nothing for the current week of weekly data', () => {
    expect(daily('2026-10-26', '2026-11-02')).toEqual([]);
  });

  it('blocks when a week of weekly data is missing', () => {
    expect(daily('2026-10-19', '2026-10-26')).toEqual([{ from: '2026-10-26', to: today }]);
  });

  it('adds nothing for the current month of monthly data', () => {
    expect(daily('2026-10-01', '2026-11-01')).toEqual([]);
  });

  it('adds nothing without data', () => {
    expect(daily()).toEqual([]);
  });
});
