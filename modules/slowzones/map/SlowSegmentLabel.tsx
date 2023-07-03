import React, { useMemo } from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineMetadata } from '../../../common/types/lines';

import { getFormattedTimeString } from '../../../common/utils/time';
import type { SlowZoneDirection, SlowZonesSegment } from './segment';
import { DIRECTIONS } from './segment';

import styles from './SlowSegmentLabel.module.css';
import { DirectionIndicator } from './DirectionIndicator';

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
  slowZone: { delay, baseline },
}) => {
  const delayString = useMemo(() => getFormattedTimeString(delay), [delay]);

  const fractionOverBaseline = -1 + (delay + baseline) / baseline;

  return (
    <div
      style={{
        flexDirection: isHorizontal && direction === '0' ? 'row-reverse' : 'row',
        fontWeight: fractionOverBaseline >= 0.5 ? 'bold' : 'normal',
      }}
      className={styles.slowZoneLabel}
    >
      <DirectionIndicator
        direction={direction}
        color={color}
        isHorizontal={isHorizontal}
        size={2}
      />
      +{delayString}
    </div>
  );
};

interface SlowSegmentLabelProps {
  segment: SlowZonesSegment;
  line: LineMetadata;
  isHorizontal: boolean;
}

export const SlowSegmentLabel: React.FC<SlowSegmentLabelProps> = (props) => {
  const {
    isHorizontal,
    segment: { slowZones },
    line,
  } = props;
  return (
    <div className={styles.slowSegmentLabel}>
      {DIRECTIONS.map((direction) => {
        const [zone] = slowZones[direction];
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
