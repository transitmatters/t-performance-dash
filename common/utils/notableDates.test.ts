import { describe, expect, it } from 'vitest';

import { NOTABLE_DATES } from '../constants/notableDates';
import type { BusRoute } from '../types/lines';
import type { NotableDateContext } from './notableDates';
import {
  findNotableDate,
  formatNotableDate,
  getNotableDateQuery,
  getNotableDates,
  getNotableTripStops,
} from './notableDates';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const labels = (context: NotableDateContext) => getNotableDates(context).map((e) => e.label);

describe('NOTABLE_DATES', () => {
  it.each(NOTABLE_DATES)('$label is a day or a period, with a source', (entry) => {
    if (entry.date) {
      expect(entry.date).toMatch(DAY);
      expect(entry.startDate ?? entry.endDate).toBeUndefined();
    } else {
      expect(entry.startDate).toMatch(DAY);
      expect(entry.endDate).toMatch(DAY);
      expect(entry.startDate! < entry.endDate!).toBe(true);
    }
    expect(entry.source).toMatch(/^https:\/\//);
    expect(entry.label.length).toBeLessThanOrEqual(40);
  });

  it.each(NOTABLE_DATES.filter((entry) => entry.trip))(
    "$label's trip runs between stations on its line",
    (entry) => {
      expect(entry.lines).toHaveLength(1);
      const [line] = entry.lines!;
      // Every route-specific entry so far is a bus route.
      const query = { busRoute: entry.route as BusRoute | undefined };
      expect(getNotableTripStops(entry, line, query)).toBeDefined();
    }
  );

  it.each(NOTABLE_DATES.filter((entry) => entry.route))('$label is about one route', (entry) => {
    expect(entry.lines).toHaveLength(1);
  });
});

describe('getNotableDates', () => {
  it("offers a single-day picker the line's days, and no periods", () => {
    const red = labels({
      type: 'single',
      tab: 'Subway',
      page: 'singleTrips',
      line: 'line-red',
      query: {},
    });
    expect(red).toEqual(['Power problem at South Station']);
  });

  it("offers a range picker the line's periods, and those about every mode or several lines", () => {
    const orange = labels({
      type: 'range',
      tab: 'Subway',
      page: 'service',
      line: 'line-orange',
      query: {},
    });
    expect(orange).toEqual([
      'COVID-19 pandemic',
      'Slow zones build up',
      '30-day shutdown',
      'Slow zone crisis and repairs',
    ]);
  });

  it('offers the System pages only what hit more than one line', () => {
    const system = labels({
      type: 'range',
      tab: 'System',
      page: 'systemSlowzones',
      line: undefined,
      query: {},
    });
    expect(system).toEqual(['COVID-19 pandemic', 'Slow zone crisis and repairs']);
  });

  it("keeps a route's entries to that route", () => {
    const context = { type: 'range', tab: 'Bus', page: 'multiTrips', line: 'line-bus' } as const;
    expect(labels({ ...context, query: { busRoute: '22' } })).toContain(
      'Columbus Ave bus lanes open'
    );
    expect(labels({ ...context, query: { busRoute: '28' } })).not.toContain(
      'Columbus Ave bus lanes open'
    );
    expect(
      labels({ ...context, type: 'single', page: 'singleTrips', query: { busRoute: '28' } })
    ).toEqual(['First day of school']);
  });

  it("leaves out what falls outside the picker's dates", () => {
    // Commuter Rail trip data starts in 2024.
    expect(
      labels({
        type: 'range',
        tab: 'Commuter Rail',
        page: 'multiTrips',
        line: 'line-commuter-rail',
        query: { crRoute: 'CR-Fairmount' },
      })
    ).toEqual([]);
  });
});

describe('getNotableDateQuery', () => {
  const [power] = NOTABLE_DATES.filter((e) => e.label === 'Power problem at South Station');
  const [shutdown] = NOTABLE_DATES.filter((e) => e.label === '30-day shutdown');

  it('sets the stations on the trips pages, in the direction their order gives', () => {
    // Andrew to Park Street is northbound.
    expect(
      getNotableDateQuery(power, { page: 'singleTrips', line: 'line-red', query: {} })
    ).toEqual({ date: '2021-07-13', from: '70084', to: '70076' });
  });

  it('sets only the dates elsewhere', () => {
    expect(
      getNotableDateQuery(shutdown, { page: 'service', line: 'line-orange', query: {} })
    ).toEqual({ startDate: '2022-07-01', endDate: '2022-11-30' });
  });

  it("sets a bus route's stops", () => {
    const [school] = NOTABLE_DATES.filter((e) => e.label === 'First day of school');
    expect(
      getNotableDateQuery(school, {
        page: 'singleTrips',
        line: 'line-bus',
        query: { busRoute: '28' },
      })
    ).toEqual({ date: '2021-09-09', from: '28-1-18511', to: '28-1-64000' });
  });
});

describe('findNotableDate', () => {
  it('matches on the dates alone', () => {
    expect(
      findNotableDate(NOTABLE_DATES, { date: '2021-07-13', from: '70061', to: '70105' })?.label
    ).toBe('Power problem at South Station');
    expect(
      findNotableDate(NOTABLE_DATES, { startDate: '2022-07-01', endDate: '2022-11-30' })?.label
    ).toBe('30-day shutdown');
  });

  it('needs the whole period', () => {
    expect(
      findNotableDate(NOTABLE_DATES, { startDate: '2022-07-01', endDate: '2022-11-29' })
    ).toBeUndefined();
  });
});

describe('formatNotableDate', () => {
  it('gives a day, or the months of a period', () => {
    expect(formatNotableDate({ label: '', date: '2021-09-09', source: '' })).toBe('Sep 9, 2021');
    expect(
      formatNotableDate({ label: '', startDate: '2019-05-01', endDate: '2019-10-31', source: '' })
    ).toBe('May – Oct 2019');
    expect(
      formatNotableDate({ label: '', startDate: '2021-06-01', endDate: '2022-08-19', source: '' })
    ).toBe('Jun 2021 – Aug 2022');
  });
});
