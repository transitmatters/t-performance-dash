import classNames from 'classnames';
import React, { useState } from 'react';
import { lineColorBackground } from '../../../common/styles/general';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line, LineShort } from '../../../common/types/lines';
import BetweenArrow from '../../../public/Icons/BetweenArrow.svg';
import ShuttleIcon from '../../../public/Icons/ShuttleIcon.svg';
import { getStop } from './AlertUtils';
import { lightLineBorder } from './styles/AlertStyles';
import { CurrentTime, UpcomingTime } from './Time';

interface ShuttleAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  line?: Line;
}
export const ShuttleAlert: React.FC<ShuttleAlertProps> = ({ alert, lineShort, type, line }) => {
  const [expanded, setExpanded] = useState(false);
  const min = Math.min(...alert.stops);
  const max = Math.max(...alert.stops);
  return (
    <div
      onClick={() => {
        setExpanded(!expanded);
      }}
      className={classNames(
        'flex w-full cursor-pointer flex-col gap-y-2 rounded-2xl border py-1 pl-1 pr-4 shadow-simple',
        lightLineBorder[line ?? 'DEFAULT'],
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className="flex w-full flex-row items-center">
        <ShuttleIcon className="ml-2 mr-4 h-10 w-10" />
        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex w-full flex-row items-center pr-2 text-center text-lg">
            <p className="mr-1 ">Shuttling</p>
            <p className="font-bold">{getStop(min, lineShort)}</p>
            <BetweenArrow className="mx-2 h-4 w-4" />
            <p className="font-bold">{getStop(max, lineShort)}</p>
          </div>
          <div className="flex w-full flex-row items-center gap-x-1 text-center ">
            {type === 'current' ? (
              <CurrentTime times={alert.relevantTimes} />
            ) : (
              <UpcomingTime times={alert.relevantTimes} />
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="p-4">
          <p>{alert.header}</p>
        </div>
      )}
    </div>
  );
};
