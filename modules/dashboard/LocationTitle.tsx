import React from 'react';
import type { Location } from '../../common/types/charts';

interface LocationTitleProps {
  location: Location;
  both: boolean;
}

/**
 * Station names use the TransitMatters red rather than the line color: several line colors (bus
 * yellow especially) fall well short of readable contrast on a white card. The TM red is itself
 * darkened for a light card, so it needs a lighter counterpart once the card goes dark.
 */
export const LocationTitle: React.FC<LocationTitleProps> = ({ location, both }) => {
  if (both) {
    return (
      <p className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end">
        <b className="text-tm-red truncate dark:text-red-400">{location['from']}</b>
        <span className="font-normal text-stone-500 dark:text-stone-400">to</span>
        <b className="text-tm-red truncate dark:text-red-400">{location['to']}</b>
      </p>
    );
  }
  return (
    <p className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end">
      <b className="text-tm-red truncate dark:text-red-400">{location['from']}</b>
      <span className="font-normal text-stone-500 dark:text-stone-400">
        {location['direction']}
      </span>
    </p>
  );
};
