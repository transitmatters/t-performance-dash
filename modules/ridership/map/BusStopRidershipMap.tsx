import { useCallback, useMemo } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import type { StationRenderOptions, TooltipSide } from '@transitmatters/stripmap';
import { StraightLineMap } from '@transitmatters/stripmap';

import '@transitmatters/stripmap/dist/style.css';

import type { BusStopRidershipStop } from '../../../common/types/dataPoints';
import { useThemeStore } from '../../../common/state/themeStore';
import { getStripMapWatermark } from '../../../common/utils/stripmap';
import { RidershipMapTooltip } from './StationRidershipTooltip';
import { formatStationRidership } from './utils';
import { abbreviateBusStopName } from './busStopUtils';

interface BusStopRidershipMapProps extends Pick<
  ComponentProps<typeof StraightLineMap>,
  'direction'
> {
  /** One direction's stops, in order along the route */
  stops: BusStopRidershipStop[];
  stopNames: Record<string, string>;
  color: string;
  /** Extra lines for a stop's tooltip, below its boardings and alightings */
  getStopDetails?: (stopId: string) => ReactNode;
}

export const BusStopRidershipMap = ({
  stops,
  stopNames,
  color,
  direction,
  getStopDetails,
}: BusStopRidershipMapProps) => {
  const stations = useMemo(
    () =>
      stops.map(({ stop_id }) => ({ station: stop_id, stop_name: stopNames[stop_id] ?? stop_id })),
    [stops, stopNames]
  );
  const stopsById = useMemo(
    () => Object.fromEntries(stops.map((stop) => [stop.stop_id, stop])),
    [stops]
  );

  const isDark = useThemeStore((state) => state.theme === 'dark');
  const isHorizontal = direction === 'horizontal';
  const maxBoardings = Math.max(1, ...stops.map((stop) => stop.boardings));
  // The map scales to fill its card, so packing a long route's stops closer makes its text bigger.
  // Below 7 the angled stop names would overlap.
  const pxPerStation = Math.max(7, Math.min(15, 300 / stops.length));

  const getStations = useCallback(
    ({ isHorizontal }: { isHorizontal: boolean }): StationRenderOptions[] =>
      stops.map(({ stop_id, boardings }) => ({
        stationId: stop_id,
        dot: {
          // Scale the dot's area, not its radius, with ridership
          radius: 1 + 2.25 * Math.sqrt(boardings / maxBoardings),
          fill: 'white',
          strokeWidth: 1,
        },
        labels: [
          {
            mapSide: '0',
            length: pxPerStation,
            boundingSize: isHorizontal ? 8 : 14,
            // Keep clear of the dot, which sits on the edge of the label nearest the line
            content: ({ width, height }) => (
              <text
                x={isHorizontal ? width / 2 : 4.5}
                y={isHorizontal ? 4.5 : height / 2 + 1.25}
                fontSize={3}
                textAnchor={isHorizontal ? 'middle' : 'start'}
                className="fill-stone-700 dark:fill-stone-300"
              >
                {formatStationRidership(boardings)}
              </text>
            ),
          },
        ],
      })),
    [stops, maxBoardings, pxPerStation]
  );

  const renderStationTooltip = ({
    stationId,
    stationName,
    side,
  }: {
    stationId: string;
    stationName: string;
    side: TooltipSide;
  }) => {
    const stop = stopsById[stationId];
    return (
      <RidershipMapTooltip stationName={stationName} side={side} color={color}>
        {stop && (
          <span>
            <b>{Math.round(stop.boardings).toLocaleString('en-us')}</b> boardings ·{' '}
            {Math.round(stop.alightings).toLocaleString('en-us')} alightings
          </span>
        )}
        {getStopDetails?.(stationId)}
      </RidershipMapTooltip>
    );
  };

  return (
    <StraightLineMap
      stations={stations}
      color={color}
      pxPerStation={pxPerStation}
      direction={direction}
      getStationLabel={abbreviateBusStopName}
      getStations={getStations}
      stationTooltip={{ render: renderStationTooltip }}
      // Stop names hang below and to the left of a horizontal map, so the top-left corner is the
      // one that's always clear
      watermark={{ ...getStripMapWatermark(isHorizontal, isDark), position: 'top-left' }}
    />
  );
};
