import { pickBy } from '@lodash-utils';
import { LINE_OBJECTS } from '../../common/constants/lines';
import type { TripEmbedChart, TripEmbedPage } from '../../common/constants/staticRoutes';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../../common/types/lines';
import type { QueryParams, Route } from '../../common/types/router';
import { getEmbedSnippet } from '../../common/utils/embed';
import { stringifySearch } from '../../common/utils/searchParams';

/** One trip chart: which trip page it's on, and which of that page's charts. */
export type TripEmbed = {
  [P in TripEmbedPage]: { page: P; chart: TripEmbedChart<P> };
}[TripEmbedPage];

const CHART_NAMES: Record<TripEmbedChart<'single'> | TripEmbedChart<'multi'>, string> = {
  traveltimes: 'travel times',
  speeds: 'speeds',
  headways: 'headways',
  dwells: 'dwells',
  'headway-distribution': 'headway distribution',
  'traveltimes-by-hour': 'travel times by hour',
};

/** The day filter on each multi-day chart's card, which its embed keeps. */
export const MULTI_TRIP_DAY_PARAMS: Partial<Record<TripEmbedChart<'multi'>, string>> = {
  traveltimes: 'ttDays',
  headways: 'hwDays',
  dwells: 'dwDays',
  'traveltimes-by-hour': 'peak',
};

const ROUTE_PARAMS = ['from', 'to', 'busRoute', 'crRoute', 'ferryRoute'];

/**
 * What an embed keeps from the trip page's query; other cards' toggles and `ttView` stay behind.
 * A multi-day chart keeps the page's comparison period (`vs`), which it draws too.
 */
const embedParams = ({ page, chart }: TripEmbed) =>
  page === 'single'
    ? [...ROUTE_PARAMS, 'date']
    : [...ROUTE_PARAMS, 'startDate', 'endDate', MULTI_TRIP_DAY_PARAMS[chart], 'vs'];

const tripSearch = (embed: TripEmbed, query: QueryParams, extra: QueryParams = {}) => {
  const keep = embedParams(embed);
  return stringifySearch({ ...pickBy(query, (_, key) => keep.includes(key)), ...extra });
};

const getRouteName = ({ line, query }: Pick<Route, 'line' | 'query'>) => {
  if (query.busRoute) return `Route ${query.busRoute}`;
  if (query.crRoute) return COMMUTER_RAIL_LINE_NAMES[query.crRoute];
  if (query.ferryRoute) return FERRY_LINE_NAMES[query.ferryRoute];
  return line ? LINE_OBJECTS[line].name : 'MBTA';
};

export const getTripEmbedTitle = (embed: TripEmbed, route: Pick<Route, 'line' | 'query'>) =>
  `${getRouteName(route)} ${CHART_NAMES[embed.chart]}`;

/** The trip page the embed comes from, for its "view on the dashboard" link. */
export const getTripPageUrl = (
  embed: TripEmbed,
  { linePath, query }: Pick<Route, 'linePath' | 'query'>
) => `${window.location.origin}/${linePath}/trips/${embed.page}/${tripSearch(embed, query)}`;

/** `trendline`: the chart has its trendline turned on, so the embed draws it too. */
export const getTripEmbedSnippet = (embed: TripEmbed & { trendline?: boolean }, route: Route) => {
  const search = tripSearch(embed, route.query, embed.trendline ? { trend: '1' } : {});
  return getEmbedSnippet(
    `/embed/${route.linePath}/trips/${embed.page}/${embed.chart}/${search}`,
    getTripEmbedTitle(embed, route)
  );
};
