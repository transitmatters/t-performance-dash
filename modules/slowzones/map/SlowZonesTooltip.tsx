import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { TooltipSide } from '@transitmatters/stripmap';

import { getParentStationForStopId, getStationById } from '../../../common/utils/stations';

import { BasicWidgetDataLayout } from '../../../common/components/widgets/internal/BasicWidgetDataLayout';
import { DeltaTimeWidgetValue } from '../../../common/types/basicWidgets';
import type { SlowZoneResponse, SpeedRestriction } from '../../../common/types/dataPoints';
import { prettyDate } from '../../../common/utils/date';

import { TODAY_STRING } from '../../../common/constants/dates';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { DIRECTIONS } from './segment';
import type { ByDirection, SlowZoneDirection, SlowZonesSegment } from './segment';
import { DirectionIndicator } from './DirectionIndicator';

import styles from './SlowZonesTooltip.module.css';

interface SlowZonesTooltipProps {
  segment: SlowZonesSegment;
  color: string;
  side: TooltipSide;
}

const getOrderedStationNames = (
  slowZones: ByDirection<SlowZoneResponse[]>,
  speedRestrictions: ByDirection<SpeedRestriction[]>
) => {
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
  // Fall back to speed restrictions if no slow zones
  // Note: Speed restrictions use parent station IDs, so we use getStationById
  const {
    ['0']: [zeroSideRestriction],
    ['1']: [oneSideRestriction],
  } = speedRestrictions;
  if (zeroSideRestriction && zeroSideRestriction.fromStopId && zeroSideRestriction.toStopId) {
    const fromStation = getStationById(zeroSideRestriction.fromStopId);
    const toStation = getStationById(zeroSideRestriction.toStopId);
    if (fromStation && toStation) {
      return {
        fromStationName: fromStation.stop_name,
        toStationName: toStation.stop_name,
      };
    }
  }
  if (oneSideRestriction && oneSideRestriction.fromStopId && oneSideRestriction.toStopId) {
    const fromStation = getStationById(oneSideRestriction.toStopId);
    const toStation = getStationById(oneSideRestriction.fromStopId);
    if (fromStation && toStation) {
      return {
        fromStationName: fromStation.stop_name,
        toStationName: toStation.stop_name,
      };
    }
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
    () => getOrderedStationNames(slowZones, speedRestrictions),
    [slowZones, speedRestrictions]
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

  const renderSlowZoneForDirection = (direction: SlowZoneDirection) => {
    const isToday = endDate === TODAY_STRING;

    const [slowZone] = slowZones[direction];
    const speedRestrictionsForDirection = speedRestrictions[direction];

    // Show nothing if there's neither a slow zone nor speed restrictions for this direction
    if (!slowZone && speedRestrictionsForDirection.length === 0) {
      return null;
    }

    if (slowZone) {
      // We have a detected slow zone - show full delay info
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

    // Speed restriction only (no detected slow zone)
    return (
      <div className={styles.direction}>
        <div className="flex flex-col items-start p-2">
          <div className={styles.directionTitle}>
            <DirectionIndicator
              color={color}
              size={10}
              isHorizontal={isHorizontal}
              direction={direction}
            />
            {direction === '0' ? 'Southbound' : 'Northbound'}
          </div>
          <div className={classNames('mb-1 max-w-[200px] text-xs italic text-stone-500')}>
            TransitMatters has not detected a slow zone for this segment despite the MBTA having an
            official speed restriction within it.
          </div>
        </div>
        {renderSpeedRestrictions(speedRestrictionsForDirection)}
      </div>
    );
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
