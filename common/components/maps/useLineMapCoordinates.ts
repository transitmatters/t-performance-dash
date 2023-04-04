import { useCallback, useLayoutEffect, useState } from 'react';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useViewport } from '../../hooks/useViewport';

import type { Props as LineMapProps } from './LineMap';

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

export const useLineMapCoordinates = (options: Options) => {
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

  const svgToViewport: CoordinateTransform = useCallback(
    (svgPoint: Point): Point => {
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = svgPoint.x;
        pt.y = svgPoint.y;
        const transformed = pt.matrixTransform(svg.getScreenCTM()!);
        return {
          x: transformed.x,
          y: transformed.y,
        };
      }
      return { x: 0, y: 0 };
    },
    [svg]
  );

  const viewportToSvg: CoordinateTransform = useCallback(
    (viewportPoint: Point) => {
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = viewportPoint.x;
        pt.y = viewportPoint.y;
        const transformed = pt.matrixTransform(svg.getScreenCTM()!.inverse());
        return {
          x: transformed.x,
          y: transformed.y,
        };
      }
      return { x: 0, y: 0 };
    },
    [svg]
  );

  return {
    svgProps,
    svgRef: setSvg,
    containerRef: setContainer,
    isHorizontal,
    viewportToSvg,
    svgToViewport,
  };
};
