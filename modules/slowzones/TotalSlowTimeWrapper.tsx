import type dayjs from 'dayjs';
import type { DayDelayTotals } from '../../common/types/dataPoints';
import type { LineShort, Line } from '../../common/types/lines';

import { ChartStack } from '../../common/components/charts/ChartStack';
import { TotalSlowTime } from './charts/TotalSlowTime';
import type { SlowZonesEmbedLine } from './embed';

interface TotalSlowTimeWrapperProps {
  data: DayDelayTotals[];
  startDateUTC: dayjs.Dayjs;
  endDateUTC: dayjs.Dayjs;
  line: Line;
  lineShort: Exclude<LineShort, 'Bus' | 'Commuter Rail'>;
  showTitle?: boolean;
  embedLine?: SlowZonesEmbedLine;
}

export const TotalSlowTimeWrapper = ({
  data,
  startDateUTC,
  endDateUTC,
  line,
  lineShort,
  showTitle = false,
  embedLine,
}: TotalSlowTimeWrapperProps) => {
  return (
    <ChartStack>
      <TotalSlowTime
        // Pass all data and not filtered because we can filter using the X axis of the graph.
        data={data}
        startDateUTC={startDateUTC}
        endDateUTC={endDateUTC}
        line={line}
        lineShort={lineShort}
        showTitle={showTitle}
        embedLine={embedLine}
      />
    </ChartStack>
  );
};
