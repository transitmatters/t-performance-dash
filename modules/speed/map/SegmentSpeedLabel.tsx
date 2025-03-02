import React, { useMemo } from 'react';

import type { LineMetadata } from '../../../common/types/lines';

import { getClockFormattedTimeString } from '../../../common/utils/time';
import type { ByDirection, SegmentDirection } from '../../../common/types/map';
import { DIRECTIONS } from '../../../common/utils/mapSegments';
import type { SpeedPairData, SpeedSegment } from './segment';

import styles from './SegmentSpeedLabel.module.css';

interface SpeedLabelProps {
  direction: SegmentDirection;
  speedPair: SpeedPairData;
  color: string;
  offset: number;
  isHorizontal: boolean;
  containingWidth: number;
}

const LABEL_INNER_PADDING = 2;
const LABEL_HEIGHT = 4;
const FONT_SIZE = 3;

const SpeedLabel: React.FC<SpeedLabelProps> = ({
  direction,
  color,
  containingWidth,
  offset,
  isHorizontal,
  speedPair: { travel_time, speed },
}) => {
  const delayString = useMemo(
    () =>
      speed
        ? `${Math.round(speed)} mph` //TODO
        : getClockFormattedTimeString(travel_time, {
            showHours: false,
            showSeconds: true,
            truncateLeadingZeros: true,
          }),
    [speed, travel_time]
  );
  const indicatorBeforeText = direction === '1';
  const indicatorSolidArrow = indicatorBeforeText
    ? isHorizontal
      ? '❮'
      : '▲'
    : isHorizontal
      ? '❯'
      : '▼';
  const isBold = false; //TODO

  const indicator = (
    <tspan fontSize={FONT_SIZE * 1.25} fill={color}>
      {indicatorSolidArrow}
    </tspan>
  );

  const delayText = (
    <tspan fontWeight={isBold ? 'bold' : undefined} fontSize={FONT_SIZE * 1.1}>
      {delayString}
    </tspan>
  );

  return (
    <text y={offset} x={containingWidth / 2} textAnchor="middle" fontSize={LABEL_HEIGHT}>
      {indicatorBeforeText ? <>{indicator} </> : null}
      {delayText}
      {!indicatorBeforeText ? <> {indicator}</> : null}
    </text>
  );
};

interface SpeedSegmentLabelProps {
  segment: SpeedSegment;
  line: LineMetadata;
  isHorizontal: boolean;
  width: number;
  height: number;
}

const getDirectionLabelOffsets = (slowZones: ByDirection<SpeedPairData[]>, height: number) => {
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

export const SpeedSegmentLabel: React.FC<SpeedSegmentLabelProps> = (props) => {
  const {
    isHorizontal,
    segment: { segments },
    line,
    width,
    height,
  } = props;

  const offsets = getDirectionLabelOffsets(segments, height);

  return (
    <g className={styles.slowSegmentLabel}>
      {DIRECTIONS.map((direction) => {
        const [zone] = segments[direction];
        if (!zone) {
          return null;
        }
        return (
          <SpeedLabel
            key={direction}
            direction={direction as SegmentDirection}
            speedPair={zone}
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
