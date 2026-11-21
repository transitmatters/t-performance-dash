import type { Line } from '../types/lines';

/**
 * Days and periods worth a look, offered under "Notable dates" in the date picker of the lines
 * they're about. They bring back v3's list of interesting dates (#481).
 *
 * Add one only when the data shows something on it, say longer trips than the week before, and
 * cite a source so a reviewer can check the date. Keep `label` short: it's shown in the date
 * picker's button once chosen, beside the line's name, so it needn't name the line.
 */
export interface NotableDate {
  label: string;
  /** The day, as YYYY-MM-DD, for single-day pickers like Trips. */
  date?: string;
  /** The period, as YYYY-MM-DD, for date range pickers. Set both, or `date` instead. */
  startDate?: string;
  endDate?: string;
  /**
   * Lines it's about. Omit when it hit every mode. One that hit several lines also shows on the
   * System pages.
   */
  lines?: Line[];
  /** The bus, Commuter Rail or ferry route it's about, if any. It shows only on that route. */
  route?: string;
  /**
   * Stations to open the trips pages on, by their `station` key in the line's station list (e.g.
   * `place-andrw`, or `matpn` on a bus route). The direction follows from their order. Only for
   * an entry about one line.
   */
  trip?: { from: string; to: string };
  source: string;
}

export const NOTABLE_DATES: NotableDate[] = [
  {
    // Shuttles ran between Park Street and JFK/UMass that morning.
    label: 'Power problem at South Station',
    date: '2021-07-13',
    lines: ['line-red'],
    trip: { from: 'place-andrw', to: 'place-pktrm' },
    source:
      'https://www.nbcboston.com/news/local/red-line-service-down-replaced-with-shuttle-bus/2428171/',
  },
  {
    label: 'First day of school',
    date: '2021-09-09',
    lines: ['line-bus'],
    route: '28',
    trip: { from: 'matpn', to: 'nubn' },
    source:
      'https://www.wbur.org/news/2021/09/09/boston-public-schools-bus-driver-shortage-first-day',
  },
  {
    // Trains ran slower than before the shutdown, under the slow zones left while new track settled.
    label: 'Reopening after the shutdown',
    date: '2022-09-19',
    lines: ['line-orange'],
    trip: { from: 'place-ogmnl', to: 'place-forhl' },
    source:
      'https://wgbh.org/news/local/2022-10-05/mbta-admits-to-ongoing-slow-zones-on-orange-line-beyond-7-day-settling-period',
  },
  {
    // The derailment destroyed signals near JFK/UMass; full service came back on Sept. 23.
    label: 'JFK/UMass derailment and repairs',
    startDate: '2019-05-01',
    endDate: '2019-10-31',
    lines: ['line-red'],
    trip: { from: 'place-qnctr', to: 'place-sstat' },
    source: 'https://www.wbur.org/news/2019/09/25/mbta-red-line-service-restored',
  },
  {
    label: 'COVID-19 pandemic',
    startDate: '2020-01-01',
    endDate: '2020-06-30',
    source:
      'https://mass.streetsblog.org/2020/03/16/mbta-will-reduce-service-to-manage-covid-19-risks',
  },
  {
    // Ends the day the 30-day shutdown began.
    label: 'Slow zones build up',
    startDate: '2021-06-01',
    endDate: '2022-08-19',
    lines: ['line-orange'],
    trip: { from: 'place-dwnxg', to: 'place-grnst' },
    source:
      'https://mass.streetsblog.org/2021/12/03/the-orange-line-keeps-getting-slower-at-riders-expense',
  },
  {
    // The center-running lanes opened on Oct. 30.
    label: 'Columbus Ave bus lanes open',
    startDate: '2021-10-01',
    endDate: '2021-11-30',
    lines: ['line-bus'],
    route: '22',
    trip: { from: 'jasst', to: 'frnpk' },
    source: 'https://www.boston.gov/departments/transportation/columbus-avenue-bus-lanes',
  },
  {
    // Closed Aug. 19 to Sept. 18, with time on each side to compare.
    label: '30-day shutdown',
    startDate: '2022-07-01',
    endDate: '2022-11-30',
    lines: ['line-orange'],
    trip: { from: 'place-ogmnl', to: 'place-forhl' },
    source: 'https://www.wbur.org/news/2022/09/19/mbta-orange-line-reopen-on-time',
  },
  {
    // Restrictions spread after the March 2023 inspections; the last came off in December 2024.
    label: 'Slow zone crisis and repairs',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green'],
    source:
      'https://baystatebanner.com/2024/12/31/mbta-announces-elimination-of-all-subway-slow-zones/',
  },
];
