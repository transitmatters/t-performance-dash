import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { Line } from '../../common/types/lines';
import { lineColorBackground, lineColorBorder } from '../../common/styles/general';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { BUS_DEFAULTS, COMMUTER_RAIL_DEFAULTS } from '../../common/state/defaults/dateDefaults';

interface LineButtonProps {
  children: React.ReactNode;
  line: Line;
}

export const LineButton: React.FC<LineButtonProps> = ({ children, line }) => {
  const lineObject = LINE_OBJECTS[line];

  return (
    <Link
      href={
        line === 'line-commuter-rail'
          ? `/${lineObject.path}/trips/single?crRoute=CR-Fairmount&date=${COMMUTER_RAIL_DEFAULTS.singleTripConfig.date}`
          : line === 'line-bus'
            ? `/${lineObject.path}?busRoute=1&date=${BUS_DEFAULTS.singleTripConfig.date}`
            : `/${lineObject.path}`
      }
      className="group flex cursor-pointer flex-row items-center gap-x-8 gap-y-4 md:flex-col"
    >
      <div
        className={classNames(
          lineColorBorder[line],
          lineColorBackground[line],
          'flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 bg-opacity-80 group-hover:bg-opacity-100 lg:h-32 lg:w-32'
        )}
      >
        {children}
      </div>
      <div className="flex flex-row items-baseline gap-2 md:flex-col md:items-center">
        <h3 className="text-center text-3xl md:text-xl">{LINE_OBJECTS[line].name}</h3>
        {line === 'line-commuter-rail' && <p className="text-center font-bold">(Beta)</p>}
      </div>
    </Link>
  );
};
