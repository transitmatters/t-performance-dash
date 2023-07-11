import React, { SetStateAction, useState } from 'react';
import { PastAlertModal } from './PastAlertModal';
import { AlertForModal, OldAlert } from '../../types/alerts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';

export const AlertNotice: React.FC = () => {
  const [alertsOpen, setAlertsOpen] = useState(false);
  return (
    <>
      <div
        className="pb-safe fixed bottom-24  right-2 z-10 cursor-pointer md:right-4 lg:bottom-4"
        onClick={() => setAlertsOpen(!alertsOpen)}
      >
        <p className="text-4xl md:text-5xl " style={{ fontFamily: 'Helvetica Neue' }}>
          ⚠️
        </p>
      </div>
      <PastAlertModal alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} />
    </>
  );
};
