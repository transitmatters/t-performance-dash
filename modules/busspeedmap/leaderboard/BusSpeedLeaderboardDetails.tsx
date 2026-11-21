'use client';

import { useState } from 'react';
import { ChartPageDiv } from '../../../common/components/charts/ChartPageDiv';
import { ToggleSwitch } from '../../../common/components/inputs/ToggleSwitch';
import { WidgetDiv } from '../../../common/components/widgets/WidgetDiv';
import { WidgetTitle } from '../../../common/components/widgets/WidgetTitle';
import { SelectedBusRouteScope } from '../../../common/hooks/useChartBusRoute';
import { ToggleControl } from '../../../common/hooks/useChartToggle';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { BusSpeedDataNotes } from '../BusSpeedDataNotes';
import { DAY_TYPES, TIME_BANDS } from '../constants';
import { InProgressBadge } from '../InProgressBadge';
import { useDayType, useRankings, useShownPeriod, useTimeBand } from '../useBusSpeedParams';
import { BusSpeedRouteLeaderboardSection } from './BusSpeedRouteLeaderboardSection';
import { BusSpeedSegmentLeaderboardSection } from './BusSpeedSegmentLeaderboardSection';

export function BusSpeedLeaderboardDetails() {
  const {
    query: { date },
  } = useDelimitatedRoute();

  const { rankBy, view, metric, hasSegmentView, viewMode } = useRankings();
  const { shown: period } = useShownPeriod();
  const { value: dayType } = useDayType();
  const { value: timeBand } = useTimeBand();
  const [frequentRoutesOnly, setFrequentRoutesOnly] = useState(false);

  const bandLabel = TIME_BANDS.find((band) => band.key === timeBand);
  const dayTypeLabel =
    viewMode === 'segment' && period !== 'daily'
      ? DAY_TYPES.find((dt) => dt.key === dayType)
      : undefined;
  const subtitle = [
    viewMode === 'route' ? metric.rankedBy : undefined,
    metric.frequentOnly ? 'Frequent bus routes only' : undefined,
    dayTypeLabel?.label,
    viewMode === 'segment' && bandLabel ? `${bandLabel.label} · ${bandLabel.hours}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {/* Ranks every route, so no chart here is about the route picked in the header. */}
      <SelectedBusRouteScope shown={false}>
        <ChartPageDiv>
          <WidgetDiv>
            <WidgetTitle
              title={
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {viewMode === 'route' ? metric.title : 'Slowest segments'}
                  <InProgressBadge date={date} period={period} />
                </span>
              }
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
              {/* Rank by comes first, so it stays put when the view toggle after it is hidden. It's
                  labelled: "Speed" and "Battery-electric" alone don't say what they choose. */}
              <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-600 dark:text-stone-400">Rank by</span>
                  <ToggleControl
                    value={rankBy.value}
                    options={rankBy.options}
                    onChange={rankBy.setValue}
                  />
                </div>
                {hasSegmentView && (
                  <ToggleControl
                    variant="toggle"
                    value={view.value}
                    options={view.options}
                    onChange={view.setValue}
                  />
                )}
              </div>
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
          <BusSpeedDataNotes />
        </ChartPageDiv>
      </SelectedBusRouteScope>
    </>
  );
}
