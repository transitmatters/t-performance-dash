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
import { ButtonGroup } from '../../common/components/general/ButtonGroup';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { PredictionsDetailsWrapper } from './PredictionsDetailsWrapper';
import { lineToDefaultRouteId } from './utils/utils';
dayjs.extend(utc);

export enum GreenLineBranchOptions {
  'Green-B' = 'B Branch',
  'Green-C' = 'C Branch',
  'Green-D' = 'D Branch',
  'Green-E' = 'E Branch',
}

export function PredictionsDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const enabled = Boolean(line);

  const [routeId, setRouteId] = React.useState<LineRouteId>(lineToDefaultRouteId(line));
  React.useEffect(() => {
    setRouteId(lineToDefaultRouteId(line));
  }, [line]);
  const selectedIndex = Object.keys(GreenLineBranchOptions).findIndex((route) => route === routeId);

  const greenBranchToggle = React.useMemo(() => {
    return (
      line === 'line-green' && (
        <div className={'flex w-full justify-center pt-2'}>
          <ButtonGroup
            selectedIndex={selectedIndex}
            pressFunction={setRouteId}
            options={Object.entries(GreenLineBranchOptions)}
            additionalDivClass="md:w-auto"
            additionalButtonClass="md:w-fit"
          />
        </div>
      )
    );
  }, [line, selectedIndex]);

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
        <WidgetDiv>
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
          {greenBranchToggle}
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

PredictionsDetails.Layout = Layout.Dashboard;
