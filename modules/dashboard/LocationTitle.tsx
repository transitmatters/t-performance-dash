import type { CSSProperties } from 'react';
import type { Location } from '../../common/types/charts';
import type { LineColorKey } from '../../common/types/lines';
import { LINE_TEXT_COLORS } from '../../common/constants/colors';

interface LocationTitleProps {
  location: Location;
  both: boolean;
  line?: LineColorKey;
}

/**
 * Station names take the line's colour, toned for contrast against the card, or the TransitMatters
 * red when there's no line.
 */
export const LocationTitle = ({ location, both, line }: LocationTitleProps) => {
  const textColor = line ? LINE_TEXT_COLORS[line] : undefined;
  const style = textColor
    ? ({ '--station-light': textColor.light, '--station-dark': textColor.dark } as CSSProperties)
    : undefined;
  const stationClass = textColor
    ? 'truncate text-(--station-light) dark:text-(--station-dark)'
    : 'truncate text-tm-red dark:text-red-400';

  return (
    <p
      className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end"
      style={style}
    >
      <b className={stationClass}>{location['from']}</b>
      <span className="font-normal text-stone-500 dark:text-stone-400">
        {both ? 'to' : location['direction']}
      </span>
      {both && <b className={stationClass}>{location['to']}</b>}
    </p>
  );
};
