'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../common/utils/router';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useAlertDelays } from '../../common/api/hooks/delays';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { BranchSelector } from '../../common/components/inputs/BranchSelector';
import { lineToDefaultRouteId } from '../predictions/utils/utils';
import type { LineRouteId } from '../../common/types/lines';
import { DataNotes } from '../../common/components/notices/DataNotes';
import { getFormattedTimeString } from '../../common/utils/time';
import { getDelayStats } from './utils';
import { DelayByCategoryGraph } from './charts/DelayByCategoryGraph';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { TotalDelayGraph } from './charts/TotalDelayGraph';

export function DelaysDetails() {
  const { t } = useTranslation(['delays', 'common']);
  const {
    line,
    query: { startDate, endDate, crRoute },
  } = useDelimitatedRoute();

  // For commuter rail, use the crRoute from query params; otherwise use the default route ID
  const defaultRouteId =
    line === 'line-commuter-rail' && crRoute ? crRoute : lineToDefaultRouteId(line);
  const [routeId, setRouteId] = React.useState<LineRouteId>(defaultRouteId);
  const greenBranchToggle = React.useMemo(() => {
    return line === 'line-green' && <BranchSelector routeId={routeId} setRouteId={setRouteId} />;
  }, [line, routeId]);

  React.useEffect(() => {
    const newRouteId =
      line === 'line-commuter-rail' && crRoute ? crRoute : lineToDefaultRouteId(line);
    setRouteId(newRouteId);
  }, [line, crRoute]);

  // Determine whether to use daily or weekly data based on date range
  const agg = React.useMemo(() => {
    if (!startDate || !endDate) return 'weekly';
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysDiff = end.diff(start, 'day');
    // Use daily data for 90 days or less, weekly for longer ranges
    return daysDiff <= 90 ? 'daily' : 'weekly';
  }, [startDate, endDate]);

  const enabled = Boolean(startDate && endDate && line);
  const alertDelays = useAlertDelays(
    {
      start_date: startDate,
      end_date: endDate,
      line: routeId,
      agg: agg,
    },
    enabled
  );
  if (!startDate || !endDate) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  const stats = alertDelays.data ? getDelayStats(alertDelays.data, agg) : null;

  const deltaFor = (delta: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment = Math.abs(delta) <= 1 ? 'flat' : delta < 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
    return {
      label: t(`common:stats.delta.${word}`, {
        delta: `${sign}${getFormattedTimeString(delta, 'minutes')}`,
      }),
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={t('common:pages.delays.name')}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgDelay) && (
          <StatCardGrid>
            <StatCard
              label={t('totalDelayed')}
              value={getFormattedTimeString(stats.totalDelay, 'minutes')}
            />
            <StatCard
              label={stats.agg === 'weekly' ? t('stats.avgPerWeek') : t('stats.avgPerDay')}
              value={getFormattedTimeString(stats.avgDelay, 'minutes')}
              delta={deltaFor(stats.avgDelayDelta)}
            />
            {stats.topReasonLabel && stats.topReasonShare != null && (
              <StatCard
                label={stats.topReasonLabel}
                value={`${Math.round(stats.topReasonShare * 100)}%`}
                unit={t('stats.ofDelayTime')}
              />
            )}
          </StatCardGrid>
        )}
        <Widget
          title={t('totalDelayed')}
          subtitle={agg === 'weekly' ? t('widgets.perWeek') : t('widgets.perDay')}
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <TotalDelayGraph
            data={alertDelays.data!}
            startDate={startDate}
            endDate={endDate}
            agg={agg}
          />
        </Widget>
        <Widget
          title={t('widgets.byReason')}
          subtitle={t('widgets.overTime')}
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayBreakdownGraph
            data={alertDelays.data!}
            startDate={startDate}
            endDate={endDate}
            agg={agg}
          />
        </Widget>
        <Widget
          title={t('widgets.byReason')}
          subtitle={t('widgets.periodTotal')}
          ready={[alertDelays]}
          action={greenBranchToggle}
        >
          <DelayByCategoryGraph data={alertDelays.data!} />
        </Widget>
        <DataNotes>
          <p>{t('notes.body')}</p>
          <div>
            <h4 className="font-semibold">{t('notes.examples')}</h4>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <Trans
                t={t}
                i18nKey="notes.example.blue"
                components={{
                  line: (
                    <span className="animate-text bg-clip-text text-mbta-blue shadow-none transition-shadow duration-300" />
                  ),
                  duration: (
                    <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                  reason: (
                    <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                }}
              />
            </blockquote>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <Trans
                t={t}
                i18nKey="notes.example.orange"
                components={{
                  line: (
                    <span className="animate-text bg-clip-text text-mbta-orange shadow-none transition-shadow duration-300" />
                  ),
                  duration: (
                    <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                  reason: (
                    <span className="animate-text bg-red-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                }}
              />
            </blockquote>
            <blockquote className="my-2 border-s-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
              <Trans
                t={t}
                i18nKey="notes.example.green"
                components={{
                  line: (
                    <span className="animate-text bg-clip-text text-mbta-green shadow-none transition-shadow duration-300" />
                  ),
                  duration: (
                    <span className="animate-text bg-linear-to-r from-red-500 to-blue-500 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                  reason: (
                    <span className="animate-text bg-yellow-400 bg-clip-text font-semibold text-transparent shadow-none transition-shadow duration-300" />
                  ),
                }}
              />
            </blockquote>
          </div>
        </DataNotes>
      </ChartPageDiv>
    </PageWrapper>
  );
}
