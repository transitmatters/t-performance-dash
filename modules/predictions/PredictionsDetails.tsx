'use client';

import React from 'react';
import Link from 'next/link';
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
import { Accordion } from '../../common/components/accordion/Accordion';
import { lineToDefaultRouteId } from './utils/utils';
import { PredictionsGraphWrapper } from './charts/PredictionsGraphWrapper';
import { PredictionsBinsGraphWrapper } from './charts/PredictionsBinsGraphWrapper';

dayjs.extend(utc);

enum GreenLineBranchOptions {
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
    <PageWrapper pageTitle={'Predictions'}>
      <ChartPageDiv>
        <WidgetDiv>
          {predictionsReady ? (
            <PredictionsGraphWrapper
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
        <WidgetDiv>
          {predictionsReady ? (
            <PredictionsBinsGraphWrapper
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
        <WidgetDiv>
          <Accordion
            contentList={[
              {
                title: 'About this data',
                content: (
                  <div>
                    <p>
                      MBTA calculates and publishes prediction accuracy data for each line. Whenever
                      the MBTA makes a prediction about a train or bus arrival, for example "Alewife
                      4 mins", their system records it and then checks back when that train it
                      predicted would be there in 4 minutes actually arrived. The T categorizes
                      these into 4 groups: "0-3 min", "3-6 min", "6-12 min", and "12-30 min". Each
                      grouping has different thresholds for what count as "accurate":
                    </p>
                    <ul className={'ml-7 list-disc'}>
                      <li>0-3 min: 60 seconds early to 60 seconds late</li>
                      <li>3-6 min: 90 seconds early to 120 seconds late</li>
                      <li>6-12 min: 150 seconds early to 210 seconds late</li>
                      <li>12-30 min: 240 seconds early to 360 seconds late</li>
                    </ul>
                    <br />
                    <p>
                      We receive this data in monthly batches from the{' '}
                      <Link
                        href="https://mbta-massdot.opendata.arcgis.com"
                        target="_blank"
                        className="hover:text-blue-500"
                      >
                        MassDOT Open Data Portal
                      </Link>
                      - if recent data is missing, it's likely because it's not yet available.
                    </p>
                  </div>
                ),
              },
            ]}
            size={'lg'}
          />
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

PredictionsDetails.Layout = Layout.Dashboard;
