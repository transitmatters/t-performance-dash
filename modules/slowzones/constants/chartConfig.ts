import type dayjs from 'dayjs';
import { enUS } from 'date-fns/locale';
import type { CartesianScaleTypeRegistry, ScaleOptionsByType } from 'chart.js';
import { getTimeUnitSlowzones } from '../../../common/utils/slowZoneUtils';

export const getDateAxisConfig = (startDateUTC: dayjs.Dayjs, endDateUTC: dayjs.Dayjs) => {
  return {
    min: startDateUTC.toISOString(),
    max: endDateUTC.toISOString(),
    time: { unit: getTimeUnitSlowzones(startDateUTC, endDateUTC) },
    adapters: {
      date: {
        locale: enUS,
      },
    },
    display: true,
  };
};
export const stationAxisConfig: Partial<ScaleOptionsByType<keyof CartesianScaleTypeRegistry>> = {
  position: 'top',
  beginAtZero: true,
};
