import { useMemo } from 'react';
import { useShutdownsData } from '../../common/api/hooks/shutdowns';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { ShutdownView } from './utils/shutdowns';
import {
  affectsTrip,
  describeShutdowns,
  isLineWide,
  shutdownLineId,
  stationForStop,
} from './utils/shutdowns';

/**
 * Shutdowns on the current page's line, over the given dates or the page's own.
 * `line` keeps the ones that empty line-wide metrics; `trip` keeps the ones that stopped trains
 * between the page's from and to stations.
 */
export const usePageShutdowns = (
  scope: 'line' | 'trip',
  startDate?: string,
  endDate?: string
): ShutdownView[] => {
  const { lineShort, query } = useDelimitatedRoute();
  const line = shutdownLineId(lineShort, query.crRoute);
  const start = startDate ?? query.startDate ?? query.date;
  const end = endDate ?? query.endDate ?? start;
  const { data } = useShutdownsData(
    { line, start_date: start, end_date: end },
    Boolean(line && start && end)
  );

  return useMemo(() => {
    if (!data || !line) return [];
    const views = describeShutdowns(data, line);
    if (scope === 'line') return views.filter(isLineWide);
    const from = query.from ? stationForStop(line, query.from) : undefined;
    const to = query.to ? stationForStop(line, query.to) : undefined;
    return from && to ? views.filter((view) => affectsTrip(view, from, to)) : [];
  }, [data, line, scope, query.from, query.to]);
};
