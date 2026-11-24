import { useMemo } from 'react';
import type { ComponentProps } from 'react';
import type { SegmentLocation, SegmentLabel, TooltipSide } from '@transitmatters/stripmap';
import { LineMap, createDefaultDiagramForLine } from '@transitmatters/stripmap';

import '@transitmatters/stripmap/dist/style.css';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import type {
  SlowZoneAllSlowResponse,
  SlowZoneDailyDelaysResponse,
  SpeedRestriction,
} from '../../../common/types/dataPoints';
import type { SlowZonesLineName } from '../types';

import { getSlowZoneOpacity } from '../../../common/utils/slowZoneUtils';
import { useDateRange } from '../../../common/hooks/usePageParams';
import { SvgChart } from '../../../common/components/charts/SvgChart';
import { useThemeStore } from '../../../common/state/themeStore';
import { abbreviateStationName, getStripMapWatermark } from '../../../common/utils/stripmap';
import { segmentSlowZones } from './segment';
import { SlowSegmentLabel } from './SlowSegmentLabel';
import { SlowZonesTooltip } from './SlowZonesTooltip';

interface SlowZonesMapProps extends Pick<ComponentProps<typeof LineMap>, 'direction'> {
  slowZones: SlowZoneAllSlowResponse;
  zoneDelays?: SlowZoneDailyDelaysResponse;
  speedRestrictions: SpeedRestriction[];
  lineName: SlowZonesLineName;
}

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

export const SlowZonesMap = ({
  lineName,
  slowZones,
  zoneDelays,
  direction,
  speedRestrictions,
}: SlowZonesMapProps) => {
  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(() => {
    return createDefaultDiagramForLine(lineName, { pxPerStation: 15, direction });
  }, [lineName, direction]);

  const isDark = useThemeStore((state) => state.theme === 'dark');
  const isHorizontal = direction === 'horizontal';

  const { endDate } = useDateRange();

  const { segments } = useMemo(
    () =>
      segmentSlowZones({
        slowZones,
        zoneDelays: zoneDelays?.data,
        speedRestrictions,
        lineName: line.short,
        date: endDate,
        diagram,
      }),
    [slowZones, zoneDelays, speedRestrictions, line, diagram, endDate]
  );

  const getSegmentsForSlowZones = ({ isHorizontal: horizontal }: { isHorizontal: boolean }) => {
    return segments
      .filter((segment) => {
        // Include segments that have slow zones OR speed restrictions in any direction
        const hasSlowZones = segment.slowZones['0'].length > 0 || segment.slowZones['1'].length > 0;
        const hasSpeedRestrictions =
          segment.speedRestrictions['0'].length > 0 || segment.speedRestrictions['1'].length > 0;
        return hasSlowZones || hasSpeedRestrictions;
      })
      .map((segment) => {
        // Build strokes for each direction that has either slow zones or speed restrictions
        const strokes: { offset: number; stroke: string; strokeWidth: number; opacity: number }[] =
          [];

        for (const dir of ['0', '1'] as const) {
          const zones = segment.slowZones[dir];
          const restrictions = segment.speedRestrictions[dir];

          if (zones.length > 0 || restrictions.length > 0) {
            const offset = dir === '0' ? 1 : -1;

            if (zones.length > 0) {
              // We have a detected slow zone - use delay-based opacity
              const totalDelay = zones.reduce((sum, zone) => sum + zone.dayDelay, 0);
              strokes.push({
                offset,
                stroke: line.color,
                strokeWidth: 2,
                opacity: getSlowZoneOpacity(totalDelay),
              });
            } else {
              // Speed restriction only (no detected slow zone) - use a fixed opacity with dashed style indication
              strokes.push({
                offset,
                stroke: line.color,
                strokeWidth: 2,
                opacity: 0.5,
              });
            }
          }
        }

        return {
          location: segment.segmentLocation,
          labels: [
            {
              mapSide: '0' as const,
              boundingSize: horizontal ? 15 : 20,
              ...getSegmentLabelOverrides(segment.segmentLocation, horizontal),
              content: (size: { width: number; height: number }) => (
                <SlowSegmentLabel
                  isHorizontal={horizontal}
                  segment={segment}
                  line={line}
                  {...size}
                />
              ),
            },
          ],
          strokes,
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
      return (
        <SlowZonesTooltip side={side} segment={slowSegment} line={line.key} color={line.color} />
      );
    }

    return null;
  };

  return (
    <SvgChart datasetName="slowzone-map" startDate={endDate}>
      <LineMap
        diagram={diagram}
        strokeOptions={{ stroke: line.color }}
        direction={direction}
        getSegments={getSegmentsForSlowZones}
        getStationLabel={abbreviateStationName}
        tooltip={{ snapToSegment: true, maxDistance: 20, render: renderSlowZonesTooltip }}
        watermark={getStripMapWatermark(isHorizontal, isDark)}
      />
    </SvgChart>
  );
};
