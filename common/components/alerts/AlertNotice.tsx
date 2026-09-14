import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { PastAlertModal } from './PastAlertModal';

/**
 * Floating entry point to the service alerts that were in effect for the selected trip. This was a
 * `<div onClick>` holding a bare ⚠️ character: unreachable by keyboard, with no accessible name and
 * no role, and announced — if at all — as a stray "warning sign". It is a real button now, with a
 * drawn icon rather than an emoji standing in for one.
 */
export const AlertNotice: React.FC<{ count: number }> = ({ count }) => {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAlertsOpen(!alertsOpen)}
        aria-expanded={alertsOpen}
        aria-label={`Service alerts affecting this trip (${count})`}
        className="pb-safe bg-card text-card-foreground ring-foreground/10 hover:bg-muted focus-visible:ring-foreground fixed right-2 bottom-24 z-10 flex items-center gap-2 rounded-full py-2 pr-4 pl-3 shadow-lg ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-hidden md:right-4 lg:bottom-4"
      >
        <FontAwesomeIcon icon={faTriangleExclamation} className="text-destructive" aria-hidden />
        <span className="text-sm font-medium">
          {count} alert{count === 1 ? '' : 's'}
        </span>
      </button>
      <PastAlertModal alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} />
    </>
  );
};
