import React from 'react';
import classNames from 'classnames';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { AlertBoxInner } from './AlertBoxInner';

interface StopClosureProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
}

export const StopClosure: React.FC<StopClosureProps> = ({ alert, type }) => {
  return (
    <AlertBoxInner
      header={alert.header}
      Icon={() => <p className={classNames('m-0.5 pl-2 pr-2 text-4xl')}>🚧</p>}
      alert={alert}
      type={type}
    >
      <p className="mr-1">Stop Closures</p>
    </AlertBoxInner>
  );
};
