import { useMemo } from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineMetadata } from '../../../common/types/lines';

import { getClockFormattedTimeString } from '../../../common/utils/time';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { TODAY_STRING } from '../../../common/constants/dates';
import type { SlowZoneMapLabel } from '../constants/constants';
import type { ByDirection, SlowZoneDirection, SlowZonesSegment } from './segment';
import { DIRECTIONS } from './segment';
import { getSlowZoneLabelSeconds } from './labels';

import styles from './SlowSegmentLabel.module.css';

interface SlowZoneLabelProps {
  direction: SlowZoneDirection;
  slowZone: SlowZoneResponse;
  label: SlowZoneMapLabel;
  color: string;
  offset: number;
  isHorizontal: boolean;
  containingWidth: number;
}

const LABEL_INNER_PADDING = 2;
const LABEL_HEIGHT = 4;
const FONT_SIZE = 3;

const SlowZoneLabel = ({
  direction,
  color,
  containingWidth,
  offset,
  isHorizontal,
  slowZone,
  label,
}: SlowZoneLabelProps) => {
  const {
    query: { endDate },
  } = useDelimitatedRoute();
  const isToday = endDate === TODAY_STRING;
  const seconds = getSlowZoneLabelSeconds(slowZone, label, isToday);
  const { delay, baseline } = slowZone;

  const timeString = useMemo(
    () =>
      getClockFormattedTimeString(seconds, {
        showHours: false,
        showSeconds: true,
        truncateLeadingZeros: true,
      }),
    [seconds]
  );
  const indicatorBeforeText = direction === '1';
  const indicatorSolidArrow = indicatorBeforeText
    ? isHorizontal
      ? '❮'
      : '▲'
    : isHorizontal
      ? '❯'
      : '▼';
  // Bold marks a severe zone in either view, so it follows the delay, not the number shown.
  const fractionOverBaseline = -1 + (delay + baseline) / baseline;
  const isBold = fractionOverBaseline >= 0.5;

  const indicator = (
    <tspan fontSize={FONT_SIZE * 1.25} fill={color}>
      {indicatorSolidArrow}
    </tspan>
  );

  const timeText = <tspan fontWeight={isBold ? 'bold' : undefined}>{timeString}</tspan>;

  return (
    // currentColor is the card's text color, like the map's station names; SVG text with no fill
    // is black whatever the theme
    <text
      y={offset}
      x={containingWidth / 2}
      textAnchor="middle"
      fontSize={LABEL_HEIGHT}
      fill="currentColor"
    >
      {indicatorBeforeText ? <>{indicator} </> : null}
      {timeText}
      {!indicatorBeforeText ? <> {indicator}</> : null}
    </text>
  );
};

interface SlowSegmentLabelProps {
  segment: SlowZonesSegment;
  line: LineMetadata;
  label: SlowZoneMapLabel;
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

export const SlowSegmentLabel = (props: SlowSegmentLabelProps) => {
  const {
    isHorizontal,
    segment: { slowZones },
    line,
    label,
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
            direction={direction}
            slowZone={zone}
            label={label}
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
