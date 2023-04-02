import React, { useState, useMemo, useLayoutEffect } from 'react';

import type { Station } from '../types/stations';
import type { Diagram } from '../diagrams';
import { useViewport } from '../hooks/useViewport';
import { useBreakpoint } from '../hooks/useBreakpoint';

import styles from './LineMap.module.css';

type StrokeOptions = {
  stroke: string;
  strokeWidth: number;
  opacity: number;
};

type OffsetStrokeOptions = StrokeOptions & { offset?: number };

type SegmentLocation = {
  fromStationId: string;
  toStationId: string;
};

export type SegmentRenderOptions = {
  location: SegmentLocation;
  strokes: Partial<OffsetStrokeOptions>[];
};

type Props = {
  diagram: Diagram;
  direction?: 'vertical' | 'horizontal' | 'horizontal-on-desktop';
  getStationLabel?: (options: { stationId: string; stationName: string }) => string;
  strokeOptions?: Partial<StrokeOptions>;
  segments?: SegmentRenderOptions[];
};

const getPropsForStrokeOptions = (options: Partial<StrokeOptions>) => {
  return {
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 1,
    opacity: 1,
    ...options,
  };
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

const LineMap = (props: Props) => {
  const {
    diagram,
    direction = 'horizontal-on-desktop',
    getStationLabel,
    strokeOptions = {},
    segments = [],
  } = props;

  const [svg, setSvg] = useState<null | SVGSVGElement>(null);
  const [container, setContainer] = useState<null | HTMLElement>(null);
  const [width, setWidth] = useState<null | number>(null);
  const [height, setHeight] = useState<null | number>(null);
  const [viewbox, setViewbox] = useState<null | string>(null);

  const { viewportWidth, viewportHeight } = useViewport();
  const isMobile = !useBreakpoint('lg');
  const horizontal = direction === 'horizontal-on-desktop' ? !isMobile : direction === 'horizontal';

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

  const computedStrokes = useMemo(() => {
    return segments.map((segment) => {
      const {
        location: { fromStationId, toStationId },
        strokes,
      } = segment;
      const path = diagram.getPathBetweenStations(fromStationId, toStationId);
      return strokes.map((stroke) => {
        const pathDirective = path.offset(stroke.offset ?? 0).toSVG();
        return { pathDirective, ...stroke };
      });
    });
  }, [segments, diagram]);

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
  }, [svg, container, viewportWidth, viewportHeight, horizontal]);

  const renderStationDots = () => {
    const strokeProps = getPropsForStrokeOptions(strokeOptions);
    return Object.entries(stationPositions).map(([stationId, pos]) => {
      return (
        <circle
          cx={0}
          cy={0}
          r={1.5}
          key={`${stationId}-dot`}
          transform={`translate(${pos.x}, ${pos.y})`}
          {...strokeProps}
          fill="white"
        />
      );
    });
  };

  const renderStationLabels = () => {
    return Object.entries(stationPositions).map(([stationId, pos]) => {
      const stationName = stationsById[stationId].stop_name;
      const stationLabel = getStationLabel?.({ stationId, stationName }) ?? stationName;
      if (stationLabel) {
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
            {stationLabel}
          </text>
        );
      }
      return null;
    });
  };

  const renderLine = () => {
    return (
      <path d={pathDirective} fill="transparent" {...getPropsForStrokeOptions(strokeOptions)} />
    );
  };

  const renderComputedStrokes = () => {
    return computedStrokes
      .map((segment, segmentIndex) => {
        return segment.map((stroke, strokeIndex) => {
          return (
            <path
              key={`computed-stroke-${segmentIndex}-${strokeIndex}`}
              d={stroke.pathDirective}
              {...getPropsForStrokeOptions(stroke)}
            />
          );
        });
      })
      .flat();
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
            {renderComputedStrokes()}
            {renderStationDots()}
            {renderStationLabels()}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LineMap;
