import { useMemo } from 'react';
import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledServiceBaseline } from '../../common/api/hooks/baselines';
import type { ParamsType } from '../speed/constants/speeds';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { PercentageServiceGraph } from './PercentageServiceGraph';
import { getPercentageData } from './utils/utils';
import { type ServiceComparison, SERVICE_COMPARISON_LABELS } from './embed';
import { ServiceEmbedButton } from './ServiceEmbedButton';

interface PercentageServiceGraphWrapperProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
  comparison: ServiceComparison;
  /** Fill the parent's height, as an embed does. */
  fill?: boolean;
}

// The "% delivered" KPI now lives in the page's stat-card row (see ServiceDetails), so the chart
// no longer carries an in-plot carousel value — just the graph.
export const PercentageServiceGraphWrapper = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  comparison,
  fill = false,
}: PercentageServiceGraphWrapperProps) => {
  const { line } = useDelimitatedRoute();
  const peakService = useScheduledServiceBaseline(line);

  const { scheduled, peak } = useMemo(
    () => getPercentageData(data, predictedData, peakService, config.agg),
    [data, predictedData, peakService, config.agg]
  );

  if (!data.some((datapoint) => datapoint.miles_covered))
    return <NoDataNotice isLineMetric shutdownScope="line" />;

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <PercentageServiceGraph
        config={config}
        data={data}
        calculatedData={{ scheduled: scheduled, peak: peak }}
        startDate={startDate}
        endDate={endDate}
        comparison={SERVICE_COMPARISON_LABELS[comparison]}
        fill={fill}
        embed={<ServiceEmbedButton chart="delivered" />}
      />
    </ChartStack>
  );
};
