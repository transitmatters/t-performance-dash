import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { Chart } from 'chart.js';
import {
  faCloudRain,
  faGaugeSimpleHigh,
  faTemperatureHalf,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import {
  WEATHER_BASE_COLORS,
  weatherCard,
} from '../../../../modules/weather/utils/weatherAnnotations';
import { describeWeather } from '../../../../modules/weather/utils/weatherDetails';
import { useHoverCardStore } from '../hoverCard/hoverCardStore';
import type { HoverCard } from '../hoverCard/hoverCardStore';
import {
  ALERT_COLOR,
  alertSegments,
  formatAlertRange,
  formatTimeRange,
  toFraction,
} from './segments';
import type { ChartLayers } from './useChartLayers';
import { useLayerStore } from './layerStore';
import { Segment, TrackRow } from './TrackRow';
import { TemperatureTrack, getTemperaturePoints } from './TemperatureTrack';
import type { TemperaturePoint } from './TemperatureTrack';
import { PinnedAlerts } from './PinnedAlerts';
import { SlowZonesTrack } from './SlowZonesTrack';

interface ContextTrackProps {
  layers: ChartLayers;
  chartRef: RefObject<Chart | null>;
}

/**
 * Strips under a chart's x axis showing the service alerts, slow zones, weather, and temperature
 * behind the data, lined up with the plot. Hovering a segment reads it; clicking shades it on the chart.
 */
export const ContextTrack = ({ layers, chartRef }: ContextTrackProps) => {
  const {
    enabled,
    showWeather,
    showTemperature,
    geometry,
    granularity,
    weather,
    weatherRuns,
    date,
    alerts,
    withAlerts,
    slowZones,
  } = layers;
  const daily = granularity === 'daily';
  const pinned = useLayerStore((store) => store.pinned);
  const temperaturePinned = useLayerStore((store) => store.temperature);
  const toggle = useLayerStore((store) => store.toggle);
  const toggleTemperature = useLayerStore((store) => store.toggleTemperature);
  const slowZonesPinned = useLayerStore((store) => store.slowZones);
  const toggleSlowZones = useLayerStore((store) => store.toggleSlowZones);
  const rowsRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const [labelFits, setLabelFits] = useState<Record<string, boolean>>({});
  const onLabelFit = useCallback((label: string, fits: boolean | null) => {
    setLabelFits((previous) => {
      if (fits === null) {
        const next = { ...previous };
        delete next[label];
        return next;
      }
      return previous[label] === fits ? previous : { ...previous, [label]: fits };
    });
  }, []);
  const iconOnly = Object.values(labelFits).includes(false);

  // Mirror the chart's hover rule down through the track, without re-rendering on every move
  useEffect(() => {
    const follow = (point: HoverCard | null) => {
      const rule = ruleRef.current;
      const rows = rowsRef.current;
      if (!rule || !rows) return;
      if (point && point.owner === chartRef.current) {
        rule.style.left = `${point.x - rows.getBoundingClientRect().left}px`;
        rule.style.display = 'block';
      } else {
        rule.style.display = 'none';
      }
    };
    return useHoverCardStore.subscribe((state) => follow(state.point));
  }, [chartRef]);

  const alertSpans = useMemo(
    () => (withAlerts && alerts && date ? alertSegments(alerts, date) : []),
    [withAlerts, alerts, date]
  );
  const temperaturePoints: TemperaturePoint[] = useMemo(
    () => getTemperaturePoints(weather ?? [], daily),
    [daily, weather]
  );

  if (!enabled || !geometry || !(withAlerts || slowZones || showWeather || showTemperature))
    return null;
  const domain = { min: geometry.min, max: geometry.max };
  const weatherStatus = layers.isWeatherLoading
    ? 'loading'
    : weatherRuns.length
      ? 'ready'
      : 'empty';
  const alertStatus = layers.isAlertsLoading ? 'loading' : alertSpans.length ? 'ready' : 'empty';
  const noWeatherData = !weather?.length;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div ref={rowsRef} className="relative flex flex-col gap-1.5">
        {withAlerts && (
          <TrackRow
            label="Alerts"
            icon={faTriangleExclamation}
            geometry={geometry}
            iconOnly={iconOnly}
            onLabelFit={onLabelFit}
            status={alertStatus}
            emptyText={alerts ? 'No service alerts' : 'Alerts unavailable'}
            lanes={Math.max(...alertSpans.map((span) => span.lane + 1), 1)}
          >
            {alertSpans.map((span) => {
              const range = formatAlertRange(span.alert);
              return (
                <Segment
                  key={span.key}
                  start={toFraction(span.start, domain)}
                  end={toFraction(span.end, domain)}
                  lane={span.lane}
                  color={ALERT_COLOR}
                  pinned={Boolean(pinned[span.key])}
                  label={`Service alert, ${range}: ${span.alert.text}`}
                  card={{ title: range, notes: [span.alert.text ?? ''] }}
                  onToggle={() => toggle(span.key)}
                />
              );
            })}
          </TrackRow>
        )}
        {slowZones && (
          <TrackRow
            label="Slow zones"
            shortLabel="Slow"
            icon={faGaugeSimpleHigh}
            geometry={geometry}
            iconOnly={iconOnly}
            onLabelFit={onLabelFit}
            status={slowZones.isLoading ? 'loading' : slowZones.runs.length ? 'ready' : 'empty'}
            emptyText="No slow zones on this trip"
            contentHeight={18}
          >
            <SlowZonesTrack
              runs={slowZones.runs}
              domain={domain}
              color={slowZones.color}
              pinned={slowZonesPinned}
              onToggle={toggleSlowZones}
            />
          </TrackRow>
        )}
        {showWeather && (
          <TrackRow
            label="Weather"
            icon={faCloudRain}
            geometry={geometry}
            iconOnly={iconOnly}
            onLabelFit={onLabelFit}
            status={weatherStatus}
            emptyText={noWeatherData ? 'No weather data' : 'No rain, snow, fog or storms'}
          >
            {weatherRuns.map((run) => {
              const range = formatTimeRange(run.run.start, run.run.end, daily);
              return (
                <Segment
                  key={run.key}
                  start={toFraction(run.start, domain)}
                  end={toFraction(run.end, domain)}
                  color={WEATHER_BASE_COLORS[run.run.condition]}
                  pinned={Boolean(pinned[run.key])}
                  label={`${describeWeather(run.hours, run.run.condition)}, ${range}`}
                  card={weatherCard(run, range)}
                  onToggle={() => toggle(run.key)}
                />
              );
            })}
          </TrackRow>
        )}
        {showTemperature && (
          <TrackRow
            label="Temp"
            icon={faTemperatureHalf}
            geometry={geometry}
            iconOnly={iconOnly}
            onLabelFit={onLabelFit}
            status={
              layers.isWeatherLoading ? 'loading' : temperaturePoints.length > 1 ? 'ready' : 'empty'
            }
            emptyText="No temperature data"
            contentHeight={18}
          >
            <TemperatureTrack
              points={temperaturePoints}
              domain={domain}
              daily={daily}
              pinned={temperaturePinned}
              onToggle={toggleTemperature}
            />
          </TrackRow>
        )}
        <div
          ref={ruleRef}
          aria-hidden
          className="pointer-events-none absolute inset-y-0 hidden w-px bg-muted-foreground/40"
        />
      </div>
      {withAlerts && (
        <PinnedAlerts
          alerts={alertSpans.filter((span) => pinned[span.key]).map((span) => span.alert)}
          indent={geometry.left}
          onRemove={toggle}
        />
      )}
    </div>
  );
};
