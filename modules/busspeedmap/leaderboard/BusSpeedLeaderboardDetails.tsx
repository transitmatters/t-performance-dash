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
  DEFAULT_LEADERBOARD_METRIC,
  DEFAULT_PERIOD,
  DEFAULT_TIME_BAND,
  LEADERBOARD_METRICS,
  TIME_BANDS,
} from '../constants';
import type { DayType, LeaderboardMetric, LeaderboardViewMode, Period, TimeBand } from '../types';
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

  const [rankBy, setRankBy] = useState<LeaderboardMetric>(DEFAULT_LEADERBOARD_METRIC);
  const [segmentViewMode, setViewMode] = useState<LeaderboardViewMode>(DEFAULT_VIEW_MODE);
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [dayType, setDayType] = useState<DayType>(DEFAULT_DAY_TYPE);
  const [timeBand, setTimeBand] = useState<TimeBand>(DEFAULT_TIME_BAND);
  const [frequentRoutesOnly, setFrequentRoutesOnly] = useState(false);

  const metric =
    LEADERBOARD_METRICS.find((option) => option.key === rankBy) ?? LEADERBOARD_METRICS[0];
  const metricOptions = LEADERBOARD_METRICS.map(
    (option) => [option.key, option.label] as [LeaderboardMetric, string]
  );
  const selectedMetricIndex = LEADERBOARD_METRICS.indexOf(metric);

  // Segments only have a speed, so the other metrics are by route alone. The choice is kept
  // rather than reset, so going back to Speed returns to the view that was showing.
  const hasSegmentView = metric.key === 'speed';
  const viewMode = hasSegmentView ? segmentViewMode : 'route';
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
    viewMode === 'route' ? metric.rankedBy : undefined,
    metric.frequentOnly ? 'Frequent bus routes only' : undefined,
    dayTypeLabel?.label,
    viewMode === 'segment' && bandLabel ? `${bandLabel.label} · ${bandLabel.hours}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageWrapper pageTitle={'Bus rankings'}>
      <ChartPageDiv>
        <BusDataNotice />
        <WidgetDiv>
          <WidgetTitle
            title={viewMode === 'route' ? metric.title : 'Slowest segments'}
            subtitle={subtitle || undefined}
            action={
              // Metrics that rank frequent routes only have nothing for the toggle to change.
              !metric.frequentOnly && (
                <ToggleSwitch
                  enabled={frequentRoutesOnly}
                  setEnabled={setFrequentRoutesOnly}
                  label="Frequent bus routes only"
                />
              )
            }
          />
          <div className="flex flex-col gap-3">
            {/* Rank by comes first, so it stays put when the view toggle after it is hidden. */}
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              {/* Matches the shrink-0/w-auto treatment BusSpeedMapControls uses for its own
                  uneven-length pairs (day type), so neither group is squeezed by a 50/50 split
                  it doesn't need. Unlike those, Rank by is labelled on wide screens too:
                  "Speed" and "Battery-electric" alone don't say what they choose. */}
              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <span className="text-sm text-stone-600">Rank by</span>
                <ButtonGroup
                  options={metricOptions}
                  pressFunction={setRankBy}
                  selectedIndex={selectedMetricIndex}
                  line="line-bus"
                  additionalDivClass="w-auto"
                  additionalButtonClass="flex-none px-3"
                />
              </div>
              <label className="flex items-center gap-2 text-sm lg:hidden">
                <span className="text-stone-600">Rank by</span>
                <select
                  className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  value={rankBy}
                  onChange={(event) => setRankBy(event.target.value as LeaderboardMetric)}
                >
                  {LEADERBOARD_METRICS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {hasSegmentView && (
                <>
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
                </>
              )}
            </div>
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
                metric={metric}
                frequentRoutesOnly={frequentRoutesOnly || Boolean(metric.frequentOnly)}
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
