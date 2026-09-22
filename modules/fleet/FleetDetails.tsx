'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { Widget } from '../../common/components/widgets';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { FleetAgeGraphWrapper } from './FleetAgeGraphWrapper';
import { PctNewTrainsGraphWrapper } from './PctNewTrainsGraphWrapper';

dayjs.extend(utc);

export function FleetDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const fleetMetrics = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Fleet'}>
      <ChartPageDiv>
        <Widget title="% of trips run by new trains" ready={[fleetMetrics]}>
          <PctNewTrainsGraphWrapper
            data={fleetMetrics.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <Widget title="Average car age" ready={[fleetMetrics]}>
          <FleetAgeGraphWrapper
            data={fleetMetrics.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <p className="text-sm text-stone-500">
          Based on a representative sample of trips per day, not a full census of the line, so
          expect some day-to-day noise.
        </p>
      </ChartPageDiv>
    </PageWrapper>
  );
}

FleetDetails.Layout = Layout.Dashboard;
