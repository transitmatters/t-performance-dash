import type { FetchCrScorecardOptions } from '../types/api';
import type { CrScorecardEntry } from '../types/dataPoints';
import { apiFetch } from './utils/fetch';

export const fetchCrScorecard = async (
  options: FetchCrScorecardOptions
): Promise<CrScorecardEntry[]> => {
  return await apiFetch({
    path: '/api/crscorecard',
    options,
    errorMessage: 'Failed to fetch Regional Rail scorecard data',
  });
};
