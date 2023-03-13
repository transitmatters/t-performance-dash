import classNames from 'classnames';
import React, { useState } from 'react';
import { lineColorBackground } from '../../../common/styles/general';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line } from '../../../common/types/lines';
import { lightLineBorder } from './styles/AlertStyles';
import { CurrentTime, UpcomingTime } from './Time';

interface AlertBoxInnerProps {
  header: string;
  Icon: React.ElementType;
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  children: React.ReactNode;
  line?: Line;
}

export const AlertBoxInner: React.FC<AlertBoxInnerProps> = ({
  header,
  Icon,
  alert,
  type,
  children,
  line,
}) => {
  const [expanded, setExpanded] = useState(false);
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
        <Icon className="ml-2 mr-4 h-10 w-10" />
        <div className="flex w-full flex-col items-center justify-center">
          {children}
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
          <p>{header}</p>
        </div>
      )}
    </div>
  );
};
