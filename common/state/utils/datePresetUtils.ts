import { RANGE_DATE_KEYS, SINGLE_DATE_KEYS } from '../../constants/dates';
import { ALL_PAGES } from '../../constants/pages';
import type { QueryParams } from '../../types/router';
import { useDelimitatedRoute } from '../../utils/router';
import { useDatePresetConfig } from '../datePresetConfig';

export const useSelectedPreset = () => {
  const datePresetConfig = useDatePresetConfig();
  const { page } = useDelimitatedRoute();
  if (ALL_PAGES[page].section === 'line') return datePresetConfig.linePreset;
  if (ALL_PAGES[page].section === 'multiTrips') return datePresetConfig.rangeTripPreset;
  if (ALL_PAGES[page].section === 'singleTrips') return datePresetConfig.singleTripPreset;
  return undefined;
};

export const checkForPreset = (query: QueryParams) => {
  const potentialKey = `${query.startDate}${query.endDate ?? ''}`;
  if (query.queryType === 'single' && query.startDate && SINGLE_DATE_KEYS[potentialKey]) {
    return SINGLE_DATE_KEYS[potentialKey];
  }
  if (query.startDate && query.endDate && RANGE_DATE_KEYS[potentialKey]) {
    return RANGE_DATE_KEYS[potentialKey];
  }
  return 'custom';
};
