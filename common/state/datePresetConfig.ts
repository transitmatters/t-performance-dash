import { create } from 'zustand';
import type { DatePresetKey } from '../constants/dates';
import type { DateStoreSection } from '../constants/pages';
import type { QueryParams } from '../types/router';
import { PRESET_DEFAULTS } from './defaults/datePresetDefaults';
import { checkForPreset } from './utils/datePresetUtils';

interface DatePresetStore {
  linePreset: DatePresetKey | undefined | 'custom';
  singleTripPreset: DatePresetKey | undefined | 'custom';
  rangeTripPreset: DatePresetKey | undefined | 'custom';
  setDefaults: (dateStoreSection: DateStoreSection | undefined, query: QueryParams) => void;
  setDatePreset: (
    newPreset: DatePresetKey | undefined | 'custom',
    dateStoreSection: DateStoreSection,
    range: boolean
  ) => void;
}

export const useDatePresetConfig = create<DatePresetStore>((set) => ({
  linePreset: undefined,
  singleTripPreset: undefined,
  rangeTripPreset: undefined,
  setDefaults: (dateStoreSection, query) =>
    set(() => {
      const preset = checkForPreset(query);
      if (dateStoreSection === 'overview') {
        PRESET_DEFAULTS.linePreset = query.view ?? 'year';
        return PRESET_DEFAULTS;
      }
      if (dateStoreSection === 'line' || dateStoreSection === 'system') {
        PRESET_DEFAULTS.linePreset = preset;
        return PRESET_DEFAULTS;
      }
      if (dateStoreSection === 'multiTrips') {
        PRESET_DEFAULTS.rangeTripPreset = preset;
        return PRESET_DEFAULTS;
      }
      if (dateStoreSection === 'singleTrips') {
        PRESET_DEFAULTS.singleTripPreset = preset;
        return PRESET_DEFAULTS;
      }
      return PRESET_DEFAULTS;
    }),

  setDatePreset: (newPreset, dateStoreSection) =>
    set(() => {
      if (dateStoreSection === 'line' || dateStoreSection === 'overview')
        return { linePreset: newPreset };
      if (dateStoreSection === 'multiTrips') return { rangeTripPreset: newPreset };
      if (dateStoreSection === 'singleTrips') return { singleTripPreset: newPreset };

      return {};
    }),
}));
