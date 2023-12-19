import React, { useMemo } from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineMetadata } from '../../../common/types/lines';

import { getClockFormattedTimeString } from '../../../common/utils/time';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { TODAY_STRING } from '../../../common/constants/dates';
import type { ByDirection, SlowZoneDirection, SlowZonesSegment } from './segment';
import { DIRECTIONS } from './segment';

import styles from './SlowSegmentLabel.module.css';

interface SlowZoneLabelProps {
  direction: SlowZoneDirection;
  slowZone: SlowZoneResponse;
  color: string;
  offset: number;
  isHorizontal: boolean;
  containingWidth: number;
}

const LABEL_INNER_PADDING = 2;
const LABEL_HEIGHT = 4;
const FONT_SIZE = 3;

const SlowZoneLabel: React.FC<SlowZoneLabelProps> = ({
  direction,
  color,
  containingWidth,
  offset,
  isHorizontal,
  slowZone: { delay, latest_delay, baseline },
}) => {
  const {
    query: { endDate },
  } = useDelimitatedRoute();
  const isToday = endDate === TODAY_STRING;
  const delayVal = isToday && latest_delay ? latest_delay : delay;

  const delayString = useMemo(
    () =>
      getClockFormattedTimeString(delayVal, {
        showHours: false,
        showSeconds: true,
        truncateLeadingZeros: true,
      }),
    [delayVal]
  );
  const indicatorBeforeText = direction === '1';
  const indicatorSolidArrow = indicatorBeforeText
    ? isHorizontal
      ? '❮'
      : '▲'
    : isHorizontal
      ? '❯'
      : '▼';
  const fractionOverBaseline = -1 + (delay + baseline) / baseline;
  const isBold = fractionOverBaseline >= 0.5;

  const indicator = (
    <tspan fontSize={FONT_SIZE * 1.25} fill={color}>
      {indicatorSolidArrow}
    </tspan>
  );

  const delayText = <tspan fontWeight={isBold ? 'bold' : undefined}>{delayString}</tspan>;

  return (
    <text y={offset} x={containingWidth / 2} textAnchor="middle" fontSize={LABEL_HEIGHT}>
      {indicatorBeforeText ? <>{indicator} </> : null}
      {delayText}
      {!indicatorBeforeText ? <> {indicator}</> : null}
    </text>
  );
};

interface SlowSegmentLabelProps {
  segment: SlowZonesSegment;
  line: LineMetadata;
  isHorizontal: boolean;
  width: number;
  height: number;
}

const getDirectionLabelOffsets = (slowZones: ByDirection<SlowZoneResponse[]>, height: number) => {
  const hasZero = slowZones['0'].length > 0;
  const hasOne = slowZones['1'].length > 0;
  const isBidi = hasZero && hasOne;
  const midline = height / 2;
  if (isBidi) {
    const bidiOffset = LABEL_INNER_PADDING + LABEL_HEIGHT;
    return {
      '0': midline + bidiOffset / 2,
      '1': midline - bidiOffset / 2,
    };
  }
  if (hasZero) {
    return {
      '0': midline,
    };
  }
  if (hasOne) {
    return {
      '1': midline,
    };
  }
  return {};
};

export const SlowSegmentLabel: React.FC<SlowSegmentLabelProps> = (props) => {
  const {
    isHorizontal,
    segment: { slowZones },
    line,
    width,
    height,
  } = props;

  const offsets = getDirectionLabelOffsets(slowZones, height);

  return (
    <g className={styles.slowSegmentLabel}>
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
            offset={offsets[direction]!}
            containingWidth={width}
          />
        );
      })}
    </g>
  );
};
