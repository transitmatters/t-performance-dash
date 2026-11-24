import { LINE_OBJECTS } from '../../common/constants/lines';
import type { LinePath } from '../../common/types/lines';
import { getEmbedSnippet } from '../../common/utils/embed';
import { hasKey } from '../../common/utils/hasKey';
import { linePathToKeyMap } from '../../common/utils/router';
import { stringifySearch } from '../../common/utils/searchParams';

/** A rail line's path, or `system` for every line on one chart. */
export type SlowZonesEmbedLine = LinePath | 'system';

export const isSlowZonesEmbedLine = (line: string): line is SlowZonesEmbedLine =>
  line === 'system' || hasKey(linePathToKeyMap, line);

interface DateRange {
  startDate?: string;
  endDate?: string;
}

export const getSlowZonesEmbedTitle = (line: SlowZonesEmbedLine) =>
  `${line === 'system' ? 'MBTA subway' : LINE_OBJECTS[linePathToKeyMap[line]].name} total slow time`;

/** The dashboard page the embed comes from, for its "view on the dashboard" link. */
export const getSlowZonesPageUrl = (line: SlowZonesEmbedLine, dates: DateRange) =>
  `${window.location.origin}/${line}/slowzones/${stringifySearch({ ...dates })}`;

export const getSlowZonesEmbedSnippet = (line: SlowZonesEmbedLine, dates: DateRange) =>
  getEmbedSnippet(
    `/embed/${line}/slowzones/${stringifySearch({ ...dates })}`,
    getSlowZonesEmbedTitle(line)
  );
