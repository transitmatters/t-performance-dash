import React, { useMemo } from 'react';

import type { Benchmark, Block, Dataset } from '../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../common/components/charts/TimeSeriesChart';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LINE_COLORS } from '../../common/constants/colors';
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
}

export const ScheduledAndDeliveredGraph: React.FC<ScheduledAndDeliveredGraphProps> = (
  props: ScheduledAndDeliveredGraphProps
) => {
  const { scheduled, delivered, valueAxisLabel, agg, startDate, endDate, benchmarks, blocks } =
    props;
  const data = useMemo(() => [scheduled, delivered], [scheduled, delivered]);
  const { line } = useDelimitatedRoute();
  const color = LINE_COLORS[line ?? 'default'];

  return (
    <TimeSeriesChart
      data={data}
      valueAxis={{ min: 0, label: valueAxisLabel }}
      timeAxis={{ agg, from: startDate, to: endDate }}
      style={{ color, stepped: true, fill: true }}
      benchmarks={benchmarks}
      blocks={blocks}
    />
  );
};
