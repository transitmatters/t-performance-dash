/* eslint-disable import/no-unused-modules */
import React, { useMemo } from 'react';

import type { Dataset } from '../../common/components/charts/TimeSeriesChart';
import { TimeSeriesChart } from '../../common/components/charts/TimeSeriesChart';
import { useDelimitatedRoute } from '../../common/utils/router';
import { LINE_COLORS } from '../../common/constants/colors';
import type { AggType } from '../speed/constants/speeds';

interface ScheduledAndDeliveredGraphProps {
  scheduled: Dataset;
  delivered: Dataset;
  valueAxisLabel: string;
  agg: AggType;
}

export const ScheduledAndDeliveredGraph: React.FC<ScheduledAndDeliveredGraphProps> = (
  props: ScheduledAndDeliveredGraphProps
) => {
  const { scheduled, delivered, valueAxisLabel, agg } = props;
  const data = useMemo(() => [scheduled, delivered], [scheduled, delivered]);
  const { line } = useDelimitatedRoute();
  const color = LINE_COLORS[line ?? 'default'];
  return (
    <TimeSeriesChart
      data={data}
      valueAxis={{ label: valueAxisLabel }}
      timeAxis={{ agg }}
      style={{ color, stepped: true, fill: true }}
    />
  );
};
