import type { MouseEvent } from 'react';
import dayjs from 'dayjs';
import {
  TEMPERATURE_BAND_COLOR,
  TEMPERATURE_LINE_COLOR,
  TEMPERATURE_SCALE,
  getDailyTemperatureSeries,
  getHourlyTemperatureSeries,
} from '../../../../modules/weather/utils/temperatureDataset';
import type { WeatherHourly } from '../../../types/weather';
import type { ResolvedHoverCardContent } from '../hoverCard/types';
import { hideTrackCard, showTrackCard } from './TrackRow';
import { toFraction } from './segments';
import type { Domain } from './segments';
import { cn } from '@/common/utils/cn';

export interface TemperaturePoint {
  time: number;
  mean: number;
  low?: number;
  high?: number;
}

export const getTemperaturePoints = (
  hours: WeatherHourly[],
  daily: boolean
): TemperaturePoint[] => {
  if (!daily) {
    return getHourlyTemperatureSeries(hours).map(({ x, y }) => ({
      time: dayjs(x).valueOf(),
      mean: y,
    }));
  }
  const { min, max, mean } = getDailyTemperatureSeries(hours);
  return mean.map(({ x, y }, index) => ({
    time: dayjs(x).valueOf(),
    mean: y,
    low: min[index].y,
    high: max[index].y,
  }));
};

interface TemperatureTrackProps {
  points: TemperaturePoint[];
  domain: Domain;
  daily: boolean;
  pinned: boolean;
  onToggle: () => void;
}

const WIDTH = 1000;
const HEIGHT = 100;
const PAD = 12;

/** The fixed 0–100 °F scale, widened to fit readings outside it. */
export const temperatureScale = (low: number, high: number) => ({
  min: Math.min(TEMPERATURE_SCALE.min, low),
  max: Math.max(TEMPERATURE_SCALE.max, high),
});

const degrees = (value: number) => `${Math.round(value)} °F`;

/** The day's (or range's) temperature as a sparkline; clicking plots it on the chart. */
export const TemperatureTrack = ({
  points,
  domain,
  daily,
  pinned,
  onToggle,
}: TemperatureTrackProps) => {
  const lows = points.map((point) => point.low ?? point.mean);
  const highs = points.map((point) => point.high ?? point.mean);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const scale = temperatureScale(min, max);
  // Unclamped, so the hours just past each end run off the edge and get clipped
  const x = (time: number) =>
    (((time - domain.min) / (domain.max - domain.min || 1)) * WIDTH).toFixed(1);
  const y = (value: number) =>
    (HEIGHT - PAD - ((value - scale.min) / (scale.max - scale.min)) * (HEIGHT - PAD * 2)).toFixed(
      1
    );

  const line = points
    .map((point, i) => `${i ? 'L' : 'M'}${x(point.time)} ${y(point.mean)}`)
    .join('');
  const band = daily
    ? [
        ...points.map((point) => `${x(point.time)},${y(point.high ?? point.mean)}`),
        ...[...points].reverse().map((point) => `${x(point.time)},${y(point.low ?? point.mean)}`),
      ].join(' ')
    : undefined;

  const card = (point: TemperaturePoint): ResolvedHoverCardContent => ({
    title: dayjs(point.time).format(daily ? 'ddd, MMM D' : 'h:mm A'),
    rows: [
      {
        label: daily ? 'Mean temperature' : 'Temperature',
        value: degrees(point.mean),
        detail:
          point.low !== undefined && point.high !== undefined
            ? `${degrees(point.low)} – ${degrees(point.high)}`
            : undefined,
        color: TEMPERATURE_LINE_COLOR,
      },
    ],
    notes: [pinned ? 'Click to hide the line on the chart' : 'Click to plot it on the chart'],
  });

  const cardAt = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const time =
      domain.min + ((event.clientX - rect.left) / rect.width) * (domain.max - domain.min);
    const visible = points.filter((point) => point.time >= domain.min && point.time <= domain.max);
    if (!visible.length) return;
    const nearest = visible.reduce((best, point) =>
      Math.abs(point.time - time) < Math.abs(best.time - time) ? point : best
    );
    showTrackCard(
      event.currentTarget,
      card(nearest),
      rect.left + toFraction(nearest.time, domain) * rect.width
    );
  };

  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={`Temperature, ${degrees(min)} to ${degrees(max)}. ${pinned ? 'Hide' : 'Plot'} it on the chart`}
      onClick={(event) => {
        onToggle();
        hideTrackCard(event.currentTarget);
      }}
      onMouseMove={cardAt}
      onMouseLeave={(event) => hideTrackCard(event.currentTarget)}
      onFocus={(event) =>
        showTrackCard(event.currentTarget, {
          title: 'Temperature',
          rows: [
            {
              label: 'Range',
              value: `${degrees(min)} – ${degrees(max)}`,
              color: TEMPERATURE_LINE_COLOR,
            },
          ],
          notes: [pinned ? 'Press Enter to hide the line' : 'Press Enter to plot it on the chart'],
        })
      }
      onBlur={(event) => hideTrackCard(event.currentTarget)}
      className={cn(
        'absolute inset-0 rounded-[3px] transition-opacity duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
        pinned ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      )}
    >
      <svg
        aria-hidden
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block overflow-hidden"
      >
        {band && <polygon points={band} fill={TEMPERATURE_BAND_COLOR} />}
        <path
          d={line}
          fill="none"
          stroke={TEMPERATURE_LINE_COLOR}
          strokeWidth={pinned ? 2 : 1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </button>
  );
};
