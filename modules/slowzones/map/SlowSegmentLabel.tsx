import React, { useMemo } from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineMetadata } from '../../../common/types/lines';
import { stringifyTime } from '../../../common/utils/time';

import type { SlowZoneDirection, SlowZonesByDirection } from './segment';
import { DIRECTIONS } from './segment';

import styles from './SlowSegmentLabel.module.css';
import DirectionIndicator from './DirectionIndicator';

interface SlowSegmentLabelProps {
  slowZonesByDirection: SlowZonesByDirection;
  line: LineMetadata;
  isHorizontal: boolean;
}

interface SlowZoneLabelProps {
  direction: SlowZoneDirection;
  slowZone: SlowZoneResponse;
  color: string;
  isHorizontal: boolean;
}

const SlowZoneLabel: React.FC<SlowZoneLabelProps> = ({
  direction,
  isHorizontal,
  color,
  slowZone: { delay },
}) => {
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
      style={{ flexDirection: isHorizontal && direction === '0' ? 'row-reverse' : 'row' }}
      className={styles.slowZoneLabel}
    >
      <DirectionIndicator
        direction={direction}
        color={color}
        isHorizontal={isHorizontal}
        size={2}
      />
      {delayString}
    </div>
  );
};

export const SlowSegmentLabel: React.FC<SlowSegmentLabelProps> = (props) => {
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
