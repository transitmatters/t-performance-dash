import React from 'react';
import type { Location } from '../../common/types/charts';

interface LocationTitleProps {
  location: Location;
  both: boolean;
}

/**
 * Station names use the TransitMatters red rather than the line color: several line colors (bus
 * yellow especially) fall well short of readable contrast on a white card.
 */
export const LocationTitle: React.FC<LocationTitleProps> = ({ location, both }) => {
  if (both) {
    return (
      <p className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end">
        <b className="text-tm-red truncate">{location['from']}</b>
        <span className="font-normal text-stone-500">to</span>
        <b className="text-tm-red truncate">{location['to']}</b>
      </p>
    );
  }
  return (
    <p className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end">
      <b className="text-tm-red truncate">{location['from']}</b>
      <span className="font-normal text-stone-500">{location['direction']}</span>
    </p>
  );
};
