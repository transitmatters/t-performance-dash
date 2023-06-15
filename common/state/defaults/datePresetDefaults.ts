import type { DatePresetKey } from '../../constants/dates';
import { TODAY_SERVICE_STARTED } from '../../constants/dates';

export const PRESET_DEFAULTS: {
  linePreset: DatePresetKey | 'custom';
  singleTripPreset: DatePresetKey | 'custom';
  rangeTripPreset: DatePresetKey | 'custom';
} = {
  linePreset: 'year',
  singleTripPreset: TODAY_SERVICE_STARTED ? 'today' : 'yesterday',
  rangeTripPreset: 'week',
};
