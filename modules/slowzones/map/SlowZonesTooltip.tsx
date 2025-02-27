import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { TooltipSide } from '@transitmatters/stripmap';

import { getParentStationForStopId } from '../../../common/utils/stations';

import { BasicWidgetDataLayout } from '../../../common/components/widgets/internal/BasicWidgetDataLayout';
import { DeltaTimeWidgetValue } from '../../../common/types/basicWidgets';
import type { SlowZoneResponse, SpeedRestriction } from '../../../common/types/dataPoints';
import { prettyDate } from '../../../common/utils/date';

import { TODAY_STRING } from '../../../common/constants/dates';
import { useDelimitatedRoute } from '../../../common/utils/router';
import type { ByDirection, SegmentDirection } from '../../../common/types/map';
import { DIRECTIONS } from '../../../common/utils/mapSegments';
import type { SlowZonesSegment } from './segment';
import { DirectionIndicator } from './DirectionIndicator';

import styles from './SlowZonesTooltip.module.css';

interface SlowZonesTooltipProps {
  segment: SlowZonesSegment;
  color: string;
  side: TooltipSide;
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

export const SlowZonesTooltip: React.FC<SlowZonesTooltipProps> = (props) => {
  const {
    side,
    color,
    segment: { slowZones, speedRestrictions },
  } = props;
  const {
    query: { endDate },
  } = useDelimitatedRoute();

  const isHorizontal = side === 'top';

  const { fromStationName, toStationName } = useMemo(
    () => getOrderedStationNames(slowZones),
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
        .map((sr) => sr.reported)
        .sort();
      const oldestString = prettyDate(oldest, false);
      return (
        <div className={classNames(styles.speedRestriction, 'stone bg-slate-200 text-xs')}>
          <b>MBTA speed restrictions</b>
          <div className={styles.speedRestrictionStats}>
            <div>
              <i>Total:</i> {totalFeet} feet
            </div>
            <div>
              <i>Slowest:</i> {minimumSpeed} mph
            </div>
            <div>
              <i>Since:</i> {oldestString}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSlowZoneForDirection = (direction: SegmentDirection) => {
    const isToday = endDate === TODAY_STRING;

    const [slowZone] = slowZones[direction];
    const speedRestrictionsForDirection = speedRestrictions[direction];
    if (slowZone) {
      const delayVal = isToday && slowZone.latest_delay ? slowZone.latest_delay : slowZone.delay;
      return (
        <div className={styles.direction}>
          <BasicWidgetDataLayout
            widgetValue={new DeltaTimeWidgetValue(delayVal + slowZone.baseline, delayVal)}
            key={`${slowZone.fr_id}${slowZone.to_id}`}
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
            layoutKind="delta-and-percent-change"
            analysis="compared to peak"
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
