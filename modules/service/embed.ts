import { LINE_OBJECTS } from '../../common/constants/lines';
import type { LinePath } from '../../common/types/lines';
import { getEmbedSnippet } from '../../common/utils/embed';
import { linePathToKeyMap } from '../../common/utils/router';
import { stringifySearch } from '../../common/utils/searchParams';

/** The `compare` param: service delivered as a share of the schedule, or of the historical maximum. */
export type ServiceComparison = 'scheduled' | 'peak';

export const SERVICE_COMPARISON_LABELS = {
  scheduled: 'Scheduled',
  peak: 'Historical Maximum',
} as const satisfies Record<ServiceComparison, string>;

interface ServiceDeliveredParams {
  startDate?: string;
  endDate?: string;
  comparison: ServiceComparison;
}

// `scheduled` is the default, so only `peak` is written.
const serviceSearch = ({ startDate, endDate, comparison }: ServiceDeliveredParams) =>
  stringifySearch({ startDate, endDate, compare: comparison === 'peak' ? 'peak' : undefined });

export const getServiceDeliveredTitle = (line: LinePath) =>
  `${LINE_OBJECTS[linePathToKeyMap[line]].name} service delivered`;

/** The Service page the embed comes from, for its "view on the dashboard" link. */
export const getServicePageUrl = (line: LinePath, params: ServiceDeliveredParams) =>
  `${window.location.origin}/${line}/service/${serviceSearch(params)}`;

export const getServiceDeliveredEmbedSnippet = (line: LinePath, params: ServiceDeliveredParams) =>
  getEmbedSnippet(
    `/embed/${line}/service/delivered/${serviceSearch(params)}`,
    getServiceDeliveredTitle(line)
  );
