import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

// Where a trip starts, its recorded "arrival" is when the train was put on the trip, so arrival to
// departure measures layover, often for hours. The MBTA's LAMP data leaves these dwells blank too.
export const DwellsTerminusNotice = () => (
  <div className="flex h-60 w-full flex-col items-center justify-center gap-1 px-4 text-center">
    <FontAwesomeIcon
      size="2x"
      icon={faCircleInfo}
      className="mb-1 text-muted-foreground/50"
      aria-hidden
    />
    <p className="font-medium text-card-foreground">Dwells aren't shown at terminus stations.</p>
    <p className="text-sm text-muted-foreground">
      Trains wait here between trips, so time at the platform is layover, not dwell.
    </p>
  </div>
);
