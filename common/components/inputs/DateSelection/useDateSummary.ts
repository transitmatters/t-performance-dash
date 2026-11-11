import dayjs from 'dayjs';
import { getRangePresets, SINGLE_PRESETS } from '../../../constants/dates';
import { checkForPreset } from '../../../state/utils/datePresetUtils';
import type { QueryTypeOptions } from '../../../types/router';
import { useDelimitatedRoute } from '../../../utils/router';

const format = (date: string | undefined) => (date ? dayjs(date).format('MMM D, YYYY') : '');

/** The selected dates in words, for places that show them without the date control. */
export const useDateSummary = (type: QueryTypeOptions) => {
  const { tab, page, query } = useDelimitatedRoute();
  const presets = type === 'range' ? getRangePresets(tab, page) : SINGLE_PRESETS[tab];
  const presetKey = checkForPreset(query);
  const presetName = presetKey !== 'custom' ? presets[presetKey]?.name : undefined;
  const dates =
    type === 'range' ? `${format(query.startDate)} – ${format(query.endDate)}` : format(query.date);
  return { presetName, dates };
};
