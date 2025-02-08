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
              Due to the variable nature of service on the Green Line, we can't detect slow zones as
              easily as with heavy rail lines. Additionally, we only monitor the D branch as it is
              the only{' '}
              <a className="underline" href="https://en.wikipedia.org/wiki/Grade_separation">
                grade-separated
              </a>{' '}
              branch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
