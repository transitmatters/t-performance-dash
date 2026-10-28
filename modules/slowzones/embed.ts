import { LINE_OBJECTS } from '../../common/constants/lines';
import type { LinePath } from '../../common/types/lines';
import { linePathToKeyMap } from '../../common/utils/router';
import { stringifySearch } from '../../common/utils/searchParams';

/** A rail line's path, or `system` for every line on one chart. */
export type SlowZonesEmbedLine = LinePath | 'system';

interface DateRange {
  startDate?: string;
  endDate?: string;
}

const EMBED_HEIGHT = 360;

export const getSlowZonesEmbedTitle = (line: SlowZonesEmbedLine) =>
  `${line === 'system' ? 'MBTA subway' : LINE_OBJECTS[linePathToKeyMap[line]].name} total slow time`;

/** The dashboard page the embed comes from, for its "view on the dashboard" link. */
export const getSlowZonesPageUrl = (line: SlowZonesEmbedLine, dates: DateRange) =>
  `${window.location.origin}/${line}/slowzones/${stringifySearch({ ...dates })}`;

export const getSlowZonesEmbedSnippet = (line: SlowZonesEmbedLine, dates: DateRange) => {
  const src = `${window.location.origin}/embed/${line}/slowzones/${stringifySearch({ ...dates })}`;
  const title = `${getSlowZonesEmbedTitle(line)} — TransitMatters`;
  return `<iframe src="${src}" title="${title}" width="100%" height="${EMBED_HEIGHT}" style="border:0" loading="lazy"></iframe>`;
};
