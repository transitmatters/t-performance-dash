import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useDelimitatedRoute } from '../../common/utils/router';
import { mbtaTextConfig } from '../../common/styles/general';

// Where a trip starts, its recorded "arrival" is when the train was put on the trip, so arrival to
// departure measures layover, often for hours. The MBTA's LAMP data leaves these dwells blank too.
export const DwellsTerminusNotice: React.FC = () => {
  const { line } = useDelimitatedRoute();

  return (
    <div className="flex h-60 w-full flex-col items-center justify-center text-center">
      <FontAwesomeIcon
        size={'3x'}
        icon={faCircleInfo}
        className={line ? mbtaTextConfig[line] : undefined}
      />
      <p className="text-stone-900">Dwells aren't shown at terminus stations.</p>
      <p className="text-stone-600">
        Trains wait here between trips, so time at the platform is layover, not dwell.
      </p>
    </div>
  );
};
