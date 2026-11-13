import { useMemo } from 'react';
import type { ComponentProps } from 'react';

import type { Benchmark, Block, Dataset } from '../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../common/components/charts/TimeSeriesChart';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LINE_COLORS } from '../../common/constants/colors';
import { useMajorEvents } from '../../common/utils/majorEvents';
import type { AggType } from '../speed/constants/speeds';

interface ScheduledAndDeliveredGraphProps {
  scheduled: Dataset;
  delivered: Dataset;
  startDate: string;
  endDate: string;
  valueAxisLabel: string;
  agg: AggType;
  benchmarks?: Benchmark[];
  blocks?: Block[];
  hoverCard?: ComponentProps<typeof TimeSeriesChart>['hoverCard'];
  fill?: boolean;
  chartRef?: ComponentProps<typeof TimeSeriesChart>['chartRef'];
}

export const ScheduledAndDeliveredGraph = (props: ScheduledAndDeliveredGraphProps) => {
  const {
    scheduled,
    delivered,
    valueAxisLabel,
    agg,
    startDate,
    endDate,
    benchmarks,
    blocks,
    hoverCard,
    fill,
    chartRef,
  } = props;
  const data = useMemo(() => [scheduled, delivered], [scheduled, delivered]);
  const { line, colorKey } = useDelimitatedRoute();
  const color = LINE_COLORS[colorKey ?? 'default'];
  const events = useMajorEvents(line, startDate, endDate);

  return (
    <TimeSeriesChart
      data={data}
      valueAxis={{ min: 0, label: valueAxisLabel }}
      timeAxis={{ agg, from: startDate, to: endDate }}
      style={{ color, stepped: true, fill: true }}
      benchmarks={benchmarks}
      blocks={blocks}
      hoverCard={hoverCard}
      fill={fill}
      events={events}
      chartRef={chartRef}
    />
  );
};
