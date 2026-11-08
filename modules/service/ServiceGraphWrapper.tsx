import type { DeliveredTripMetrics, ScheduledService } from '../../common/types/dataPoints';
import type { ParamsType } from '../speed/constants/speeds';
import { ChartStack } from '../../common/components/charts/ChartStack';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { ServiceGraph } from './ServiceGraph';

interface ServiceGraphWrapperProps {
  data: DeliveredTripMetrics[];
  predictedData: ScheduledService;
  config: ParamsType;
  startDate: string;
  endDate: string;
  /** Fill the parent's height and leave out the buttons, as an embed does. */
  fill?: boolean;
}

// The average/peak KPIs now live in the page's stat-card row (see ServiceDetails), so the chart
// no longer carries an in-plot carousel value — just the graph.
export const ServiceGraphWrapper = ({
  data,
  predictedData,
  config,
  startDate,
  endDate,
  fill = false,
}: ServiceGraphWrapperProps) => {
  if (!data.some((datapoint) => datapoint.miles_covered))
    return <NoDataNotice isLineMetric shutdownScope="line" />;

  return (
    <ChartStack className={fill ? 'h-full' : undefined}>
      <ServiceGraph
        config={config}
        data={data}
        startDate={startDate}
        endDate={endDate}
        predictedData={predictedData}
        fill={fill}
      />
    </ChartStack>
  );
};
