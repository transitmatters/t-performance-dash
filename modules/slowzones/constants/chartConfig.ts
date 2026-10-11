import type { CartesianScaleTypeRegistry, ScaleOptionsByType } from 'chart.js';
import type { CSSProperties } from 'react';

export const stationAxisConfig: Partial<ScaleOptionsByType<keyof CartesianScaleTypeRegistry>> = {
  position: 'top',
  beginAtZero: true,
};

const SEGMENT_ROW_HEIGHT = 40;
const SEGMENT_COLUMN_WIDTH = 64;
// Room for the date axis, so a chart with only a segment or two still has space for its bars.
const DATE_AXIS_HEIGHT = 48;
const DATE_AXIS_WIDTH = 72;

export const getLineSegmentsContainerStyle = (
  segmentCount: number,
  isMobile: boolean
): CSSProperties => {
  const count = Math.max(segmentCount, 1);
  return isMobile
    ? { width: count * SEGMENT_COLUMN_WIDTH + DATE_AXIS_WIDTH, minWidth: '100%', height: 480 }
    : { height: count * SEGMENT_ROW_HEIGHT + DATE_AXIS_HEIGHT };
};
