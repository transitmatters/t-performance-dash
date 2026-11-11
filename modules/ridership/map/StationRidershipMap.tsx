import { useCallback, useMemo } from 'react';
import type { ComponentProps } from 'react';
import type { StationRenderOptions, TooltipSide } from '@transitmatters/stripmap';
import { LineMap, createDefaultDiagramForLine } from '@transitmatters/stripmap';

import '@transitmatters/stripmap/dist/style.css';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import { useThemeStore } from '../../../common/state/themeStore';
import { abbreviateStationName, getStripMapWatermark } from '../../../common/utils/stripmap';
import { StationRidershipTooltip } from './StationRidershipTooltip';
import { formatStationRidership, getOtherLinesAtStation } from './utils';
import type { StationRidershipLineName } from './utils';

interface StationRidershipMapProps extends Pick<ComponentProps<typeof LineMap>, 'direction'> {
  lineName: StationRidershipLineName;
  /** Average weekday fare validations by parent stop ID */
  averages: Record<string, number>;
  selectedStationId: null | string;
  onSelectStation: (stationId: null | string) => void;
}

export const StationRidershipMap = ({
  lineName,
  averages,
  direction,
  selectedStationId,
  onSelectStation,
}: StationRidershipMapProps) => {
  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(
    () => createDefaultDiagramForLine(lineName, { pxPerStation: 15, direction }),
    [lineName, direction]
  );

  const isDark = useThemeStore((state) => state.theme === 'dark');
  const isHorizontal = direction === 'horizontal';
  const maxAverage = Math.max(...Object.values(averages));

  const getStations = useCallback(
    ({ isHorizontal }: { isHorizontal: boolean }): StationRenderOptions[] =>
      Object.entries(averages).map(([stationId, average]) => {
        const isSelected = stationId === selectedStationId;
        // Scale the dot's area, not its radius, with ridership
        const radius = 1.25 + 2.25 * Math.sqrt(average / maxAverage);
        // The dot sits on the label's edge nearest the line: its left in a vertical map, its bottom in a horizontal one
        const distanceFromStation = radius + 1.5;
        return {
          stationId,
          dot: {
            radius,
            fill: isSelected ? line.color : 'white',
            strokeWidth: isSelected ? 1.5 : 1,
          },
          labels: [
            {
              mapSide: '0',
              length: 15,
              boundingSize: isHorizontal ? 8 : 16,
              content: ({ width, height }) => (
                <text
                  x={isHorizontal ? width / 2 : distanceFromStation}
                  y={isHorizontal ? height - distanceFromStation : height / 2}
                  dominantBaseline={isHorizontal ? undefined : 'central'}
                  fontSize={3.5}
                  textAnchor={isHorizontal ? 'middle' : 'start'}
                  fontWeight={isSelected ? 'bold' : undefined}
                  className="fill-stone-700 dark:fill-stone-300"
                >
                  {formatStationRidership(average)}
                </text>
              ),
            },
          ],
        };
      }),
    [averages, maxAverage, selectedStationId, line.color]
  );

  const renderStationTooltip = ({
    stationId,
    stationName,
    side,
  }: {
    stationId: string;
    stationName: string;
    side: TooltipSide;
  }) => (
    <StationRidershipTooltip
      stationName={stationName}
      side={side}
      color={line.color}
      average={averages[stationId]}
      otherLines={getOtherLinesAtStation(stationId, lineName)}
    />
  );

  return (
    <LineMap
      diagram={diagram}
      strokeOptions={{ stroke: line.color }}
      direction={direction}
      getStationLabel={abbreviateStationName}
      getStations={getStations}
      stationTooltip={{ render: renderStationTooltip }}
      onStationClick={(stationId) => {
        if (stationId in averages) {
          onSelectStation(stationId === selectedStationId ? null : stationId);
        }
      }}
      watermark={getStripMapWatermark(isHorizontal, isDark)}
    />
  );
};
