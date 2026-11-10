import { describe, expect, it } from 'vitest';
import { CHART_DATASET_NAMES, getChartTitle, resolveChartHeading } from './chartTitles';

describe('getChartTitle', () => {
  it.each(CHART_DATASET_NAMES)('gives %s a readable title, not its dataset name', (name) => {
    const title = getChartTitle(name);
    expect(title.trim()).not.toBe('');
    expect(title).not.toBe(name);
  });
});

describe('resolveChartHeading', () => {
  const card = { title: 'How much delay', subtitle: 'Minutes delayed per week' };

  it('uses the on-screen card heading', () => {
    expect(resolveChartHeading({ datasetName: 'delay-totals', card })).toEqual(card);
  });

  it('lets explicit props override the card', () => {
    expect(
      resolveChartHeading({
        datasetName: 'delay-causes',
        chartTitle: 'Red Line delays',
        chartSubtitle: 'Total for these dates',
        card,
      })
    ).toEqual({ title: 'Red Line delays', subtitle: 'Total for these dates' });
  });

  it('keeps a card with no subtitle subtitle-less, as on screen', () => {
    expect(resolveChartHeading({ datasetName: 'speed', card: { title: 'Speed' } })).toEqual({
      title: 'Speed',
      subtitle: undefined,
    });
  });

  it('falls back to the dataset maps outside a card', () => {
    expect(resolveChartHeading({ datasetName: 'headways' })).toEqual({
      title: 'Headways',
      subtitle: 'Time between trains',
    });
    expect(resolveChartHeading({ datasetName: 'slowtime', card: {} }).title).toBe(
      'Total slow time'
    );
  });
});
