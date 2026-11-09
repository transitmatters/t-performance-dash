'use client';

import { useState } from 'react';
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
  DEFAULT_RANK_BY,
  DEFAULT_TIME_BAND,
  RANK_BY,
  TIME_BANDS,
} from '../constants';
import type { DayType, LeaderboardRankBy, LeaderboardViewMode, Period, TimeBand } from '../types';
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
  const [rankBy, setRankBy] = useState<LeaderboardRankBy>(DEFAULT_RANK_BY);
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [dayType, setDayType] = useState<DayType>(DEFAULT_DAY_TYPE);
  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [frequentRoutesOnly, setFrequentRoutesOnly] = useState(false);

  const viewModeOptions = VIEW_MODES.map(
    (mode) => [mode.key, mode.label] as [LeaderboardViewMode, string]
  );
  const selectedViewModeIndex = VIEW_MODES.findIndex((mode) => mode.key === viewMode);
  const rankByOptions = RANK_BY.map(
    (option) => [option.key, option.label] as [LeaderboardRankBy, string]
  );
  const rankByIndex = RANK_BY.findIndex((option) => option.key === rankBy);
  const rankByOption = RANK_BY[rankByIndex];
  // Segments are only ranked by speed, and the headway measures only cover frequent routes.
  const ranksBySpeed = rankBy === 'speed';
  const view = ranksBySpeed ? viewMode : 'route';

  const bandLabel = TIME_BANDS.find((band) => band.key === timeBand);
  const dayTypeLabel =
    view === 'segment' && period !== 'daily'
      ? DAY_TYPES.find((dt) => dt.key === dayType)
      : undefined;
  const subtitle = [
    periodLabel(date, period),
    view === 'route' ? rankByOption.subtitle : undefined,
    ranksBySpeed ? undefined : 'Frequent bus routes only',
    dayTypeLabel?.label,
    view === 'segment' && bandLabel ? `${bandLabel.label} · ${bandLabel.hours}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageWrapper pageTitle={'Bus speed leaderboard'}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle
            title={view === 'route' ? rankByOption.title : 'Slowest segments'}
            subtitle={subtitle || undefined}
            action={
              ranksBySpeed && (
                <ToggleSwitch
                  enabled={frequentRoutesOnly}
                  setEnabled={setFrequentRoutesOnly}
                  label="Frequent bus routes only"
                />
              )
            }
          />
          <div className="flex flex-col gap-3">
            {/* Matches the shrink-0/w-auto treatment BusSpeedMapControls uses for its own
                uneven-length pairs (day type) -- "By route"/"By segment" would otherwise get
                squeezed by a 50/50 split it doesn't need. */}
            <div className="hidden flex-wrap items-center gap-4 lg:flex">
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-stone-600">Rank by</span>
                <ButtonGroup
                  options={rankByOptions}
                  pressFunction={setRankBy}
                  selectedIndex={rankByIndex}
                  line="line-bus"
                  additionalDivClass="w-auto"
                  additionalButtonClass="flex-none px-3"
                />
              </div>
              {ranksBySpeed && (
                <div className="shrink-0">
                  <ButtonGroup
                    options={viewModeOptions}
                    pressFunction={setViewMode}
                    selectedIndex={selectedViewModeIndex}
                    line="line-bus"
                    additionalDivClass="w-auto"
                    additionalButtonClass="flex-none px-3"
                  />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm lg:hidden">
              <span className="shrink-0 text-stone-600">Rank by</span>
              <select
                className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                value={rankBy}
                onChange={(event) => setRankBy(event.target.value as LeaderboardRankBy)}
              >
                {RANK_BY.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {ranksBySpeed && (
              <label className="flex items-center gap-2 text-sm lg:hidden">
                <span className="text-stone-600">View</span>
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
            )}
            <BusSpeedMapControls
              period={period}
              setPeriod={setPeriod}
              dayType={dayType}
              setDayType={setDayType}
              timeBand={timeBand}
              setTimeBand={setTimeBand}
              // The route view has no notion of day type or time-of-day bucketing at all --
              // its API just sums over a date range -- so these only apply to segments.
              showDayType={view === 'segment'}
              showTimeBand={view === 'segment'}
            />
            {isPeriodInProgress(date, period) && (
              <p className="text-xs text-stone-500">
                This {period === 'weekly' ? 'week' : 'month'} is still in progress — figures reflect
                service so far, not the full period.
              </p>
            )}
            {view === 'route' ? (
              <BusSpeedRouteLeaderboardSection
                date={date}
                period={period}
                rankBy={rankBy}
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
