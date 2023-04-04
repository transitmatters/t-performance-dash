import React, { useMemo } from 'react';
import classNames from 'classnames';

import { getParentStationForStopId } from '../../../common/utils/stations';

import { BasicWidgetDataLayout } from '../../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../../common/types/basicWidgets';
import type { SlowZoneDirection, SlowZonesSegment } from './segment';
import { DIRECTIONS } from './segment';

import styles from './SlowZonesTooltip.module.css';
import DirectionIndicator from './DirectionIndicator';

type Props = {
  segment: SlowZonesSegment;
  isHorizontal: boolean;
  color: string;
};

const getOrderedStationNames = (slowZonesByDirection: SlowZonesSegment['slowZonesByDirection']) => {
  if (slowZonesByDirection['0']) {
    const { fr_id, to_id } = slowZonesByDirection['0'];
    return {
      fromStationName: getParentStationForStopId(fr_id).stop_name,
      toStationName: getParentStationForStopId(to_id).stop_name,
    };
  }
  if (slowZonesByDirection['1']) {
    const { fr_id, to_id } = slowZonesByDirection['1'];
    return {
      fromStationName: getParentStationForStopId(to_id).stop_name,
      toStationName: getParentStationForStopId(fr_id).stop_name,
    };
  }
};

const SlowZonesTooltip = (props: Props) => {
  const {
    isHorizontal,
    color,
    segment: { slowZonesByDirection },
  } = props;

  const { fromStationName, toStationName } = useMemo(
    () => getOrderedStationNames(slowZonesByDirection)!,
    [slowZonesByDirection]
  );

  const renderSlowZoneForDirection = (direction: SlowZoneDirection) => {
    const slowZone = slowZonesByDirection[direction];
    if (slowZone) {
      return (
        <BasicWidgetDataLayout
          widgetValue={new TimeWidgetValue(slowZone.delay, 0)}
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
          analysis="since last xyz"
        />
      );
    }
    return null;
  };

  return (
    <div
      style={{ '--tooltip-accent-color': color } as React.CSSProperties}
      className={classNames(styles.slowZonesTooltip, isHorizontal && styles.horizontal)}
    >
      <div className={isHorizontal ? styles.triangleHorizontal : styles.triangle}></div>
      <div className={classNames(styles.content, 'shadow-dataBox')}>
        <div className={classNames(styles.title)}>
          {fromStationName} — {toStationName}
        </div>
        <div className={styles.body}>
          {DIRECTIONS.map((direction) => renderSlowZoneForDirection(direction))}
        </div>
      </div>
    </div>
  );
};

export default SlowZonesTooltip;
