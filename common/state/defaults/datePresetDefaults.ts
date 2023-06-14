import type { DatePresetKey } from '../../constants/dates';

export const PRESET_DEFAULTS: {
  linePreset: DatePresetKey | 'custom';
  systemPreset: DatePresetKey | 'custom';
  singleTripPreset: DatePresetKey | 'custom';
  rangeTripPreset: DatePresetKey | 'custom';
} = {
  linePreset: 'year',
  systemPreset: 'year',
  singleTripPreset: 'today',
  rangeTripPreset: 'week',
};
