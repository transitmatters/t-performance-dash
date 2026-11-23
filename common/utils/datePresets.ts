import { RANGE_DATE_KEYS, SINGLE_DATE_KEYS } from '../constants/dates';
import type { QueryParams } from '../types/router';

/** The preset whose dates match the query's, or `'custom'`. The URL is the only source of truth. */
export const checkForPreset = (query: QueryParams) => {
  const potentialKey = `${query.startDate ?? query.date}${query.endDate ?? ''}`;
  if (query.date && SINGLE_DATE_KEYS[potentialKey]) {
    return SINGLE_DATE_KEYS[potentialKey];
  }
  if (query.startDate && query.endDate && RANGE_DATE_KEYS[potentialKey]) {
    return RANGE_DATE_KEYS[potentialKey];
  }
  return 'custom';
};
