import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import ClosureIcon from '../../../public/Icons/ClosureIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';

interface StopClosureProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
}

export const StopClosure: React.FC<StopClosureProps> = ({ alert, type }) => {
  return (
    <AlertBoxInner header={alert.header} Icon={ClosureIcon} alert={alert} type={type}>
      <p className="mr-1 ">Stop Closures</p>
    </AlertBoxInner>
  );
};
