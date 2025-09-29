import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { isBNRDRoute } from '../../constants/bnrd';
import type { BusRoute } from '../../types/lines';

interface BnrdBannerProps {
  busRoute: BusRoute | undefined;
}

const BNRD_TEXT =
  'This route was upgraded as part of Bus Network Redesign (BNRD) Phase 1, with service every 15 minutes or better during service hours.';

export const BnrdBanner: React.FunctionComponent<BnrdBannerProps> = ({ busRoute }) => {
  if (!busRoute) {
    return null;
  }

  const getText = () => {
    switch (busRoute) {
      case '86':
        return 'This route was shortened to run between Reservoir and Harvard Square, with improved midday, evening, and weekend service.';
      case '104':
        return 'This route now offers new crosstown service between Malden Center and Logan Airport, with buses every 15 minutes or better.';
      case '109':
        return 'This route now extends to Harvard Square and runs more frequently, with service every 15 minutes or better.';
      case '110':
        return 'This route now offers improved frequency between Wellington and Wonderland, with service every 15 minutes.';
      case '116':
        return 'This route now combines former Routes 116/117 with improved frequency, running every 15 minutes or better.';
      default:
        return BNRD_TEXT;
    }
  };

  if (isBNRDRoute(busRoute)) {
    return (
      <div className="flex items-center overflow-hidden rounded bg-gradient-to-r from-gray-600 to-gray-500 px-6 py-2.5">
        <div className="flex w-full gap-x-4 gap-y-2">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            size={'2x'}
            className="text-shadow text-white shadow-gray-500"
          />
          <div className="flex w-full items-center justify-between">
            <p className="text-md text-shadow w-full leading-6 text-white shadow-gray-500">
              {getText()}
            </p>
            <a
              href="https://www.mbta.com/projects/bus-network-redesign/phase-1-service-changes"
              target="_blank"
              className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              rel="noreferrer"
            >
              Read more <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
