import React from 'react';
import dayjs from 'dayjs';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useScheduledService } from '../../common/api/hooks/service';
import { OVERVIEW_OPTIONS, TODAY_STRING } from '../../common/constants/dates';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { HomescreenWidgetTitle } from '../dashboard/HomescreenWidgetTitle';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';

export const ServiceWidget: React.FC = () => {
  const { line, query, lineShort } = useDelimitatedRoute();
  const { startDate, agg } = OVERVIEW_OPTIONS[query.view ?? 'year'];
  const endDate = TODAY_STRING;
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const tripsData = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );
  const predictedServiceData = useScheduledService({
    start_date: startDate,
    end_date: endDate,
    route_id: lineShort,
    agg: agg,
  }).data;

  const serviceReady = !tripsData.isError && tripsData.data && line && predictedServiceData;

  return (
    <WidgetDiv>
      <HomescreenWidgetTitle title="Service" tab="service" />
      {serviceReady ? (
        <ServiceGraphWrapper
          data={tripsData.data}
          predictedData={predictedServiceData}
          config={config}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <ChartPlaceHolder query={tripsData} />
      )}
    </WidgetDiv>
  );
};
