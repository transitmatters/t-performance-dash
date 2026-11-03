import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { TooltipSide } from '@transitmatters/stripmap';

import { getStationById } from '../../../common/utils/stations';

import { BasicWidgetDataLayout } from '../../../common/components/widgets/internal/BasicWidgetDataLayout';
import { MPHWidgetValue } from '../../../common/types/basicWidgets';

import type { ByDirection, SegmentDirection } from '../../../common/types/map';

import { DirectionIndicator } from '../../slowzones/map/DirectionIndicator';
import { DIRECTIONS } from '../../../common/utils/mapSegments';
import styles from './SegmentSpeedTooltip.module.css';
import type { SpeedPairData, SpeedSegment } from './segment';

interface SegmentSpeedTooltipProps {
  segment: SpeedSegment;
  color: string;
  side: TooltipSide;
}

const getOrderedStationNames = (slowZones: ByDirection<SpeedPairData[]>) => {
  const {
    ['0']: [zeroSide],
    ['1']: [oneSide],
  } = slowZones;
  if (zeroSide) {
    const { from_id, to_id } = zeroSide;
    return {
      fromStationName: getStationById(from_id).stop_name,
      toStationName: getStationById(to_id).stop_name,
    };
  }
  if (oneSide) {
    const { from_id, to_id } = oneSide;
    return {
      fromStationName: getStationById(to_id).stop_name,
      toStationName: getStationById(from_id).stop_name,
    };
  }
  return {};
};

export const SegmentSpeedTooltip: React.FC<SegmentSpeedTooltipProps> = (props) => {
  const {
    side,
    color,
    segment: { segments },
  } = props;
  const isHorizontal = side === 'top';

  const { fromStationName, toStationName } = useMemo(
    () => getOrderedStationNames(segments),
    [segments]
  );

  if (!fromStationName || !toStationName) {
    return null;
  }

  const renderSlowZoneForDirection = (direction: SegmentDirection) => {
    const [segment] = segments[direction];
    if (segment) {
      const speedVal = segment.speed;
      return (
        <div className={styles.direction}>
          <BasicWidgetDataLayout
            widgetValue={new MPHWidgetValue(speedVal)}
            key={`${segment.from_id}${segment.to_id}`}
            title={
              <div className={styles.directionTitle}>
                <DirectionIndicator
                  color={color}
                  size={10}
                  isHorizontal={isHorizontal}
                  direction={direction}
                />
                {direction === '0' ? 'Southbound' : 'Northbound'}
              </div>
            }
            layoutKind="no-delta"
            analysis="*not including dwell time"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{ '--tooltip-accent-color': color } as React.CSSProperties}
      className={classNames(
        styles.slowZonesTooltip,
        isHorizontal && styles.horizontal,
        side === 'left' && styles.reverseVertical
      )}
    >
      <div
        className={classNames(
          isHorizontal ? styles.triangleHorizontal : styles.triangle,
          side === 'left' && styles.triangleReverse
        )}
      ></div>
      <div className={classNames(styles.content, 'shadow-dataBox')}>
        <div className={classNames(styles.title)}>
          {fromStationName} — {toStationName}
        </div>
        <div className={styles.body} style={{ flexDirection: isHorizontal ? 'row' : 'column' }}>
          {DIRECTIONS.map((direction) => renderSlowZoneForDirection(direction))}
        </div>
      </div>
    </div>
  );
};
