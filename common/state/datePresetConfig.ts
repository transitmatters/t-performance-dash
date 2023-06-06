import { create } from 'zustand';
import type { DatePresetKey } from '../constants/dates';
import type { Section } from '../constants/pages';
import type { QueryParams } from '../types/router';
import { PRESET_DEFAULTS } from './defaults/datePresetDefaults';
import { checkForPreset } from './utils/datePresetUtils';

export interface DatePresetConfig {
  linePreset: DatePresetKey | undefined | 'custom';
  singleTripPreset: DatePresetKey | undefined | 'custom';
  rangeTripPreset: DatePresetKey | undefined | 'custom';
  setDefaults: (section: Section | undefined, query: QueryParams) => void;
  setDatePreset: (
    newPreset: DatePresetKey | undefined | 'custom',
    section: Section,
    range: boolean
  ) => void;
}

export const useDatePresetConfig = create<DatePresetConfig>((set) => ({
  linePreset: undefined,
  singleTripPreset: undefined,
  rangeTripPreset: undefined,
  setDefaults: (section, query) =>
    set(() => {
      const preset = checkForPreset(query);
      if (section === 'overview') {
        PRESET_DEFAULTS.linePreset = query.view ?? 'year';
        return PRESET_DEFAULTS;
      }
      if (section === 'line' || section === 'system') {
        PRESET_DEFAULTS.linePreset = preset;
        return PRESET_DEFAULTS;
      }
      if (section === 'trips') {
        if (query.queryType === 'range') PRESET_DEFAULTS.rangeTripPreset = preset;
        else PRESET_DEFAULTS.singleTripPreset = preset;
        return PRESET_DEFAULTS;
      }
      return PRESET_DEFAULTS;
    }),

  setDatePreset: (newPreset, section, range) =>
    set(() => {
      if (section === 'line' || section === 'overview') return { linePreset: newPreset };
      if (section === 'trips' && range) return { rangeTripPreset: newPreset };
      if (section === 'trips' && !range) return { singleTripPreset: newPreset };

      return {};
    }),
}));
