'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../../common/i18n';
import { ChartPageDiv } from '../../../common/components/charts/ChartPageDiv';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { ToggleSwitch } from '../../../common/components/inputs/ToggleSwitch';
import { BusDataNotice } from '../../../common/components/notices/BusDataNotice';
import { WidgetDiv } from '../../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../../common/components/widgets/WidgetTitle';
import { PageWrapper } from '../../../common/layouts/PageWrapper';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { BusSpeedMapControls } from '../controls/BusSpeedMapControls';
import {
  DAY_TYPES,
  DEFAULT_DAY_TYPE,
  DEFAULT_PERIOD,
  DEFAULT_TIME_BAND,
  TIME_BANDS,
} from '../constants';
import type { DayType, LeaderboardViewMode, Period, TimeBand } from '../types';
import { isPeriodInProgress, periodLabel } from '../utils';
import { BusSpeedRouteLeaderboardSection } from './BusSpeedRouteLeaderboardSection';
import { BusSpeedSegmentLeaderboardSection } from './BusSpeedSegmentLeaderboardSection';

const VIEW_MODES: { key: LeaderboardViewMode; label: string }[] = [
  { key: 'route', label: i18n.t('busspeedmap:leaderboard.byRoute') },
  { key: 'segment', label: i18n.t('busspeedmap:leaderboard.bySegment') },
];

const DEFAULT_VIEW_MODE: LeaderboardViewMode = 'route';

export function BusSpeedLeaderboardDetails() {
  const { t } = useTranslation(['busspeedmap', 'common']);
  const {
    query: { date },
  } = useDelimitatedRoute();

  const [viewMode, setViewMode] = useState<LeaderboardViewMode>(DEFAULT_VIEW_MODE);
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [dayType, setDayType] = useState<DayType>(DEFAULT_DAY_TYPE);
  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [frequentRoutesOnly, setFrequentRoutesOnly] = useState(false);

  const viewModeOptions = VIEW_MODES.map(
    (mode) => [mode.key, mode.label] as [LeaderboardViewMode, string]
  );
  const selectedViewModeIndex = VIEW_MODES.findIndex((mode) => mode.key === viewMode);

  const bandLabel = TIME_BANDS.find((band) => band.key === timeBand);
  const dayTypeLabel =
    viewMode === 'segment' && period !== 'daily'
      ? DAY_TYPES.find((dt) => dt.key === dayType)
      : undefined;
  const subtitle = [
    periodLabel(date, period),
    viewMode === 'route' ? t('leaderboard.rankedBySpeed') : undefined,
    dayTypeLabel?.label,
    viewMode === 'segment' && bandLabel ? `${bandLabel.label} · ${bandLabel.hours}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageWrapper pageTitle={t('common:pages.leaderboard.title')}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle
            title={
              viewMode === 'route'
                ? t('leaderboard.slowestRoutes')
                : t('leaderboard.slowestSegments')
            }
            subtitle={subtitle || undefined}
            action={
              <ToggleSwitch
                enabled={frequentRoutesOnly}
                setEnabled={setFrequentRoutesOnly}
                label={t('leaderboard.frequentOnly')}
              />
            }
          />
          <div className="flex flex-col gap-3">
            {/* Matches the shrink-0/w-auto treatment BusSpeedMapControls uses for its own
                uneven-length pairs (day type) -- "By route"/"By segment" would otherwise get
                squeezed by a 50/50 split it doesn't need. */}
            <div className="hidden shrink-0 lg:block">
              <ButtonGroup
                options={viewModeOptions}
                pressFunction={setViewMode}
                selectedIndex={selectedViewModeIndex}
                line="line-bus"
                additionalDivClass="w-auto"
                additionalButtonClass="flex-none px-3"
              />
            </div>
            <label className="flex items-center gap-2 text-sm lg:hidden">
              <span className="text-stone-600">{t('leaderboard.rankBy')}</span>
              <select
                className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                value={viewMode}
                onChange={(event) => setViewMode(event.target.value as LeaderboardViewMode)}
              >
                {VIEW_MODES.map((mode) => (
                  <option key={mode.key} value={mode.key}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
            <BusSpeedMapControls
              period={period}
              setPeriod={setPeriod}
              dayType={dayType}
              setDayType={setDayType}
              timeBand={timeBand}
              setTimeBand={setTimeBand}
              // The route view has no notion of day type or time-of-day bucketing at all --
              // its API just sums over a date range -- so these only apply to segments.
              showDayType={viewMode === 'segment'}
              showTimeBand={viewMode === 'segment'}
            />
            {isPeriodInProgress(date, period) && (
              <p className="text-xs text-stone-500">
                {period === 'weekly' ? t('inProgress.week') : t('inProgress.month')}
              </p>
            )}
            {viewMode === 'route' ? (
              <BusSpeedRouteLeaderboardSection
                date={date}
                period={period}
                frequentRoutesOnly={frequentRoutesOnly}
              />
            ) : (
              <BusSpeedSegmentLeaderboardSection
                date={date}
                period={period}
                dayType={dayType}
                timeBand={timeBand}
                frequentRoutesOnly={frequentRoutesOnly}
              />
            )}
          </div>
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}
