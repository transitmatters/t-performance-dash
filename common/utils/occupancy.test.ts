import { describe, expect, it } from 'vitest';

import { CHART_COLORS } from '../constants/colors';
import { busiestCar, consistHoverContent, parseConsist } from './occupancy';

const MIXED = {
  route_id: 'Red',
  direction: 0,
  vehicle_consist: '1932|1933|1913|1912',
  occupancy_status:
    'FEW_SEATS_AVAILABLE|NO_DATA_AVAILABLE|STANDING_ROOM_ONLY|NOT_ACCEPTING_PASSENGERS',
  occupancy_percentage: '8.0||19.0|',
};

describe('parseConsist', () => {
  it('lines readings up with cars and drops the empty slots', () => {
    expect(parseConsist(MIXED)).toEqual([
      { id: '1932', level: 'FEW_SEATS_AVAILABLE', notBoarding: false, percentage: 8 },
      { id: '1933', level: null, notBoarding: false, percentage: null },
      { id: '1913', level: 'STANDING_ROOM_ONLY', notBoarding: false, percentage: 19 },
      { id: '1912', level: null, notBoarding: true, percentage: null },
    ]);
  });

  it('has no cars for a blank consist', () => {
    expect(parseConsist({ vehicle_consist: '' })).toEqual([]);
  });

  it('keeps the cars when no car reported', () => {
    expect(parseConsist({ vehicle_consist: '0700|0701', occupancy_status: null })).toEqual([
      { id: '0700', level: null, notBoarding: false, percentage: null },
      { id: '0701', level: null, notBoarding: false, percentage: null },
    ]);
  });
});

describe('busiestCar', () => {
  it('ignores cars without a reading', () => {
    expect(busiestCar(parseConsist(MIXED))?.id).toBe('1913');
  });
});

describe('consistHoverContent', () => {
  it('tints reporting cars and summarizes the busiest one', () => {
    const { train, chips, load } = consistHoverContent(MIXED);
    expect(chips).toBeUndefined();
    expect(train?.cars.map((car) => [car.id, car.color, car.noReading, car.detail])).toEqual([
      ['1932', CHART_COLORS.YELLOW, false, '8%'],
      ['1933', undefined, true, '—'],
      ['1913', CHART_COLORS.RED, false, '19%'],
      ['1912', undefined, true, '—'],
    ]);
    expect(train?.legend?.map((entry) => entry.label)).toEqual([
      'Few seats',
      'Standing room',
      'No data',
      'Not boarding',
    ]);
    expect(load).toMatchObject({ value: 'Standing room', detail: '2 of 4 cars reporting' });
  });

  it('draws a plain train when no car reported', () => {
    const { train, load } = consistHoverContent({
      route_id: 'Blue',
      direction: 0,
      vehicle_consist: '0700|0701',
    });
    expect(train?.cars).toEqual([
      { id: '0700', color: undefined, noReading: false, detail: undefined },
      { id: '0701', color: undefined, noReading: false, detail: undefined },
    ]);
    expect(train?.legend).toBeUndefined();
    expect(load).toBeUndefined();
  });

  it('keeps a lone vehicle as a chip', () => {
    expect(consistHoverContent({ route_id: '28', direction: 0, vehicle_consist: '1234' })).toEqual({
      chips: { label: 'Vehicle', values: ['1234'] },
    });
  });
});
