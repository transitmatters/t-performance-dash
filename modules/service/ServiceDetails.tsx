'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledService, useServiceHours } from '../../common/api/hooks/service';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { Widget } from '../../common/components/widgets';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { ServiceHoursGraph } from './ServiceHoursGraph';
import { DailyServiceHistogram } from './DailyServiceHistogram';

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

  const showServiceHours = line === 'line-red' || line === 'line-orange' || line === 'line-blue';

  const scheduledData = useScheduledService(
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

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Service'}>
      <ChartPageDiv>
        <Widget title="Daily round trips" ready={[tripsData, scheduledData]}>
          <ServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <Widget
          title="Service delivered"
          subtitle={`Compared to ${comparison}`}
          ready={[tripsData, scheduledData]}
        >
          <PercentageServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData!}
            config={config}
            startDate={startDate}
            endDate={endDate}
            comparison={comparison}
            setComparison={setComparison}
          />
        </Widget>
        {showServiceHours && (
          <Widget title="Hours of service" subtitle="Across all trains" ready={[serviceHoursData]}>
            <ServiceHoursGraph
              serviceHours={serviceHoursData.data!}
              agg={config.agg}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <Widget title="Scheduled service by hour" subtitle="Round trips" ready={[scheduledData]}>
          <DailyServiceHistogram scheduledService={scheduledData!} />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

ServiceDetails.Layout = Layout.Dashboard;
