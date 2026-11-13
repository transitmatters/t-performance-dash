import { useRef } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { ChartActions } from './ChartActions';
import { ChartStack } from './ChartStack';

type SvgChartProps = Omit<ComponentProps<typeof ChartActions>, 'chartRef' | 'svgRef'> & {
  children: ReactNode;
};

/**
 * An SVG chart, such as a stripmap line map, with the action row under it. Its PNG is drawn from
 * the SVG, the way a Chart.js chart's is copied from its canvas.
 */
export const SvgChart = ({ children, ...actions }: SvgChartProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <ChartStack>
      <div ref={ref}>{children}</div>
      <ChartActions svgRef={ref} {...actions} />
    </ChartStack>
  );
};
