import { PEAK_COMPLETE_TRIP_TIMES } from '../../common/constants/baselines';
import { LINE_COLORS } from '../../common/constants/colors';
import type { SpeedDataPoint } from '../../common/types/dataPoints';

export const convertToChartJSDataSet = (data: SpeedDataPoint[]) => {
  const { line } = data[0];

  return {
    label: `% of baseline`,
    borderColor: LINE_COLORS[line ?? 'default'],
    pointBackgroundColor: 'transparent',
    pointBorderWidth: 0,
    tension: 0.5,
    pointHoverRadius: 8,
    spanGaps: false,
    pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
    data: data.map((datapoint) =>
      datapoint.value
        ? (
            100 *
            (1000 / datapoint.value / (1000 / PEAK_COMPLETE_TRIP_TIMES[line ?? 'DEFAULT'].value))
          ).toFixed(1)
        : Number.NaN
    ),
  };
};
