/* eslint-disable import/no-unused-modules */
import React, { useMemo } from 'react';
import type { SegmentLocation, TooltipSide } from '@transitmatters/stripmap';
import { LineMap, createDefaultDiagramForLine } from '@transitmatters/stripmap';

import '@transitmatters/stripmap/dist/style.css';

import { LINE_OBJECTS } from '../../../common/constants/lines';

import { useDelimitatedRoute } from '../../../common/utils/router';
import { getSegmentLabelOverrides } from '../../slowzones/map/segment';
import type { SlowZonesLineName } from '../../slowzones/types';
import { getStationDistance } from '../../../common/utils/stations';
import { convertSecondsToMph } from '../../landing/utils';
import { segmentStationPairs } from './segment';
import { TEST_DATA } from './constants';
import { SpeedSegmentLabel } from './SegmentSpeedLabel';
import { SegmentSpeedTooltip } from './SegmentSpeedTooltip';

interface SegmentSpeedMapProps extends Pick<React.ComponentProps<typeof LineMap>, 'direction'> {
  lineName: SlowZonesLineName;
}

const abbreviateStationName = ({ stationName }) => {
  if (stationName.startsWith('JFK')) {
    return 'JFK';
  }
  return stationName
    .replace('Downtown Crossing', 'Dwntn Crossing')
    .replace('Boston University', 'BU')
    .replace('Hynes Convention Center', 'Hynes')
    .replace('Government Center', "Gov't Center")
    .replace('Northeastern University', 'Northeastern')
    .replace('Museum of Fine Arts', 'MFA')
    .replace('Massachusetts Avenue', 'Mass Ave')
    .replace('North Quincy', 'N. Quincy');
};

export const SegmentSpeedMap: React.FC<SegmentSpeedMapProps> = ({ lineName, direction }) => {
  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(() => {
    return createDefaultDiagramForLine(lineName, { pxPerStation: 15 });
  }, [lineName]);

  const { query } = useDelimitatedRoute();
  const { endDate } = query;

  // TODO: Pull from dynamo calculated hourly in data-ingestion
  const speedData = TEST_DATA.map((data) => {
    const intervalDistance = getStationDistance(data.from_id, data.to_id);

    return {
      ...data,
      speed: convertSecondsToMph(data.travel_time, intervalDistance),
    };
  });

  const { segments } = useMemo(
    () =>
      segmentStationPairs({
        speedPairs: speedData,
        lineName: line.short,
        date: endDate ? new Date(endDate) : new Date(),
        diagram,
      }),
    [speedData, line, diagram, endDate]
  );

  const getSegmentsForSpeed = ({ isHorizontal }: { isHorizontal: boolean }) => {
    return segments.map((segment) => {
      return {
        location: segment.segmentLocation,
        labels: [
          {
            mapSide: '0' as const,
            boundingSize: isHorizontal ? 15 : 20,
            ...getSegmentLabelOverrides(segment.segmentLocation, isHorizontal),
            content: (size) => (
              <SpeedSegmentLabel
                isHorizontal={isHorizontal}
                segment={segment}
                line={line}
                {...size}
              />
            ),
          },
        ],
        strokes: Object.entries(segment.segments).map(([direction, zones]) => {
          const offset = direction === '0' ? 1 : -1;
          const speed = zones.reduce((sum, zone) => sum + zone.speed!, 0) / zones.length;

          return {
            offset,
            stroke:
              speed === 0 || zones.length === 0
                ? undefined
                : speed < 20
                  ? '#c33149'
                  : speed < 30
                    ? '#f5ed00'
                    : '#64b96a',
            strokeWidth: 2,
            opacity: 0.35,
          };
        }),
      };
    });
  };

  const renderSegmentSpeedTooltip = (options: {
    segmentLocation: SegmentLocation<true>;
    side: TooltipSide;
  }) => {
    const {
      segmentLocation: { fromStationId, toStationId },
      side,
    } = options;
    const slowSegment = segments.find(
      (seg) =>
        seg.segmentLocation.fromStationId === fromStationId &&
        seg.segmentLocation.toStationId === toStationId
    );
    if (slowSegment) {
      return <SegmentSpeedTooltip side={side} segment={slowSegment} color={line.color} />;
    }

    return null;
  };

  return (
    <LineMap
      diagram={diagram}
      strokeOptions={{ stroke: line.color }}
      direction={direction}
      getSegments={getSegmentsForSpeed}
      getStationLabel={abbreviateStationName}
      tooltip={{ snapToSegment: true, maxDistance: 20, render: renderSegmentSpeedTooltip }}
    />
  );
};
