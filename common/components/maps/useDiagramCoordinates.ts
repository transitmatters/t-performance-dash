import { useCallback, useLayoutEffect, useState } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useViewport } from '../../hooks/useViewport';

import type { LineMapProps as LineMapProps } from './LineMap';

type Options = Pick<LineMapProps, 'getScaleBasis' | 'direction'>;

type SvgProps = {
  width: number;
  height: number;
  viewBox: string;
};

type Point = {
  x: number;
  y: number;
};

export type CoordinateTransform = (p: Point) => Point;

const defaultGetScaleBasis = (viewport: { width: null | number; height: null | number }) => {
  const { width, height } = viewport;
  const MAX_SCALE_BASIS = 3.5;
  if (width && height) {
    if (width > 750) {
      return MAX_SCALE_BASIS;
    }
    return Math.min(MAX_SCALE_BASIS, height / 100);
  }
  return MAX_SCALE_BASIS;
};

export const useDiagramCoordinates = (options: Options) => {
  const { direction, getScaleBasis = defaultGetScaleBasis } = options;
  const [svg, setSvg] = useState<null | SVGSVGElement>(null);
  const [container, setContainer] = useState<null | HTMLElement>(null);
  const [svgProps, setSvgProps] = useState<null | SvgProps>(null);

  const { viewportWidth, viewportHeight } = useViewport();
  const isMobile = !useBreakpoint('lg');
  const isHorizontal =
    direction === 'horizontal-on-desktop' ? !isMobile : direction === 'horizontal';

  useLayoutEffect(() => {
    if (svg) {
      const paddingX = 2;
      const paddingY = 2;
      const bbox = svg.getBBox();
      const x = Math.round(bbox.x - paddingX);
      const width = Math.round(bbox.width + paddingX * 2);
      const y = Math.round(bbox.y - paddingY);
      const height = Math.round(bbox.height + paddingY * 2);
      if (isHorizontal && container) {
        const containerWidth = container.getBoundingClientRect().width;
        const mapWidth = Math.min(4 * width, Math.max(Math.max(3 * width, containerWidth)));
        const aspectRatio = width / height;
        setSvgProps({
          viewBox: `${x} ${y} ${width} ${height}`,
          width: mapWidth,
          height: mapWidth / aspectRatio,
        });
      } else {
        const scaleBasis = getScaleBasis({ width: viewportWidth, height: viewportHeight });
        setSvgProps({
          viewBox: `${x} ${y} ${width} ${height}`,
          width: width * scaleBasis,
          height: height * scaleBasis,
        });
      }
    }
  }, [svg, container, viewportWidth, viewportHeight, getScaleBasis, isHorizontal]);

  const viewportCoordsToDiagram: CoordinateTransform = useCallback(
    (viewportPoint: Point) => {
      if (svg) {
        const rotation = isHorizontal ? -90 : 0;
        const pt = svg.createSVGPoint();
        pt.x = viewportPoint.x;
        pt.y = viewportPoint.y;
        const transformed = pt.matrixTransform(svg.getScreenCTM()!.rotate(rotation).inverse());
        return {
          x: transformed.x,
          y: transformed.y,
        };
      }
      return { x: 0, y: 0 };
    },
    [svg, isHorizontal]
  );

  const diagramCoordsToViewport: CoordinateTransform = useCallback(
    (mapPoint: Point) => {
      if (svg) {
        const rotation = isHorizontal ? -90 : 0;
        const pt = svg.createSVGPoint();
        pt.x = mapPoint.x;
        pt.y = mapPoint.y;
        const transformed = pt.matrixTransform(svg.getScreenCTM()!.rotate(rotation));
        return {
          x: transformed.x,
          y: transformed.y,
        };
      }
      return { x: 0, y: 0 };
    },
    [svg, isHorizontal]
  );

  const viewportCoordsToContainer: CoordinateTransform = useCallback(
    (viewportPoint: Point) => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const containerX = viewportPoint.x - rect.left;
        const containerY = viewportPoint.y - rect.top;
        return { x: containerX, y: containerY };
      }
      return { x: 0, y: 0 };
    },
    [container]
  );

  return {
    svgProps,
    svgRef: setSvg,
    containerRef: setContainer,
    isHorizontal,
    viewportCoordsToDiagram,
    viewportCoordsToContainer,
    diagramCoordsToViewport,
  };
};
