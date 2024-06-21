import React, { useState } from 'react';
import { PastAlertModal } from './PastAlertModal';

export const AlertNotice: React.FC = () => {
  const [alertsOpen, setAlertsOpen] = useState(false);
  return (
    <>
      <div
        className="pb-safe fixed bottom-24 right-2 z-10 cursor-pointer md:right-4 lg:bottom-4"
        onClick={() => setAlertsOpen(!alertsOpen)}
        title="Alerts"
      >
        <p className="text-4xl md:text-5xl" style={{ fontFamily: 'Helvetica Neue' }}>
          ⚠️
        </p>
      </div>
      <PastAlertModal alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} />
    </>
  );
};
