import type { Line } from '../types/lines';
import { SUBWAY_LINES } from '../types/lines';

/**
 * Major events marked on date-range charts, so someone looking at a sudden change in the data
 * (say, March 2020) can see what caused it.
 *
 * Add an event only when it visibly moves the data on the lines it lists, and cite a source so a
 * reviewer can check the date. Keep `label` short: it is drawn on the chart.
 */
export interface MajorEvent {
  label: string;
  /** First day of the event, as YYYY-MM-DD. */
  start: string;
  /** Last day of an event that spans a period, as YYYY-MM-DD. Omit for a one-day event. */
  end?: string;
  /** Lines the event affected. Omit when it affected every mode. */
  lines?: Line[];
  source: string;
}

export const MAJOR_EVENTS: MajorEvent[] = [
  {
    label: 'Red Line derailment at JFK/UMass',
    start: '2019-06-11',
    lines: ['line-red'],
    source:
      'https://www.wbur.org/news/2019/06/21/mbta-red-line-signals-derailment-commuter-delays-repairs-update',
  },
  {
    label: 'COVID-19 service cuts',
    start: '2020-03-17',
    source:
      'https://mass.streetsblog.org/2020/03/16/mbta-will-reduce-service-to-manage-covid-19-risks',
  },
  {
    label: 'GLX Union Square branch opens',
    start: '2022-03-21',
    lines: ['line-green'],
    source:
      'https://www.nbcboston.com/news/local/green-line-extension-service-to-union-square-in-somerville-begins-monday/2674344/',
  },
  {
    label: 'FTA-directed service cuts',
    start: '2022-06-20',
    lines: ['line-red', 'line-orange', 'line-blue'],
    source:
      'https://www.bostonglobe.com/2022/06/20/metro/reduced-t-schedule-takes-effect-today-heres-what-that-means/',
  },
  {
    label: 'Orange Line shutdown',
    start: '2022-08-19',
    end: '2022-09-18',
    lines: ['line-orange'],
    source: 'https://www.wbur.org/news/2022/09/19/mbta-orange-line-reopen-on-time',
  },
  {
    label: "Closed north of Gov't Center",
    start: '2022-08-22',
    end: '2022-09-18',
    lines: ['line-green'],
    source:
      'https://www.masstransitmag.com/rail/infrastructure/press-release/21281216/massachusetts-bay-transportation-authority-mbta-mbta-orange-line-and-green-line-extension-service-resume-on-schedule-september-19',
  },
  {
    label: 'GLX Medford branch opens',
    start: '2022-12-12',
    lines: ['line-green'],
    source: 'https://www.wbur.org/news/2022/12/08/green-line-extension-medford-open',
  },
  {
    // The blanket 25 mph cap was lifted the next morning, but most slow zones it exposed stayed.
    label: 'Systemwide speed restrictions',
    start: '2023-03-09',
    lines: SUBWAY_LINES,
    source: 'https://www.wbur.org/news/2023/03/10/mbta-slow-zones-restricted-speed',
  },
  {
    // The last Track Improvement Program closure ended Dec 20; the MBTA announced it on Dec 23.
    label: 'Subway slow zones cleared',
    start: '2024-12-23',
    lines: ['line-red', 'line-orange', 'line-blue', 'line-green'],
    source:
      'https://baystatebanner.com/2024/12/31/mbta-announces-elimination-of-all-subway-slow-zones/',
  },
];
