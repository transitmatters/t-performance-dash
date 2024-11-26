import React, { useMemo } from 'react';
import type { SegmentLocation, SegmentLabel, TooltipSide } from '@transitmatters/stripmap';
import { LineMap, createDefaultDiagramForLine } from '@transitmatters/stripmap';

import '@transitmatters/stripmap/dist/style.css';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import type { SlowZoneResponse, SpeedRestriction } from '../../../common/types/dataPoints';
import type { SlowZonesLineName } from '../types';

import { getSlowZoneOpacity } from '../../../common/utils/slowZoneUtils';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { TODAY_STRING } from '../../../common/constants/dates';
import { segmentSlowZones } from './segment';
import { SlowSegmentLabel } from './SlowSegmentLabel';
import { SlowZonesTooltip } from './SlowZonesTooltip';

interface SlowZonesMapProps extends Pick<React.ComponentProps<typeof LineMap>, 'direction'> {
  slowZones: SlowZoneResponse[];
  speedRestrictions: SpeedRestriction[];
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

const getSegmentLabelOverrides = (
  segmentLocation: SegmentLocation,
  isHorizontal: boolean
): null | Partial<SegmentLabel> => {
  const { toStationId } = segmentLocation;
  // JFK to Savin Hill — on a steep curve
  if (toStationId === 'place-shmnl') {
    return {
      mapSide: '1' as const,
      offset: isHorizontal ? { x: -12, y: -5 } : { x: 0, y: 0 },
    };
  }
  // Shawmut to Ashmont — obscured by "North Quincy" label
  if (!isHorizontal && toStationId === 'place-asmnl') {
    return {
      mapSide: '1' as const,
    };
  }
  return null;
};

export const SlowZonesMap: React.FC<SlowZonesMapProps> = ({
  lineName,
  slowZones,
  direction,
  speedRestrictions,
}) => {
  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(() => {
    return createDefaultDiagramForLine(lineName, { pxPerStation: 15 });
  }, [lineName]);

  const { query } = useDelimitatedRoute();
  const { endDate } = query;

  const { segments } = useMemo(
    () =>
      segmentSlowZones({
        slowZones,
        speedRestrictions,
        lineName: line.short,
        date: endDate ? new Date(endDate) : new Date(),
        diagram,
      }),
    [slowZones, speedRestrictions, line, diagram, endDate]
  );

  const getSegmentsForSlowZones = ({ isHorizontal }: { isHorizontal: boolean }) => {
    return segments.map((segment) => {
      return {
        location: segment.segmentLocation,
        labels: [
          {
            mapSide: '0' as const,
            boundingSize: isHorizontal ? 15 : 20,
            ...getSegmentLabelOverrides(segment.segmentLocation, isHorizontal),
            content: (size) => (
              <SlowSegmentLabel
                isHorizontal={isHorizontal}
                segment={segment}
                line={line}
                {...size}
              />
            ),
          },
        ],
        strokes: Object.entries(segment.slowZones).map(([direction, zones]) => {
          const offset = direction === '0' ? 1 : -1;
          const isToday = endDate === TODAY_STRING;
          const totalDelay = zones.reduce(
            (sum, zone) => sum + (isToday && zone.latest_delay ? zone.latest_delay : zone.delay),
            0
          );
          return {
            offset,
            stroke: line.color,
            strokeWidth: 2,
            opacity: getSlowZoneOpacity(totalDelay),
          };
        }),
      };
    });
  };

  const renderSlowZonesTooltip = (options: {
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
      return <SlowZonesTooltip side={side} segment={slowSegment} color={line.color} />;
    }

    return null;
  };

  return (
    <LineMap
      diagram={diagram}
      strokeOptions={{ stroke: line.color }}
      direction={direction}
      getSegments={(isHorizontal) => []}
      getStationLabel={abbreviateStationName}
      tooltip={{ snapToSegment: true, maxDistance: 20, render: renderSlowZonesTooltip }}
    />
  );
};
