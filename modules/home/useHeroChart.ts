import { useQueries } from '@tanstack/react-query';
import { singleDayTripMetricQuery } from '../../common/api/hooks/tripExplorer';
import { YESTERDAY_STRING } from '../../common/constants/dates';
import { QueryNameKeys } from '../../common/types/api';
import { HERO_STATIONS, pickHero } from './heroChart';
import type { HeroPick } from './heroChart';

export type HeroChartState = 'loading' | 'ready' | 'empty';

/**
 * Yesterday's headways at each line's downtown station, and the line that ran the most unevenly.
 * Every visitor asks for the same past day, so the API's edge cache serves all but the first.
 */
export const useHeroChart = (): { pick?: HeroPick; date: string; state: HeroChartState } => {
  const date = YESTERDAY_STRING;
  const results = useQueries({
    // The trip page's own query, so "Explore this day" opens on a warm cache.
    queries: HERO_STATIONS.map((station) =>
      singleDayTripMetricQuery(QueryNameKeys.headways, { stop: station.stopIds, date })
    ),
  });
  // Waits for every line, so the pick doesn't swap once a slower line loads.
  if (results.some((result) => result.isPending)) return { date, state: 'loading' };
  const pick = pickHero(HERO_STATIONS.map((station, i) => ({ station, rows: results[i].data })));
  return { pick, date, state: pick ? 'ready' : 'empty' };
};
