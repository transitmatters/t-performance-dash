import React from 'react';
import classNames from 'classnames';
import type { WeatherHourly } from '../../common/types/weather';
import {
  SIGNIFICANT_CONDITIONS,
  WEATHER_COLORS,
  countSignificantHours,
} from './utils/weatherAnnotations';
import { TEMPERATURE_BAND_COLOR, TEMPERATURE_LINE_COLOR } from './utils/temperatureDataset';
import { useWeatherStore } from './WeatherStore';

interface WeatherDisclaimerProps {
  hours: WeatherHourly[] | undefined;
  isLoading?: boolean;
}

const statusText = (hours: WeatherHourly[] | undefined, isLoading: boolean): string => {
  if (isLoading) return 'loading…';
  if (!hours || hours.length === 0) return 'no data';
  const significant = countSignificantHours(hours);
  if (significant === 0) return 'clear';
  return `${significant} notable hour${significant === 1 ? '' : 's'}`;
};

export const WeatherDisclaimer: React.FC<WeatherDisclaimerProps> = ({ hours, isLoading }) => {
  const enabled = useWeatherStore((s) => s.enabled);
  const toggle = useWeatherStore((s) => s.toggle);
  const temperatureEnabled = useWeatherStore((s) => s.temperatureEnabled);
  const toggleTemperature = useWeatherStore((s) => s.toggleTemperature);

  return (
    <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-1 p-1 text-sm text-stone-800">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 hover:text-stone-900"
      >
        <span className="flex flex-row items-center gap-1">
          <span aria-hidden="true">{enabled ? '☑' : '☐'}</span>
          <span>Weather overlay</span>
          <span
            className={classNames('text-xs italic', enabled ? 'text-stone-600' : 'text-stone-400')}
          >
            ({statusText(hours, Boolean(isLoading))})
          </span>
        </span>
        {enabled && (
          <span className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
            {SIGNIFICANT_CONDITIONS.map((condition) => (
              <span key={condition} className="flex flex-row items-center gap-1 text-xs">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-sm border border-stone-300"
                  style={{ backgroundColor: WEATHER_COLORS[condition] }}
                />
                <span className="text-stone-600">{condition}</span>
              </span>
            ))}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={toggleTemperature}
        aria-pressed={temperatureEnabled}
        className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 hover:text-stone-900"
      >
        <span className="flex flex-row items-center gap-1">
          <span aria-hidden="true">{temperatureEnabled ? '☑' : '☐'}</span>
          <span>Temperature</span>
        </span>
        {temperatureEnabled && (
          <span className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex flex-row items-center gap-1 text-xs">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 rounded-sm border border-stone-300"
                style={{ backgroundColor: TEMPERATURE_BAND_COLOR }}
              />
              <span className="text-stone-600">high/low</span>
            </span>
            <span className="flex flex-row items-center gap-1 text-xs">
              <span
                aria-hidden="true"
                className="inline-block h-[2px] w-4"
                style={{ backgroundColor: TEMPERATURE_LINE_COLOR }}
              />
              <span className="text-stone-600">mean</span>
            </span>
          </span>
        )}
      </button>
    </div>
  );
};
