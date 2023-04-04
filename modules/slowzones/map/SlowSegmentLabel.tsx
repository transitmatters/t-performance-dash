import React, { useMemo } from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineMetadata } from '../../../common/types/lines';
import { stringifyTime } from '../../../common/utils/time';

import type { SlowZoneDirection, SlowZonesByDirection } from './segment';

import styles from './SlowZonesMap.module.css';

type SlowSegmentLabelProps = {
  slowZonesByDirection: SlowZonesByDirection;
  line: LineMetadata;
  isHorizontal: boolean;
};

type SlowZoneLabelProps = {
  direction: SlowZoneDirection;
  slowZone: SlowZoneResponse;
  color: string;
  isHorizontal: boolean;
};

type SlowZoneIndicatorProps = {
  direction: SlowZoneDirection;
  color: string;
  isHorizontal: boolean;
};

const DIRECTIONS = ['0', '1'];

const SlowZoneIndicator = (props: SlowZoneIndicatorProps) => {
  const { direction, color, isHorizontal } = props;
  const rotation = isHorizontal ? (direction === '0' ? 90 : 270) : direction === '0' ? 180 : 0;
  return (
    <div
      className={styles.slowZoneTriangle}
      style={{ borderTopColor: color, transform: `rotate(${rotation}deg)` }}
    />
  );
};

const SlowZoneLabel = (props: SlowZoneLabelProps) => {
  const {
    direction,
    isHorizontal,
    color,
    slowZone: { delay },
  } = props;

  const delayString = useMemo(
    () =>
      stringifyTime(delay, {
        showHours: false,
        showSeconds: true,
        truncateLeadingMinutesZeros: true,
      }),
    [delay]
  );

  return (
    <div
      style={{ flexDirection: isHorizontal && direction === '1' ? 'row-reverse' : 'row' }}
      className={styles.slowZoneLabel}
    >
      <SlowZoneIndicator direction={direction} color={color} isHorizontal={isHorizontal} />
      {delayString}
    </div>
  );
};

const SlowSegmentLabel = (props: SlowSegmentLabelProps) => {
  const { isHorizontal, slowZonesByDirection, line } = props;
  return (
    <div className={styles.slowSegmentLabel} style={{ marginBottom: isHorizontal ? 1 : 0 }}>
      {DIRECTIONS.map((direction) => {
        const zone = slowZonesByDirection[direction];
        if (!zone) {
          return null;
        }
        return (
          <SlowZoneLabel
            key={direction}
            direction={direction as SlowZoneDirection}
            slowZone={zone}
            color={line.color}
            isHorizontal={isHorizontal}
          />
        );
      })}
    </div>
  );
};

export default SlowSegmentLabel;
