import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { BNRD, isBNRDRoute } from '../../constants/bnrd';
import type { BusRoute } from '../../types/lines';

interface BnrdBannerProps {
  busRoute: BusRoute | undefined;
}

const BNRD_TEXT = 'This route was upgraded as part of Better Bus Network (Bus Network Redesign).';

export const BnrdBanner: React.FunctionComponent<BnrdBannerProps> = ({ busRoute }) => {
  if (!busRoute) {
    return null;
  }

  const getUrl = (): string => {
    switch (busRoute) {
      case '40/50':
      case '85':
      case 'CT2':
      case '87':
      case '350/351':
        return BNRD[2].url;
      default:
        return BNRD[1].url;
    }
  };

  const getText = (): string => {
    switch (busRoute) {
      case '40/50':
        return 'The combined Route 40/50 that runs on weekday evenings, Saturday evenings, and Sunday will be discontinued.';
      case '85':
      case 'CT2':
        return 'The CT2 and 85 will combine to be the new Route 85, with new service extending to Assembly.';
      case '86':
        return 'This route was shortened to run between Reservoir and Harvard Square, with improved midday, evening, and weekend service.';
      case '87':
        return 'All Route 87 trips will travel between Lechmere and Arlington Center. The route pattern that ends at Clarendon Hill will be discontinued.';
      case '104':
        return 'This route now offers new crosstown service between Malden Center and Logan Airport, with buses every 15 minutes or better.';
      case '109':
        return 'This route now extends to Harvard Square and runs more frequently, with service every 15 minutes or better.';
      case '110':
        return 'This route now offers improved frequency between Wellington and Wonderland, with service every 15 minutes.';
      case '116':
        return 'This route now combines former Routes 116/117 with improved frequency, running every 15 minutes or better.';
      case '350/351':
        return 'All Route 350 trips will now serve Burlington Mall Rd.';
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
            className="text-white shadow-gray-500 text-shadow"
          />
          <div className="flex w-full items-center justify-between">
            <p className="text-md w-full leading-6 text-white shadow-gray-500 text-shadow">
              {getText()}
            </p>
            <a
              href={getUrl()}
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
