import React from 'react';
import classNames from 'classnames';
import type { WeatherHourly } from '../../common/types/weather';
import {
  SIGNIFICANT_CONDITIONS,
  WEATHER_COLORS,
  countSignificantHours,
} from './utils/weatherAnnotations';
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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 p-1 text-sm text-stone-800 hover:text-stone-900"
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
  );
};
