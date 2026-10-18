import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';

export const GreenLineSlowZoneNotice: React.FC = () => {
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
          <h3 className="text-sm font-medium text-yellow-800">
            Green Line slow zones are less precise
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Green Line service is more variable than on the heavy rail lines, and much of it runs
              on the street rather than on a{' '}
              <a className="underline" href="https://en.wikipedia.org/wiki/Grade_separation">
                grade-separated
              </a>{' '}
              right-of-way. Slow zone detection here is more prone to error than on other lines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
