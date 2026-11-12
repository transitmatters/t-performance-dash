import type dayjs from 'dayjs';
import type { Direction, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LinePath, LineShort } from '../../common/types/lines';
import { useFilteredAllSlow, useFormatSegments } from '../../common/utils/slowZoneUtils';
import { LineSegments } from './charts/LineSegments';

interface SlowZonesSegmentsWrapper {
  data: SlowZoneResponse[];
  lineShort: LineShort;
  linePath: LinePath;
  endDateUTC: dayjs.Dayjs;
  startDateUTC: dayjs.Dayjs;
  direction: Direction;
}

export const SlowZonesSegmentsWrapper = ({
  data,
  lineShort,
  linePath,
  endDateUTC,
  startDateUTC,
  direction,
}: SlowZonesSegmentsWrapper) => {
  const filteredAllSlow = useFilteredAllSlow(data, startDateUTC, endDateUTC, lineShort);
  const allSlowGraphData = useFormatSegments(filteredAllSlow, startDateUTC, direction);
  return (
    <LineSegments
      data={allSlowGraphData}
      linePath={linePath}
      startDateUTC={startDateUTC}
      endDateUTC={endDateUTC}
      direction={direction}
    />
  );
};
