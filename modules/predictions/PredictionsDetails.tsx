'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { usePredictionData } from '../../common/api/hooks/predictions';
import type { LineRouteId } from '../../common/types/lines';
import { PredictionsDetailsWrapper } from './PredictionsDetailsWrapper';
import { lineToDefaultRouteId } from './utils/utils';
dayjs.extend(utc);

export function PredictionsDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const enabled = Boolean(line);

  // TODO: Add toggle for green line
  const [routeId, setRouteId] = React.useState<LineRouteId>(lineToDefaultRouteId(line));
  React.useEffect(() => {
    setRouteId(lineToDefaultRouteId(line));
  }, [line]);

  const predictions = usePredictionData(
    {
      route_id: routeId,
    },
    enabled
  );
  const predictionsReady = predictions && line && !predictions.isError && predictions.data;
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        {predictionsReady ? (
          <PredictionsDetailsWrapper
            data={predictions.data}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="relative flex h-full">
            <ChartPlaceHolder query={predictions} />
          </div>
        )}
      </ChartPageDiv>
    </PageWrapper>
  );
}

PredictionsDetails.Layout = Layout.Dashboard;
