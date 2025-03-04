import type { SegmentLocation } from '@transitmatters/stripmap';

export type SegmentDirection = '0' | '1';

export type ByDirection<T> = Record<SegmentDirection, T>;

export type WithSegmentLocation<T> = {
  segmentLocation: SegmentLocation;
  direction: SegmentDirection;
  value: T;
};

export type SegmentationResult<T> = {
  segments: T[];
  effectiveDate: Date;
};
