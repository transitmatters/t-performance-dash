import { useQueries } from '@tanstack/react-query';
import { fetchSingleDayData } from '../../common/api/datadashboard';
import { YESTERDAY_STRING } from '../../common/constants/dates';
import { ONE_HOUR } from '../../common/constants/time';
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
    queries: HERO_STATIONS.map((station) => ({
      queryKey: [QueryNameKeys.headways, { stop: station.stopIds, date }],
      queryFn: () => fetchSingleDayData(QueryNameKeys.headways, { stop: station.stopIds, date }),
      staleTime: ONE_HOUR,
    })),
  });
  // Waits for every line, so the pick doesn't swap once a slower line loads.
  if (results.some((result) => result.isPending)) return { date, state: 'loading' };
  const pick = pickHero(HERO_STATIONS.map((station, i) => ({ station, rows: results[i].data })));
  return { pick, date, state: pick ? 'ready' : 'empty' };
};
