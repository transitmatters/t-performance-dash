import { useSearch } from '@tanstack/react-router';
import dayjs from 'dayjs';

import { useScheduledService } from '../../common/api/hooks/service';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { LinePath } from '../../common/types/lines';
import { normalizeDateParams } from '../../common/utils/dateParams';
import { useDelimitatedRoute } from '../../common/utils/router';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { SERVICE_COMPARISON_LABELS, getServiceDeliveredTitle, getServicePageUrl } from './embed';

interface ServiceDeliveredEmbedProps {
  line: LinePath;
}

/** The service delivered chart on its own, for iframing into articles. */
export const ServiceDeliveredEmbed = ({ line }: ServiceDeliveredEmbedProps) => {
  const search = useSearch({ from: '/embed/$line/service/delivered' });
  const { line: lineKey, lineShort } = useDelimitatedRoute();
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const dates =
    normalizeDateParams({ section: 'line', tab: 'Subway', page: 'service', search }) ?? search;
  const startDate = dates.startDate as string;
  const endDate = dates.endDate as string;
  const comparison = search.compare ?? 'scheduled';

  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && lineKey && config.agg);
  const tripsData = useDeliveredTripMetrics(
    { start_date: startDate, end_date: endDate, agg: config.agg, line: lineKey },
    enabled
  );
  const scheduledData = useScheduledService(
    { start_date: startDate, end_date: endDate, route_id: lineShort, agg: config.agg },
    enabled
  );

  const when = `${dayjs(startDate).format(PRETTY_DATE_FORMAT)} – ${dayjs(endDate).format(PRETTY_DATE_FORMAT)}`;
  return (
    <EmbedFrame
      title={getServiceDeliveredTitle(line)}
      subtitle={`Compared to ${SERVICE_COMPARISON_LABELS[comparison].toLowerCase()} · ${when}`}
      href={getServicePageUrl(line, { startDate, endDate, comparison })}
    >
      {tripsData.data && scheduledData.data ? (
        <PercentageServiceGraphWrapper
          data={tripsData.data}
          predictedData={scheduledData.data}
          config={config}
          startDate={startDate}
          endDate={endDate}
          comparison={comparison}
          fill
        />
      ) : (
        <ChartPlaceHolder query={tripsData.isError ? tripsData : scheduledData} />
      )}
    </EmbedFrame>
  );
};
