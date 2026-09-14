'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { usePredictionData } from '../../common/api/hooks/predictions';
import type { LineRouteId } from '../../common/types/lines';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { prettyDate } from '../../common/utils/date';
import { getPredictionStats, lineToDefaultRouteId } from './utils/utils';
import { PredictionsGraphWrapper } from './charts/PredictionsGraphWrapper';
import { PredictionsBinsGraphWrapper } from './charts/PredictionsBinsGraphWrapper';

dayjs.extend(utc);

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

  const greenBranchToggle = React.useMemo(() => {
    return line === 'line-green' && <BranchSelector routeId={routeId} setRouteId={setRouteId} />;
  }, [line, routeId]);

  const predictions = usePredictionData(
    {
      route_id: routeId,
    },
    enabled
  );
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = predictions.data?.length ? getPredictionStats(predictions.data) : null;
  const accuracyDelta = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const negligible = 0.005;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    return { label: `${delta > 0 ? '+' : ''}${Math.round(delta * 100)}pp · ${word}`, sentiment };
  };

  return (
    <PageWrapper pageTitle={'Predictions'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.overallAccuracy) && (
          <StatCardGrid>
            <StatCard
              label="Prediction accuracy"
              value={`${Math.round(stats.overallAccuracy * 100)}%`}
              delta={accuracyDelta(stats.accuracyDelta)}
            />
            <StatCard
              label="Best week"
              value={
                Number.isFinite(stats.peakAccuracy)
                  ? `${Math.round(stats.peakAccuracy * 100)}%`
                  : '—'
              }
              unit={prettyDate(stats.peakDate, false)}
            />
            <StatCard
              label="Worst week"
              value={
                Number.isFinite(stats.worstAccuracy)
                  ? `${Math.round(stats.worstAccuracy * 100)}%`
                  : '—'
              }
              unit={prettyDate(stats.worstDate, false)}
            />
          </StatCardGrid>
        )}
        <Widget
          title="Arrival predictions"
          subtitle="Share of predictions that were accurate"
          ready={[predictions]}
          action={greenBranchToggle}
        >
          <PredictionsGraphWrapper
            data={predictions.data!}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <Widget
          title="Arrival predictions by bin"
          subtitle="Accuracy by how far out the prediction was made"
          ready={[predictions]}
          action={greenBranchToggle}
        >
          <PredictionsBinsGraphWrapper
            data={predictions.data!}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <DataNotes>
          <p>
            MBTA calculates and publishes prediction accuracy data for each line. Whenever the MBTA
            makes a prediction about a train or bus arrival, for example "Alewife 4 mins", their
            system records it and then checks back when that train it predicted would be there in 4
            minutes actually arrived. The T categorizes these into 4 groups: "0-3 min", "3-6 min",
            "6-12 min", and "12-30 min". Each grouping has different thresholds for what count as
            "accurate":
          </p>
          <ul className="ml-7 list-disc">
            <li>0-3 min: 60 seconds early to 60 seconds late</li>
            <li>3-6 min: 90 seconds early to 120 seconds late</li>
            <li>6-12 min: 150 seconds early to 210 seconds late</li>
            <li>12-30 min: 240 seconds early to 360 seconds late</li>
          </ul>
          <p>
            We receive this data in monthly batches from the{' '}
            <Link href="https://mbta-massdot.opendata.arcgis.com" target="_blank">
              MassDOT Open Data Portal
            </Link>{' '}
            — if recent data is missing, it's likely because it's not yet available.
          </p>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}

PredictionsDetails.Layout = Layout.Dashboard;
