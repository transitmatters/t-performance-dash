'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { useSpeedData } from '../../common/api/hooks/speed';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { ServiceDetailsWrapper } from './ServiceDetailsWrapper';
dayjs.extend(utc);

export default function ServiceDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
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
  const serviceDataReady = !serviceData.isError && serviceData.data && line && config;

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="relative flex flex-col gap-4">
        {serviceDataReady ? (
          <ServiceDetailsWrapper
            data={serviceData.data}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="relative flex h-full">
            <ChartPlaceHolder query={serviceData} />
          </div>
        )}
      </div>
    </div>
  );
}
