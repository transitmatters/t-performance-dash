import type { FetchCrScorecardOptions } from '../types/api';
import type { CrScorecardEntry } from '../types/dataPoints';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchCrScorecard = async (
  options: FetchCrScorecardOptions
): Promise<CrScorecardEntry[]> => {
  const { route_id, start_date, end_date, agg, day_kind } = withWeekStart(options);
  if (!route_id || !start_date || !end_date || !agg || !day_kind) return [];
  return await apiFetch({
    path: '/api/crscorecard',
    options: { route_id, start_date, end_date, agg, day_kind },
    errorMessage: 'Failed to fetch Regional Rail scorecard data',
  });
};
