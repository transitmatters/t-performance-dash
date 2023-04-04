import React, { useMemo } from 'react';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import { createRedLineDiagram } from '../../../common/diagrams';
import type { SlowZoneResponse } from '../../../common/types/dataPoints';

import type { SlowZonesLineName } from '../types';

import type { SegmentRenderOptions } from '../../../common/maps/LineMap';
import LineMap from '../../../common/maps/LineMap';

import { segmentSlowZones } from './segment';
import SlowSegmentLabel from './SlowSegmentLabel';

type SlowZonesMapProps = {
  slowZones: SlowZoneResponse[];
  lineName: SlowZonesLineName;
} & Pick<React.ComponentProps<typeof LineMap>, 'direction'>;

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
    .replace('Massachusetts Avenue', 'Mass Ave');
};

const getSlownessFactor = (zones: SlowZoneResponse | SlowZoneResponse[]) => {
  if (!Array.isArray(zones)) {
    zones = [zones];
  }
  const zonesArray = zones as SlowZoneResponse[];
  const delay = zonesArray.reduce((sum, zone) => sum + zone.delay, 0);
  const baseline = zonesArray.reduce((sum, zone) => sum + zone.baseline, 0);
  return delay / baseline;
};

const sigmoid = (x: number, steepness = 2, midpoint = 0.5) => {
  return 1 / (1 + Math.exp(-1 * steepness * (x - midpoint)));
};

const SlowZonesMap: React.FC<SlowZonesMapProps> = (props) => {
  const { lineName, slowZones, direction } = props;

  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const { segmentedSlowZones } = useMemo(
    () =>
      segmentSlowZones({
        slowZones,
        lineName: line.short,
        directions: ['0', '1'],
        date: new Date(),
      }),
    [slowZones, line]
  );

  const segmentsForSlowZones: SegmentRenderOptions[] = useMemo(() => {
    return segmentedSlowZones.map((segment) => {
      const side = segment.segmentLocation.toStationId === 'place-shmnl' ? '1' : '0';
      return {
        location: segment.segmentLocation,
        labels: {
          [side]: {
            heightWhenHorizontal: 10,
            widthWhenVertical: 15,
            content: ({ isHorizontal }) => (
              <SlowSegmentLabel
                isHorizontal={isHorizontal}
                slowZonesByDirection={segment.slowZonesByDirection}
                line={line}
              />
            ),
          },
        },
        strokes: Object.entries(segment.slowZonesByDirection).map(([direction, zone]) => {
          const offset = direction === '0' ? 1 : -1;
          return {
            offset,
            stroke: line.color,
            strokeWidth: 2,
            opacity: sigmoid(getSlownessFactor(zone)),
          };
        }),
      };
    });
  }, [line, segmentedSlowZones]);

  const diagram = useMemo(() => {
    return createRedLineDiagram();
  }, []);

  return (
    <LineMap
      diagram={diagram}
      getStationLabel={abbreviateStationName}
      strokeOptions={{ stroke: line.color }}
      segments={segmentsForSlowZones}
      direction={direction}
    />
  );
};

export default SlowZonesMap;
