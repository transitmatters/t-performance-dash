'use client';

import React, { useState } from 'react';
import { ChartPageDiv } from '../../../common/components/charts/ChartPageDiv';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { ToggleSwitch } from '../../../common/components/inputs/ToggleSwitch';
import { BusDataNotice } from '../../../common/components/notices/BusDataNotice';
import { WidgetDiv } from '../../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../../common/components/widgets/WidgetTitle';
import { Layout } from '../../../common/layouts/layoutTypes';
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
  { key: 'route', label: 'By route' },
  { key: 'segment', label: 'By segment' },
];

const DEFAULT_VIEW_MODE: LeaderboardViewMode = 'route';

export function BusSpeedLeaderboardDetails() {
  const {
    query: { date },
  } = useDelimitatedRoute();

  const [viewMode, setViewMode] = useState<LeaderboardViewMode>(DEFAULT_VIEW_MODE);
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [dayType, setDayType] = useState<DayType>(DEFAULT_DAY_TYPE);
  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [keyRoutesOnly, setKeyRoutesOnly] = useState(false);

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
    viewMode === 'route' ? 'Ranked by average speed' : undefined,
    dayTypeLabel?.label,
    viewMode === 'segment' && bandLabel ? `${bandLabel.label} · ${bandLabel.hours}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageWrapper pageTitle={'Bus speed leaderboard'}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle
            title={viewMode === 'route' ? 'Slowest routes' : 'Slowest segments'}
            subtitle={subtitle || undefined}
            action={
              <ToggleSwitch
                enabled={keyRoutesOnly}
                setEnabled={setKeyRoutesOnly}
                label="Key bus routes only"
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
              <span className="text-stone-600">Rank by</span>
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
                This {period === 'weekly' ? 'week' : 'month'} is still in progress — figures reflect
                service so far, not the full period.
              </p>
            )}
            {viewMode === 'route' ? (
              <BusSpeedRouteLeaderboardSection
                date={date}
                period={period}
                keyRoutesOnly={keyRoutesOnly}
              />
            ) : (
              <BusSpeedSegmentLeaderboardSection
                date={date}
                period={period}
                dayType={dayType}
                timeBand={timeBand}
                keyRoutesOnly={keyRoutesOnly}
              />
            )}
          </div>
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

BusSpeedLeaderboardDetails.Layout = Layout.Dashboard;
