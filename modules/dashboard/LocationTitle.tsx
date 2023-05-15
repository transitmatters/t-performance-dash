import React from 'react';
import type { Location } from '../../common/types/charts';
import type { Line } from '../../common/types/lines';
import { lineColorText } from '../../common/styles/general';

interface LocationTitleProps {
  location: Location; //TODO
  both: boolean;
  line?: Line;
}

export const LocationTitle: React.FC<LocationTitleProps> = ({ location, both, line }) => {
  if (both) {
    return (
      <p className="flex gap-1 text-base">
        <b className={lineColorText[line ?? 'DEFAULT']}>{location['from']}</b>
        <span className="text-stone-800"> to </span>
        <b className={lineColorText[line ?? 'DEFAULT']}>{location['to']}</b>
      </p>
    );
  }
  return (
    <p className="flex gap-2 text-base">
      <b className={lineColorText[line ?? 'DEFAULT']}>{location['from']}</b>
      <span className="text-stone-800">{location['direction']}</span>
    </p>
  );
};
