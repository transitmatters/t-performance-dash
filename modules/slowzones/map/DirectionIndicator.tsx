import React from 'react';

import type { SlowZoneDirection } from './segment';

import styles from './DirectionIndicator.module.css';

interface Props {
  direction: SlowZoneDirection;
  color: string;
  isHorizontal: boolean;
  size?: number;
}

export const DirectionIndicator: React.FC<Props> = ({
  direction,
  color,
  isHorizontal,
  size = 5,
}) => {
  const rotation = isHorizontal ? (direction === '1' ? 90 : 270) : direction === '1' ? 180 : 0;
  return (
    <div
      className={styles.directionIndicator}
      style={{
        borderTopColor: color,
        borderLeftWidth: size / 2,
        borderRightWidth: size / 2,
        borderTopWidth: size,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};
