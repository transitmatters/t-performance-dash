'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { useScheduledService, useServiceHours } from '../../common/api/hooks/service';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { ServiceHoursGraph } from './ServiceHoursGraph';

dayjs.extend(utc);

export function ServiceDetails() {
  const {
    line,
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const [comparison, setComparison] = useState<'Historical Maximum' | 'Scheduled'>('Scheduled');
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

  const predictedData = useScheduledService(
    {
      start_date: startDate,
      end_date: endDate,
      route_id: lineShort,
      agg: config.agg,
    },
    enabled
  ).data;

  const serviceHoursData = useServiceHours(
    {
      start_date: startDate,
      end_date: endDate,
      line_id: line,
      agg: config.agg,
    },
    enabled
  );

  const serviceDataReady = !tripsData.isError && tripsData.data && line && config && predictedData;
  const serviceHoursDataReady = !serviceHoursData.isError && serviceHoursData.data;

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Service'}>
      <ChartPageDiv>
        <WidgetDiv>
          <WidgetTitle title="Daily round trips" />
          {serviceDataReady ? (
            <ServiceGraphWrapper
              data={tripsData.data}
              predictedData={predictedData}
              config={config}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={tripsData} />
            </div>
          )}
        </WidgetDiv>
        <WidgetDiv>
          <WidgetTitle title={`Service delivered`} subtitle={`Compared to ${comparison}`} />
          {serviceDataReady ? (
            <PercentageServiceGraphWrapper
              data={tripsData.data}
              predictedData={predictedData}
              config={config}
              startDate={startDate}
              endDate={endDate}
              comparison={comparison}
              setComparison={setComparison}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={tripsData} />
            </div>
          )}
        </WidgetDiv>
        <WidgetDiv>
          <WidgetTitle title="Hours of service" subtitle="Across all trains" />
          {serviceHoursDataReady ? (
            <ServiceHoursGraph
              serviceHours={serviceHoursData.data!}
              agg={config.agg}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={serviceHoursData} />
            </div>
          )}
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

ServiceDetails.Layout = Layout.Dashboard;
