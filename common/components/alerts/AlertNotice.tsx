import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { PastAlertModal } from './PastAlertModal';

/**
 * Floating entry point to the service alerts that were in effect for the selected trip. This was a
 * `<div onClick>` holding a bare ⚠️ character: unreachable by keyboard, with no accessible name and
 * no role, and announced — if at all — as a stray "warning sign". It is a real button now, with a
 * drawn icon rather than an emoji standing in for one.
 */
export const AlertNotice = ({ count }: { count: number }) => {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAlertsOpen(!alertsOpen)}
        aria-expanded={alertsOpen}
        aria-label={`Service alerts affecting this trip (${count})`}
        className="pb-safe fixed right-2 bottom-24 z-10 flex items-center gap-2 rounded-full bg-card py-2 pr-4 pl-3 text-card-foreground shadow-lg ring-1 ring-foreground/10 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-hidden md:right-4 lg:bottom-4"
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
