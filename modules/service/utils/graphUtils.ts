import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import dayjs from 'dayjs';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { AlertForModal } from '../../../common/types/alerts';
import { hexWithAlpha } from '../../../common/utils/general';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { TODAY } from '../../../common/constants/dates';

const shuttlingAnnotationBlockStyle = {
  backgroundColor: CHART_COLORS.BLOCKS,
  borderWidth: 0,
  label: {
    content: 'No data',
    rotation: -90,
    color: 'white',
    display: true,
  },
};

const alertAnnotationBlockStyle = {
  backgroundColor: hexWithAlpha('#fef08a', 0.5),
  borderColor: 'transparent',
};

/*
 * This function return ChartJS annotations for date ranges where we do not have data.
 * The range is the datapoint before and after the dates we do not have data, since that makes the block align visually.
 * We use datapoint.value as the determination as to whether there is data. It is set to null when shuttling occurs throughout a day.
 */
export const getShuttlingBlockAnnotations = (
  data: DeliveredTripMetrics[]
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  let xMin: string | undefined;
  let xMax: string | undefined;
  let insideShuttlingBlock = false;
  const dateBlocks: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  data.forEach((datapoint, index) => {
    if (!datapoint.miles_covered) {
      if (!insideShuttlingBlock) xMin = index > 0 ? data[index - 1].date : undefined;
      xMax = index + 1 < data.length ? data[index + 1].date : undefined;
      insideShuttlingBlock = true;
    }
    if (insideShuttlingBlock && (datapoint.miles_covered || index + 1 === data.length)) {
      dateBlocks.push({
        type: 'box',
        xMin: xMin,
        xMax: xMax,
        ...shuttlingAnnotationBlockStyle,
      });
      insideShuttlingBlock = false;
    }
  });
  return dateBlocks;
};

/*
 * This function return ChartJS annotations from a date to TODAY.
 * Great for datasets that are delivered with a week or month delay
 */
export const getRemainingBlockAnnotation = (
  xMin: string | undefined
): AnnotationOptions<keyof AnnotationTypeRegistry>[] => {
  const xMax: string | undefined = TODAY.toString();

  return [
    {
      type: 'box',
      xMin: xMin,
      xMax: xMax,
      ...shuttlingAnnotationBlockStyle,
      label: {
        content: 'Data not ready',
        rotation: -90,
        color: 'white',
        display: true,
      },
    },
  ];
};

export const getAlertAnnotations = (alerts: AlertForModal[], date: string) => {
  const dateBlocks: AnnotationOptions<keyof AnnotationTypeRegistry>[] = [];
  const ESTDate = dayjs(date);
  alerts.forEach((alert) => {
    const from = dayjs(alert.valid_from).isBefore(ESTDate.set('hour', 5).set('minute', 30))
      ? ESTDate.set('hour', 5).set('minute', 30).format('YYYY-MM-DDTHH:mm:ss')
      : alert.valid_from;
    const to = dayjs(alert.valid_to).isAfter(ESTDate.add(1, 'day').set('hour', 1).set('minute', 0))
      ? ESTDate.add(1, 'day').set('hour', 1).set('minute', 0).format('YYYY-MM-DDTHH:mm:ss')
      : alert.valid_to;
    dateBlocks.push({
      type: 'box',
      xMin: alert ? from : undefined,
      xMax: alert ? to : undefined,
      ...alertAnnotationBlockStyle,
    });
  });
  return dateBlocks;
};
