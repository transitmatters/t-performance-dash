import { LINE_OBJECTS } from '../../common/constants/lines';
import type { ServiceEmbedChart } from '../../common/constants/staticRoutes';
import type { DayKind } from '../../common/types/dataPoints';
import type { LinePath } from '../../common/types/lines';
import type { QueryParams } from '../../common/types/router';
import { getEmbedSnippet } from '../../common/utils/embed';
import { linePathToKeyMap } from '../../common/utils/router';
import { stringifySearch } from '../../common/utils/searchParams';

/** The `compare` param: service delivered as a share of the schedule, or of the historical maximum. */
export type ServiceComparison = 'scheduled' | 'peak';

export const SERVICE_COMPARISON_LABELS = {
  scheduled: 'Scheduled',
  peak: 'Historical Maximum',
} as const satisfies Record<ServiceComparison, string>;

/** The `day` param of scheduled service by hour. */
export const SERVICE_DAY_LABELS = {
  weekday: 'Weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
} as const satisfies Record<DayKind, string>;

/** The labels as `useChartToggle` options. */
export const SERVICE_COMPARISON_OPTIONS = Object.entries(SERVICE_COMPARISON_LABELS) as [
  ServiceComparison,
  string,
][];
export const SERVICE_DAY_OPTIONS = Object.entries(SERVICE_DAY_LABELS) as [DayKind, string][];

const CHART_NAMES: Record<ServiceEmbedChart, string> = {
  'round-trips': 'daily round trips',
  delivered: 'service delivered',
  hours: 'hours of service',
  'by-hour': 'scheduled service by hour',
};

/** The toggle on each chart's card, which its embed keeps. The page only writes non-defaults. */
const CHART_PARAMS: Partial<Record<ServiceEmbedChart, 'compare' | 'day'>> = {
  delivered: 'compare',
  'by-hour': 'day',
};

const serviceSearch = (chart: ServiceEmbedChart, query: QueryParams) => {
  const param = CHART_PARAMS[chart];
  return stringifySearch({
    startDate: query.startDate,
    endDate: query.endDate,
    ...(param && { [param]: query[param] }),
  });
};

export const getServiceEmbedTitle = (line: LinePath, chart: ServiceEmbedChart) =>
  `${LINE_OBJECTS[linePathToKeyMap[line]].name} ${CHART_NAMES[chart]}`;

/** The Service page the embed comes from, for its "view on the dashboard" link. */
export const getServicePageUrl = (line: LinePath, chart: ServiceEmbedChart, query: QueryParams) =>
  `${window.location.origin}/${line}/service/${serviceSearch(chart, query)}`;

export const getServiceEmbedSnippet = (
  line: LinePath,
  chart: ServiceEmbedChart,
  query: QueryParams
) =>
  getEmbedSnippet(
    `/embed/${line}/service/${chart}/${serviceSearch(chart, query)}`,
    getServiceEmbedTitle(line, chart)
  );
