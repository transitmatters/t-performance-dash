'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../../common/components/general/Link';
import { useDelimitatedRoute } from '../../common/utils/router';
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
  const { t } = useTranslation(['predictions', 'common']);
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
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  const stats = predictions.data?.length ? getPredictionStats(predictions.data) : null;
  const accuracyDelta = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const negligible = 0.005;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const points = t('common:stats.comparison.percentagePoints', {
      value: Math.round(delta * 100),
    });
    return {
      label: t(`common:stats.delta.${word}`, { delta: `${delta > 0 ? '+' : ''}${points}` }),
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={t('common:pages.predictions.name')}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.overallAccuracy) && (
          <StatCardGrid>
            <StatCard
              label={t('stats.accuracy')}
              value={`${Math.round(stats.overallAccuracy * 100)}%`}
              delta={accuracyDelta(stats.accuracyDelta)}
            />
            <StatCard
              label={t('stats.bestWeek')}
              value={
                Number.isFinite(stats.peakAccuracy)
                  ? `${Math.round(stats.peakAccuracy * 100)}%`
                  : '—'
              }
              unit={prettyDate(stats.peakDate, false)}
            />
            <StatCard
              label={t('stats.worstWeek')}
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
          title={t('widgets.accuracy.title')}
          subtitle={t('widgets.accuracy.subtitle')}
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
          title={t('widgets.bins.title')}
          subtitle={t('widgets.bins.subtitle')}
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
          <p>{t('notes.method')}</p>
          <ul className="ml-7 list-disc">
            <li>{t('notes.thresholds.0to3')}</li>
            <li>{t('notes.thresholds.3to6')}</li>
            <li>{t('notes.thresholds.6to12')}</li>
            <li>{t('notes.thresholds.12to30')}</li>
          </ul>
          <p>
            <Trans
              t={t}
              i18nKey="notes.source"
              components={{
                portal: <Link href="https://mbta-massdot.opendata.arcgis.com" target="_blank" />,
              }}
            />
          </p>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
