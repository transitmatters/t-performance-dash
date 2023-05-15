import React from 'react';
import classNames from 'classnames';
import type { Location } from '../../common/types/charts';
import type { Line } from '../../common/types/lines';
import { lineColorText } from '../../common/styles/general';

interface LocationTitleProps {
  location: Location;
  both: boolean;
  line?: Line;
}

export const LocationTitle: React.FC<LocationTitleProps> = ({ location, both, line }) => {
  if (both) {
    return (
      <p className="flex w-full gap-1 overflow-hidden text-sm md:justify-end">
        <b className={classNames('truncate', lineColorText[line ?? 'DEFAULT'])}>
          {location['from']}
        </b>
        <span className="text-stone-800">to</span>
        <b className={classNames('truncate', lineColorText[line ?? 'DEFAULT'])}>{location['to']}</b>
      </p>
    );
  }
  return (
    <p className="flex w-full gap-1 overflow-hidden text-sm md:justify-end">
      <b className={classNames('truncate', lineColorText[line ?? 'DEFAULT'])}>{location['from']}</b>
      <span className="text-stone-800">{location['direction']}</span>
    </p>
  );
};
