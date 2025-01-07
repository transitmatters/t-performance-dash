import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';

export const BetaSlowZoneDataNotice: React.FC = () => {
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
              zones as easily as on the heavy rail lines
            </p>
            <p>
              The slow zone data here is a work in progress, and we will likely make iterative
              improvements upon it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
