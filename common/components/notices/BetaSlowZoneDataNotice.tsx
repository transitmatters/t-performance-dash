import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';

export const BetaSlowZoneDataNotice: React.FC = () => {
  const { line } = useDelimitatedRoute();

  if (line !== 'line-green') {
    return null;
  }

  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Green Line Slow Zones are in Beta</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Due to the variable nature of service on the Green Line, we aren't able to detect slow
              zones as easily as on the heavy rail lines. Additionaly, we are only monitoring slow
              zones for stops serviced by the D line since that is the only line which is entirely
              grade-separated.
            </p>
            <p>
              We're working on improving the data and we plan to add slow-zone tracking for other
              branches, but that will require additional information on traffic patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
