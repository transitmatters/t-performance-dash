import React from 'react';

interface SparklineProps {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  className?: string;
}

/** A minimal inline-SVG trend line — no axes, legend, or Chart.js — for compact per-row use. */
export const Sparkline: React.FC<SparklineProps> = ({
  values,
  color,
  width = 380,
  height = 32,
  className,
}) => {
  const finite = values.filter((value) => Number.isFinite(value));
  if (finite.length < 2) return null;

  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  // Half the stroke width would otherwise be clipped at the min/max points, since they'd land
  // exactly on y=0/y=height — pad the plot area so the line has room to breathe.
  const padding = 4;
  const plotHeight = height - padding * 2;

  const points = values.map((value, index) => {
    const x = index * step;
    const y = Number.isFinite(value)
      ? padding + plotHeight - ((value - min) / range) * plotHeight
      : null;
    return { x, y };
  });

  const path = points.reduce((d, point, index) => {
    if (point.y === null) return d;
    const prevDrawn = index > 0 && points[index - 1].y !== null;
    return `${d}${d && prevDrawn ? ' L' : ' M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, '');

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: 'block' }}
    >
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} />
    </svg>
  );
};
