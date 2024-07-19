import React from 'react';
import { getDateString } from '../../../modules/commute/alerts/AlertUtils';
import type { AlertForModal } from '../../types/alerts';

interface AlertsDisclaimerProps {
  alerts: AlertForModal[];
}

export const AlertsDisclaimer: React.FC<AlertsDisclaimerProps> = ({ alerts }) => {
  return (
    <div>
      {alerts?.map((alert, index) => (
        <div key={index} className="flex flex-row items-baseline gap-1 p-1">
          <p className="text-sm text-stone-800">
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
