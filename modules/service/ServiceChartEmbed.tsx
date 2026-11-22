import { useSearch } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { useScheduledService, useServiceHours } from '../../common/api/hooks/service';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { ServiceEmbedChart } from '../../common/constants/staticRoutes';
import type { LinePath } from '../../common/types/lines';
import { useLinePage } from '../../common/hooks/usePageParams';
import { canonicalDateRange } from '../../common/utils/dateParams';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { DailyServiceHistogram } from './DailyServiceHistogram';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { ServiceHoursGraph } from './ServiceHoursGraph';
import {
  SERVICE_COMPARISON_LABELS,
  SERVICE_DAY_LABELS,
  getServiceEmbedTitle,
  getServicePageUrl,
} from './embed';

interface ServiceChartEmbedProps {
  line: LinePath;
  chart: ServiceEmbedChart;
}

/** One Service page chart on its own, for iframing into articles. */
export const ServiceChartEmbed = ({ line, chart }: ServiceChartEmbedProps) => {
  const search = useSearch({ from: '/embed/$line/service/$chart' });
  const { line: lineKey, lineShort } = useLinePage();
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const { startDate, endDate } = canonicalDateRange({
    section: 'line',
    tab: 'Subway',
    page: 'service',
    search,
  });
  const comparison = search.compare ?? 'scheduled';
  const day = search.day ?? 'weekday';

  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const range = { start_date: startDate, end_date: endDate, agg: config.agg };
  const usesTrips = chart === 'round-trips' || chart === 'delivered';
  const tripsData = useDeliveredTripMetrics({ ...range, line: lineKey }, usesTrips);
  const scheduledData = useScheduledService({ ...range, route_id: lineShort }, chart !== 'hours');
  const serviceHours = useServiceHours({ ...range, line_id: lineKey }, chart === 'hours');

  const renderChart = () => {
    const needed = usesTrips
      ? [tripsData, scheduledData]
      : [chart === 'hours' ? serviceHours : scheduledData];
    const notReady = needed.find((query) => query.isError) ?? needed.find((query) => !query.data);
    if (notReady) return <ChartPlaceHolder query={notReady} />;
    const props = { config, startDate, endDate, fill: true };
    switch (chart) {
      case 'round-trips':
        return (
          <ServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData.data!}
            {...props}
          />
        );
      case 'delivered':
        return (
          <PercentageServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData.data!}
            comparison={comparison}
            {...props}
          />
        );
      case 'hours':
        return (
          <ServiceHoursGraph
            serviceHours={serviceHours.data!}
            agg={config.agg}
            startDate={startDate}
            endDate={endDate}
            fill
          />
        );
      case 'by-hour':
        return <DailyServiceHistogram scheduledService={scheduledData.data!} dayKind={day} fill />;
    }
  };

  const when = `${dayjs(startDate).format(PRETTY_DATE_FORMAT)} – ${dayjs(endDate).format(PRETTY_DATE_FORMAT)}`;
  const detail = {
    'round-trips': undefined,
    delivered: `Compared to ${SERVICE_COMPARISON_LABELS[comparison].toLowerCase()}`,
    hours: 'Across all trains',
    'by-hour': `${SERVICE_DAY_LABELS[day]} round trips`,
  }[chart];

  return (
    <EmbedFrame
      title={getServiceEmbedTitle(line, chart)}
      subtitle={[detail, when].filter(Boolean).join(' · ')}
      href={getServicePageUrl(line, chart, { ...search, startDate, endDate })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
