import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line, LineShort } from '../../../common/types/lines';
import BetweenArrow from '../../../public/Icons/BetweenArrow.svg';
import DetourIcon from '../../../public/Icons/DetourIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';
import { getStop } from './AlertUtils';
import { CurrentTime, UpcomingTime } from './Time';

interface SuspensionAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  line?: Line;
}

const getDescription = (alert: FormattedAlert, lineShort: LineShort) => {
  if (alert.stops.length) {
    const min = Math.min(...alert.stops);
    const max = Math.max(...alert.stops);
    return (
      <>
        <p className="mr-1 ">No service</p>
        <p className="font-bold">{getStop(min, lineShort)}</p>
        <BetweenArrow className="mx-2 h-4 w-4" />
        <p className="font-bold">{getStop(max, lineShort)}</p>
      </>
    );
  }
  return <p className="mr-1 ">Detours on {lineShort} Line</p>;
};

export const SuspensionAlert: React.FC<SuspensionAlertProps> = ({
  alert,
  lineShort,
  type,
  line,
}) => {
  return (
    <AlertBoxInner
      header={alert.header}
      line={line}
      Icon={<DetourIcon className="ml-2 mr-4 h-10 w-10" />}
    >
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex w-full flex-row items-center pr-2 text-center text-lg">
          {getDescription(alert, lineShort)}
        </div>
        <div className="flex w-full flex-row items-center gap-x-1 text-center ">
          {type === 'current' ? (
            <CurrentTime times={alert.relevantTimes} />
          ) : (
            <UpcomingTime times={alert.relevantTimes} />
          )}
        </div>
      </div>
    </AlertBoxInner>
  );
};
