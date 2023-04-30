import React, { useMemo } from 'react';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import type { SegmentLocation } from '../../../common/components/maps';
import { LineMap, createDefaultDiagramForLine } from '../../../common/components/maps';
import type { SlowZoneResponse, SpeedRestriction } from '../../../common/types/dataPoints';
import type { SlowZonesLineName } from '../types';
import type { SegmentRenderOptions } from '../../../common/components/maps/LineMap';

import type { LineMetadata } from '../../../common/types/lines';
import type { SlowZonesSegment } from './segment';
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

const getSegmentRenderOptions = (segment: SlowZonesSegment, line: LineMetadata) => {
  const { slowZones } = segment;
  const labelSide = segment.segmentLocation.toStationId === 'place-shmnl' ? '1' : '0';
  return {
    location: segment.segmentLocation,
    labels: {
      [labelSide]: {
        heightWhenHorizontal: 10,
        widthWhenVertical: 15,
        content: ({ isHorizontal }) => (
          <SlowSegmentLabel isHorizontal={isHorizontal} segment={segment} line={line} />
        ),
      },
    },
    strokes: Object.entries(slowZones)
      .filter((entry) => entry[1].length)
      .map(([direction, zones]) => {
        const offset = direction === '0' ? 1 : -1;
        return {
          offset,
          stroke: line.color,
          strokeWidth: 2,
          opacity: sigmoid(getSlownessFactor(zones)),
        };
      }),
  };
};

export const SlowZonesMap: React.FC<SlowZonesMapProps> = ({
  lineName,
  slowZones,
  direction,
  speedRestrictions = [],
}) => {
  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(() => {
    return createDefaultDiagramForLine(lineName, { pxPerStation: 15 });
  }, [lineName]);

  const { segments } = useMemo(
    () =>
      segmentSlowZones({
        slowZones,
        speedRestrictions,
        lineName: line.short,
        date: new Date(),
        diagram,
      }),
    [slowZones, speedRestrictions, line, diagram]
  );

  const segmentRenderOptions: SegmentRenderOptions[] = useMemo(() => {
    return segments.map((segment) => getSegmentRenderOptions(segment, line));
  }, [segments, line]);

  const renderSlowZonesTooltip = (options: {
    segmentLocation: SegmentLocation<true>;
    isHorizontal: boolean;
  }) => {
    const {
      segmentLocation: { fromStationId, toStationId },
      isHorizontal,
    } = options;
    const slowSegment = segments.find(
      (seg) =>
        seg.segmentLocation.fromStationId === fromStationId &&
        seg.segmentLocation.toStationId === toStationId
    );
    if (slowSegment) {
      return (
        <SlowZonesTooltip isHorizontal={isHorizontal} segment={slowSegment} color={line.color} />
      );
    }

    return null;
  };

  return (
    <LineMap
      diagram={diagram}
      getStationLabel={abbreviateStationName}
      strokeOptions={{ stroke: line.color }}
      segments={segmentRenderOptions}
      direction={direction}
      tooltip={{ snapToSegment: true, maxDistance: 20, render: renderSlowZonesTooltip }}
    />
  );
};
