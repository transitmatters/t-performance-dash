import React, { useMemo } from 'react';
import classNames from 'classnames';

import { getParentStationForStopId } from '../../../common/utils/stations';

import { BasicWidgetDataLayout } from '../../../common/components/widgets/internal/BasicWidgetDataLayout';
import { TimeWidgetValue } from '../../../common/types/basicWidgets';
import type { SlowZoneResponse, SpeedRestriction } from '../../../common/types/dataPoints';
import { prettyDate } from '../../../common/utils/date';
import type { ByDirection, SlowZoneDirection, SlowZonesSegment } from './segment';

import { DIRECTIONS } from './segment';
import { DirectionIndicator } from './DirectionIndicator';

import styles from './SlowZonesTooltip.module.css';

interface SlowZonesTooltipProps {
  segment: SlowZonesSegment;
  isHorizontal: boolean;
  color: string;
}

const getOrderedStationNames = (slowZones: ByDirection<SlowZoneResponse[]>) => {
  const {
    ['0']: [zeroSide],
    ['1']: [oneSide],
  } = slowZones;
  if (zeroSide) {
    const { fr_id, to_id } = zeroSide;
    return {
      fromStationName: getParentStationForStopId(fr_id).stop_name,
      toStationName: getParentStationForStopId(to_id).stop_name,
    };
  }
  if (oneSide) {
    const { fr_id, to_id } = oneSide;
    return {
      fromStationName: getParentStationForStopId(to_id).stop_name,
      toStationName: getParentStationForStopId(fr_id).stop_name,
    };
  }
  return {};
};

export const SlowZonesTooltip: React.FC<SlowZonesTooltipProps> = ({
  isHorizontal,
  color,
  segment: { slowZones, speedRestrictions },
}) => {
  const { fromStationName, toStationName } = useMemo(
    () => getOrderedStationNames(slowZones)!,
    [slowZones]
  );

  if (!fromStationName || !toStationName) {
    return null;
  }

  const renderSpeedRestrictions = (speedRestrictions: SpeedRestriction[]) => {
    if (speedRestrictions.length) {
      const minimumSpeed = speedRestrictions.reduce(
        (min, sr) => Math.min(min, sr.speedMph),
        Infinity
      );
      const totalFeet = speedRestrictions.reduce((sum, sr) => sum + sr.trackFeet, 0);
      const [oldest] = speedRestrictions
        .filter((sr) => sr.reported)
        .map((sr) => new Date(sr.reported).toISOString())
        .sort();
      const oldestString = prettyDate(oldest, false);
      return (
        <div
          className={classNames(
            styles.speedRestriction,
            'bg-slate-200 text-base text-xs text-slate-700'
          )}
        >
          <b>MBTA speed restrictions</b>
          <div className={styles.speedRestrictionStats}>
            <div>
              <i>Total:</i> {totalFeet} feet
            </div>
            <div>
              <i>Slowest:</i> {minimumSpeed} mph
            </div>
            <div>
              <i>Oldest:</i> {oldestString}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSlowZoneForDirection = (direction: SlowZoneDirection) => {
    const [slowZone] = slowZones[direction];
    const speedRestrictionsForDirection = speedRestrictions[direction];
    if (slowZone) {
      return (
        <div className={styles.direction}>
          <BasicWidgetDataLayout
            widgetValue={new TimeWidgetValue(slowZone.delay + slowZone.baseline, slowZone.delay)}
            title={
              <div
                className={styles.directionTitle}
                style={{ flexDirection: isHorizontal && direction === '0' ? 'row-reverse' : 'row' }}
              >
                <DirectionIndicator
                  color={color}
                  size={10}
                  isHorizontal={isHorizontal}
                  direction={direction}
                />
                {direction === '0' ? 'Southbound' : 'Northbound'}
              </div>
            }
            layoutKind="delta-and-percent-change"
            analysis="over baseline"
          />
          {renderSpeedRestrictions(speedRestrictionsForDirection)}
        </div>
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
        <div className={styles.body} style={{ flexDirection: isHorizontal ? 'row' : 'column' }}>
          {DIRECTIONS.map((direction) => renderSlowZoneForDirection(direction))}
        </div>
      </div>
    </div>
  );
};
