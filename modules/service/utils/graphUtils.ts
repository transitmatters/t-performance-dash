import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import { CHART_COLORS } from '../../../common/constants/colors';
import type { SpeedByLine } from '../../../common/types/dataPoints';

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

/*
 * This function return ChartJS annotations for date ranges where we do not have data.
 * The range is the datapoint before and after the dates we do not have data, since that makes the block align visually.
 * We use datapoint.value as the determination as to whether there is data. It is set to null when shuttling occurs throughout a day.
 */
export const getShuttlingBlockAnnotations = (
  data: SpeedByLine[]
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
