import { PEAK_COMPLETE_TRIP_TIMES, PEAK_SCHEDULED_SERVICE } from '../../common/constants/baselines';
import { LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';

const getDatasetOptions = (line: Line) => {
  return {
    borderColor: LINE_COLORS[line ?? 'default'],
    borderWidth: 6,
    pointBackgroundColor: 'transparent',
    pointBorderWidth: 0,
    tension: 0.5,
    pointHoverRadius: 8,
    spanGaps: false,
    pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
  };
};

export const convertToSpeedDataset = (data: SpeedDataPoint[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);
  return {
    ...datasetOptions,
    label: `% of baseline`,
    data: data.map((datapoint) =>
      datapoint.value
        ? (
            100 *
            (1 / datapoint.value / (1 / PEAK_COMPLETE_TRIP_TIMES[line ?? 'DEFAULT'].value))
          ).toFixed(1)
        : Number.NaN
    ),
  };
};

export const convertToServiceDataset = (data: SpeedDataPoint[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);

  return {
    ...datasetOptions,
    label: `% of baseline`,
    data: data.map((datapoint) =>
      datapoint.value ? (100 * (datapoint.count / 2)) / PEAK_SCHEDULED_SERVICE[line] : Number.NaN
    ),
  };
};
