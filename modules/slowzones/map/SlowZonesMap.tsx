import React, { useMemo, useState, useLayoutEffect } from 'react';

import { LINE_OBJECTS } from '../../../common/constants/lines';
import { useViewport } from '../../../common/hooks/useViewport';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { createRedLineDiagram } from '../../../common/diagrams';
import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { Station } from '../../../common/types/stations';

import type { SlowZonesLineName } from '../types';

import styles from './SlowZonesMap.module.css';

interface SlowZonesMapProps {
  slowZones: SlowZoneResponse[];
  lineName: SlowZonesLineName;
  direction?: 'vertical' | 'horizontal' | 'horizontal-on-desktop';
}

const abbreviateStationName = (stationName: string) => {
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

const getScaleBasis = (viewportWidth: null | number, viewportHeight: null | number) => {
  const MAX_SCALE_BASIS = 3.5;
  if (viewportWidth && viewportHeight) {
    if (viewportWidth > 750) {
      return MAX_SCALE_BASIS;
    }
    return Math.min(MAX_SCALE_BASIS, viewportHeight / 100);
  }
  return MAX_SCALE_BASIS;
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
  const { lineName, slowZones, direction = 'horizontal' } = props;
  const [svg, setSvg] = useState<null | SVGSVGElement>(null);
  const [container, setContainer] = useState<null | HTMLElement>(null);
  const [width, setWidth] = useState<null | number>(null);
  const [height, setHeight] = useState<null | number>(null);
  const [viewbox, setViewbox] = useState<null | string>(null);
  const { viewportWidth, viewportHeight } = useViewport();
  const isMobile = !useBreakpoint('lg');
  const horizontal = direction === 'horizontal-on-desktop' ? !isMobile : direction === 'horizontal';

  const line = useMemo(
    () => Object.values(LINE_OBJECTS).find((obj) => obj.short === lineName)!,
    [lineName]
  );

  const diagram = useMemo(() => {
    return createRedLineDiagram();
  }, []);

  const pathDirective = useMemo(() => diagram.toSVG(), [diagram]);

  const stationsById = useMemo(() => {
    const index: Record<string, Station> = {};
    diagram.getStations().forEach((station) => {
      index[station.station] = station;
    });
    return index;
  }, [diagram]);

  const stationPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const station of diagram.getStations()) {
      positions[station.station] = diagram.getStationPosition(station.station);
    }
    return positions;
  }, [diagram]);

  // const { slowZones: prerenderedSlowZones } = useMemo(
  //   () =>
  //     prerenderSlowZones({
  //       date: new Date(),
  //       slowZones,
  //       prerenderedLine: diagram,
  //       lineName,
  //       directions: ['0', '1'],
  //     }),
  //   [slowZones, diagram, lineName]
  // );

  // const { pathDirective, stationPositions, stationsById } = diagram;

  useLayoutEffect(() => {
    if (svg) {
      const paddingX = 2;
      const paddingY = 2;
      const bbox = svg.getBBox();
      const x = Math.round(bbox.x - paddingX);
      const width = Math.round(bbox.width + paddingX * 2);
      const y = Math.round(bbox.y - paddingY);
      const height = Math.round(bbox.height + paddingY * 2);
      if (horizontal && container) {
        const containerWidth = container.getBoundingClientRect().width;
        const mapWidth = Math.min(4 * width, Math.max(Math.max(3 * width, containerWidth)));
        const aspectRatio = width / height;
        setViewbox(`${x} ${y} ${width} ${height}`);
        setWidth(mapWidth);
        setHeight(mapWidth / aspectRatio);
      } else {
        const scaleBasis = getScaleBasis(viewportWidth, viewportHeight);
        setViewbox(`${x} ${y} ${width} ${height}`);
        setWidth(width * scaleBasis);
        setHeight(height * scaleBasis);
      }
    }
  }, [svg, container, line, viewportWidth, viewportHeight, horizontal]);

  const renderLine = () => {
    return <path d={pathDirective} stroke={line.color} fill="transparent" />;
  };

  // const renderSlowZonesOnLine = () => {
  //   return prerenderedSlowZones.map((zone) => {
  //     const slowness = getSlownessFactor(Object.values(zone.matches));
  //     return (
  //       <path
  //         key={`zone-${zone.id}`}
  //         d={zone.pathDirective}
  //         strokeOpacity={sigmoid(slowness)}
  //         stroke={lineColor}
  //         strokeWidth="3"
  //         fill="transparent"
  //       />
  //     );
  //   });
  // };

  // const renderSlowZoneSummaryIcon = (slownessFactor: number, size = 3) => {
  //   const rectAngles =
  //     slownessFactor > 0.5 ? [75, 45, 15] : slownessFactor > 0.25 ? [67.5, 22.5] : [45];
  //   return (
  //     <g>
  //       {rectAngles.map((angle, index) => (
  //         <rect
  //           x={-size / 2}
  //           y={-size / 2}
  //           width={size}
  //           height={size}
  //           key={index}
  //           transform={`rotate(${angle})`}
  //           fill={lineColor}
  //           opacity={1 - index / 4}
  //         />
  //       ))}
  //     </g>
  //   );
  // };

  // const renderSlowZonesInfo = () => {
  //   return prerenderedSlowZones.map((zone) => {
  //     const {
  //       matches,
  //       pathDirectiveBounds: { left, right, top, bottom },
  //     } = zone;
  //     if (!Object.keys(matches).length) {
  //       return null;
  //     }
  //     const offsetX = 0;
  //     const offsetY = 0;
  //     const x0 = (left + right) / 2 + offsetX;
  //     const y0 = (top + bottom) / 2 + offsetY;
  //     return (
  //       <g
  //         key={`zoneinfo-${zone.id}`}
  //         transform={`translate(${x0} ${y0}) rotate(${horizontal ? 90 : 0})`}
  //       >
  //         {['0', '1'].map((direction, index) => {
  //           const matchingZone = matches[direction];
  //           if (!matchingZone) {
  //             return null;
  //           }
  //           const slowness = getSlownessFactor(matchingZone);
  //           const totalDelayString = stringifyTime(matchingZone.delay, {
  //             showHours: false,
  //             showSeconds: true,
  //             truncateLeadingMinutesZeros: true,
  //           });
  //           const gx = 0;
  //           const gy = -4 * (index + 1);
  //           return (
  //             <g key={index} transform={`translate(${gx} ${gy})`}>
  //               {renderSlowZoneSummaryIcon(slowness)}
  //               <text fontSize="3" key={direction} x="3" y="1">
  //                 +{totalDelayString}
  //               </text>
  //             </g>
  //           );
  //         })}
  //       </g>
  //     );
  //   });
  // };

  const renderStationDots = () => {
    return Object.entries(stationPositions).map(([stationId, pos]) => {
      return (
        <circle
          cx={0}
          cy={0}
          r={1.5}
          key={`${stationId}-dot`}
          transform={`translate(${pos.x}, ${pos.y})`}
          fill="white"
          stroke={line.color}
        />
      );
    });
  };

  const renderStationLabels = () => {
    return Object.entries(stationPositions).map(([stationId, pos]) => {
      const stationName = abbreviateStationName(stationsById[stationId].stop_name);
      if (stationName) {
        return (
          <text
            key={`station-label-${stationId}`}
            fontSize={4}
            fill="#333"
            textAnchor="end"
            x={-4}
            y={1.5}
            aria-hidden="true"
            transform={`translate(${pos.x} ${pos.y}) rotate(${horizontal ? 45 : 0})`}
          >
            {stationName}
          </text>
        );
      }
      return null;
    });
  };

  return (
    <div className={styles.container} ref={setContainer}>
      <div className={styles.inner}>
        <svg
          ref={setSvg}
          width={width ?? undefined}
          height={height ?? undefined}
          viewBox={viewbox ?? undefined}
        >
          <g transform={`rotate(${horizontal ? -90 : 0})`}>
            {renderLine()}
            {/* {renderSlowZonesOnLine()}
            {renderSlowZonesInfo()} */}
            {renderStationDots()}
            {renderStationLabels()}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SlowZonesMap;
