import React from 'react';
import { AlertForModal } from '../../types/alerts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import { getDateString } from '../../../modules/commute/alerts/AlertUtils';

interface AlertsDisclaimerProps {
  alerts: AlertForModal[];
}

export const AlertsDisclaimer: React.FC<AlertsDisclaimerProps> = ({ alerts }) => {
  return (
    <div>
      {alerts?.map((alert) => (
        <div className="flex flex-row items-baseline gap-1 p-1">
          <p className="text-sm  text-stone-800">
            <span style={{ fontFamily: 'Helvetica Neue' }}>⚠️ </span>
            <span className="font-bold italic">
              {getDateString(alert.valid_from, alert.valid_to)}
            </span>
            <span className="text-xs italic">{alert.text}</span>
          </p>
        </div>
      ))}
    </div>
  );
};
