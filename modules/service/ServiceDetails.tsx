'use client';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { useSpeedData } from '../../common/api/hooks/speed';
import { useTripCounts } from '../../common/api/hooks/service';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
dayjs.extend(utc);

export function ServiceDetails() {
  const {
    line,
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const [comparison, setComparison] = useState<'Baseline' | 'Scheduled'>('Scheduled');
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const serviceData = useSpeedData(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );

  const predictedData = useTripCounts(
    {
      start_date: startDate,
      end_date: endDate,
      route_id: lineShort,
      agg: config.agg,
    },
    enabled
  ).data;

  const serviceDataReady =
    !serviceData.isError && serviceData.data && line && config && predictedData;

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Service'}>
      <div className="flex flex-col">
        <div className="relative flex flex-col gap-4">
          <WidgetDiv>
            <WidgetTitle title="Daily Round Trips" />
            {serviceDataReady ? (
              <ServiceGraphWrapper
                data={serviceData.data}
                predictedData={predictedData}
                config={config}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={serviceData} />
              </div>
            )}
          </WidgetDiv>
          <WidgetDiv>
            <WidgetTitle title={`Service Delivered (% of ${comparison})`} />
            {serviceDataReady ? (
              <PercentageServiceGraphWrapper
                data={serviceData.data}
                predictedData={predictedData}
                config={config}
                startDate={startDate}
                endDate={endDate}
                comparison={comparison}
                setComparison={setComparison}
              />
            ) : (
              <div className="relative flex h-full">
                <ChartPlaceHolder query={serviceData} />
              </div>
            )}
          </WidgetDiv>
        </div>
      </div>
    </PageWrapper>
  );
}

ServiceDetails.Layout = Layout.Dashboard;
