import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { Plugin } from 'chart.js';
import type { AnnotationOptions, AnnotationTypeRegistry } from 'chartjs-plugin-annotation';
import { useWeatherData } from '../../../api/hooks/weather';
import { useAlertStore } from '../../../../modules/tripexplorer/AlertStore';
import type {
  PlacedWeatherRun,
  WeatherGranularity,
} from '../../../../modules/weather/utils/weatherAnnotations';
import {
  getWeatherAnnotations,
  placeWeatherRuns,
  weatherRowAt,
} from '../../../../modules/weather/utils/weatherAnnotations';
import type { WeatherHourly } from '../../../types/weather';
import type { OldAlert } from '../../../types/alerts';
import { ONE_HOUR } from '../../../constants/time';
import { useOtherLineShutdowns } from '../../../../modules/shutdowns';
import { useDisplayStore } from '../../../state/displayStore';
import { alertKey, getAlertAnnotations, serviceDay } from './segments';
import { chartGeometryPlugin } from './chartGeometryPlugin';
import type { TrackGeometry } from './chartGeometryPlugin';
import { useLayerStore } from './layerStore';

interface UseChartLayersOptions {
  startDate?: string;
  endDate?: string;
  granularity: WeatherGranularity;
  // False for embeds and hourly aggregates, which get no track and fetch nothing
  enabled: boolean;
  // Only single-day trip charts have the day's alerts
  withAlerts?: boolean;
  // Date-range charts can shade other lines' shutdowns, when the reader turns them on
  withOtherShutdowns?: boolean;
}

export interface ChartLayers {
  enabled: boolean;
  showWeather: boolean;
  showTemperature: boolean;
  granularity: WeatherGranularity;
  weather: WeatherHourly[] | undefined;
  weatherRuns: PlacedWeatherRun[];
  isWeatherLoading: boolean;
  alerts: OldAlert[] | undefined;
  isAlertsLoading: boolean;
  withAlerts: boolean;
  date: string | undefined;
  geometry: TrackGeometry | null;
}

/**
 * Everything a chart needs for its context track: the weather and alerts behind it, the shading
 * for whatever is pinned or for other lines' shutdowns, whether the temperature line is on, and the
 * plugin that reports where the plot sits so the track lines up with it.
 */
export const useChartLayers = ({
  startDate,
  endDate,
  granularity,
  enabled,
  withAlerts = false,
  withOtherShutdowns = false,
}: UseChartLayersOptions) => {
  const showWeather = useDisplayStore((store) => store.showWeather);
  const showTemperature = useDisplayStore((store) => store.showTemperature);
  const hourly = granularity === 'hourly';
  const serviceWindow = hourly && startDate ? serviceDay(startDate) : undefined;
  const { data, isLoading: isWeatherLoading } = useWeatherData(
    {
      start_date: startDate,
      // A day's service runs past midnight
      end_date: serviceWindow ? serviceWindow.close.format('YYYY-MM-DD') : endDate,
    },
    enabled && (showWeather || showTemperature) && Boolean(startDate && endDate)
  );
  const windowStart = serviceWindow?.open.valueOf();
  const windowEnd = serviceWindow?.close.valueOf();
  // The service day's hours plus one either side, so the temperature line reaches the plot's edges
  const weather = useMemo(() => {
    if (!data || windowStart === undefined || windowEnd === undefined) return data;
    return data.filter((hour) => {
      const time = dayjs(hour.timestamp).valueOf();
      return time >= windowStart - ONE_HOUR && time < windowEnd + ONE_HOUR;
    });
  }, [data, windowStart, windowEnd]);
  const weatherRuns = useMemo(
    () =>
      showWeather
        ? placeWeatherRuns(
            weather ?? [],
            granularity,
            windowStart === undefined || windowEnd === undefined
              ? undefined
              : { start: windowStart, end: windowEnd }
          )
        : [],
    [showWeather, weather, granularity, windowStart, windowEnd]
  );
  const alerts = useAlertStore((store) => store.alerts);
  const isAlertsLoading = useAlertStore((store) => store.isLoading);
  const pinned = useLayerStore((store) => store.pinned);
  const temperatureEnabled =
    useLayerStore((store) => store.temperature) && enabled && showTemperature;
  const otherShutdowns = useOtherLineShutdowns(withOtherShutdowns ? startDate : undefined, endDate);
  const [geometry, setGeometry] = useState<TrackGeometry | null>(null);
  // Charts without a track have no use for the plot's position, so don't re-render them with it
  const geometryPlugin: Plugin = useMemo(
    () => (enabled ? chartGeometryPlugin(setGeometry) : { id: 'trackGeometry' }),
    [enabled]
  );

  const pinnedRuns = useMemo(
    () => weatherRuns.filter(({ key }) => pinned[key]),
    [weatherRuns, pinned]
  );
  const annotations: AnnotationOptions<keyof AnnotationTypeRegistry>[] = useMemo(() => {
    if (!enabled) return otherShutdowns.annotations;
    const pinnedAlerts =
      withAlerts && alerts && startDate
        ? getAlertAnnotations(
            alerts.filter((alert) => pinned[alertKey(alert)]),
            startDate
          )
        : [];
    const weatherShading = getWeatherAnnotations(pinnedRuns);
    return [...pinnedAlerts, ...weatherShading, ...otherShutdowns.annotations];
  }, [enabled, withAlerts, alerts, startDate, pinned, pinnedRuns, otherShutdowns.annotations]);

  const layers: ChartLayers = {
    enabled,
    showWeather,
    showTemperature,
    granularity,
    weather,
    weatherRuns,
    isWeatherLoading,
    alerts,
    isAlertsLoading,
    withAlerts,
    date: startDate,
    geometry,
  };

  /** The pinned weather at a hovered time, as a row for the chart's popover. */
  const weatherAt = (time: number) =>
    enabled ? weatherRowAt(pinnedRuns, time, granularity) : undefined;

  return { layers, annotations, temperatureEnabled, geometryPlugin, weatherAt };
};
