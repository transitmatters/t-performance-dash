import React, { useMemo } from 'react';

import type { Station } from '../../types/stations';

import type { Path, Diagram, SegmentLocation } from './diagrams';
import { useDiagramCoordinates } from './useDiagramCoordinates';
import { useLineTooltip } from './useLineTooltip';

import styles from './LineMap.module.css';

type MapSide = '0' | '1';

type StrokeOptions = {
  stroke: string;
  strokeWidth: number;
  opacity: number;
};

type Rect = ReturnType<InstanceType<typeof Path>['getBounds']>;

type OffsetStrokeOptions = StrokeOptions & { offset?: number };

export type SegmentLabel = {
  mapSide: MapSide;
  boundingSize?: number;
  offset?: { x: number; y: number };
  content: (size: { width: number; height: number }) => React.ReactNode;
};

export type SegmentRenderOptions = {
  location: SegmentLocation;
  strokes?: Partial<OffsetStrokeOptions>[];
  labels?: SegmentLabel[];
};

type TooltipRenderer = (props: {
  segmentLocation: SegmentLocation<true>;
  isHorizontal: boolean;
}) => React.ReactNode;

type TooltipOptions = {
  render: TooltipRenderer;
  snapToSegment?: boolean;
  maxDistance?: number;
};

export interface LineMapProps {
  diagram: Diagram;
  direction?: 'vertical' | 'horizontal' | 'horizontal-on-desktop';
  strokeOptions?: Partial<StrokeOptions>;
  tooltip?: TooltipOptions;
  getStationLabel?: (options: { stationId: string; stationName: string }) => string;
  getScaleBasis?: (viewport: { width: null | number; height: null | number }) => number;
  getSegments?: (options: { isHorizontal: boolean }) => SegmentRenderOptions[];
}

const getPropsForStrokeOptions = (options: Partial<StrokeOptions>) => {
  return {
    fill: 'transparent',
    stroke: 'black',
    strokeWidth: 1,
    opacity: 1,
    ...options,
  };
};

const getSegmentLabelBounds = (
  segmentBounds: Rect,
  segmentLabel: SegmentLabel,
  isHorizontal: boolean
) => {
  const { top, left, right, width, height } = segmentBounds;
  const { boundingSize = 10, offset: providedOffset, mapSide } = segmentLabel;
  const offset = providedOffset || { x: 0, y: 0 };
  if (isHorizontal) {
    const moveAcross = mapSide === '0';
    return {
      x: top + offset.x,
      y: 0 - left - (moveAcross ? boundingSize + width : 0) + offset.y,
      width: height,
      height: boundingSize,
    } as const;
  }
  const moveAcross = mapSide === '1';
  return {
    x: right - (moveAcross ? boundingSize + width : 0) + offset.x,
    y: top + offset.y,
    height,
    width: boundingSize,
  };
};

export const LineMap: React.FC<LineMapProps> = ({
  diagram,
  direction = 'horizontal-on-desktop',
  getStationLabel,
  getScaleBasis,
  strokeOptions = {},
  tooltip,
  getSegments,
}) => {
  const {
    svgRef,
    svgProps,
    containerRef,
    isHorizontal,
    viewportCoordsToContainer,
    viewportCoordsToDiagram,
    diagramCoordsToViewport,
  } = useDiagramCoordinates({
    getScaleBasis,
    direction,
  });

  const {
    viewportCoordinates: tooltipViewportCoordinates,
    segmentLocation: tooltipSegmentLocation,
  } = useLineTooltip({
    diagram,
    diagramCoordsToViewport,
    viewportCoordsToDiagram,
    snapToSegment: !!tooltip?.snapToSegment,
    enabled: !!tooltip,
    maxDistance: tooltip?.maxDistance,
  });

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

  const computedSegmentExtras = useMemo(() => {
    const segments = getSegments ? getSegments({ isHorizontal }) : [];
    return segments.map((segment) => {
      const {
        location: { fromStationId, toStationId },
        strokes = [],
        labels = [],
      } = segment;

      const path = diagram.getPathBetweenStations(fromStationId, toStationId);
      const bounds = path.getBounds();

      const computedStrokes = strokes.map((stroke) => {
        const pathDirective = path.offset(stroke.offset ?? 0).toSVG();
        return { pathDirective, stroke };
      });

      const computedLabels = labels.map((label, index) => {
        const { x, y, width, height } = getSegmentLabelBounds(bounds, label, isHorizontal);
        return (
          <g
            key={`label-${fromStationId}-${toStationId}-${index}`}
            transform={`translate(${x}, ${y})`}
          >
            <rect x={0} y={0} width={width} height={height} fill="transparent" />
            {label.content({ width, height })}
          </g>
        );
      });

      return { computedStrokes, computedLabels };
    });
  }, [getSegments, diagram, isHorizontal]);

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
            transform={`translate(${pos.x} ${pos.y}) rotate(${isHorizontal ? 45 : 0})`}
          >
            {stationLabel}
          </text>
        );
      }
      return null;
    });
  };

  const renderLine = () => {
    return <path d={pathDirective} {...getPropsForStrokeOptions(strokeOptions)} />;
  };

  const renderComputedStrokes = () => {
    return computedSegmentExtras
      .map((segment, segmentIndex) => {
        return segment.computedStrokes.map(({ pathDirective, stroke }, strokeIndex) => {
          return (
            <path
              key={`computed-stroke-${segmentIndex}-${strokeIndex}`}
              d={pathDirective}
              {...getPropsForStrokeOptions(stroke)}
            />
          );
        });
      })
      .flat();
  };

  const renderComputedLabels = () => {
    const transform = isHorizontal ? 'rotate(90)' : undefined;
    return (
      <g transform={transform}>
        {computedSegmentExtras.map((segment) => segment.computedLabels).flat()}
      </g>
    );
  };

  const renderTooltip = () => {
    const tooltipContents =
      tooltipSegmentLocation &&
      tooltip?.render({ segmentLocation: tooltipSegmentLocation, isHorizontal });
    if (tooltipViewportCoordinates && tooltipContents) {
      const { x, y } = viewportCoordsToContainer(tooltipViewportCoordinates);
      return (
        <div
          className={styles.tooltipContainer}
          style={{
            left: x,
            top: y,
            transform: isHorizontal ? `translateY(-100%) translateX(-50%)` : `translateY(-50%)`,
          }}
        >
          {tooltipContents}
        </div>
      );
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inner}>
        <svg ref={svgRef} {...svgProps}>
          <g transform={`rotate(${isHorizontal ? -90 : 0})`}>
            {renderLine()}
            {renderComputedStrokes()}
            {renderComputedLabels()}
            {renderStationDots()}
            {renderStationLabels()}
          </g>
        </svg>
      </div>
      {renderTooltip()}
    </div>
  );
};
