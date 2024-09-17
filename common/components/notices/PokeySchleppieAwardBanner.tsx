import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import type { BusRoute } from '../../types/lines';

const WINNERS: { [key in number]: { pokey: BusRoute; schleppie: BusRoute } } = {
  2024: {
    pokey: '1',
    schleppie: '1',
  },
};

interface PokeySchleppieAwardBannerProps {
  busRoute: BusRoute | undefined;
}

export const PokeySchleppieAwardBanner: React.FunctionComponent<PokeySchleppieAwardBannerProps> = ({
  busRoute,
}) => {
  const years = Object.keys(WINNERS);

  if (!busRoute) {
    return null;
  }

  return years.map((year) => {
    const pokey = WINNERS[year].pokey === busRoute;
    const schleppie = WINNERS[year].schleppie === busRoute;

    if (!pokey && !schleppie) {
      return null;
    }

    return (
      <div
        key={year}
        className="flex items-center overflow-hidden rounded bg-gradient-to-r from-[#f5B400] to-[#fcefcb] px-6 py-2.5"
      >
        <div className="flex w-full gap-x-4 gap-y-2">
          <FontAwesomeIcon
            icon={faTrophy}
            size={'2x'}
            className="text-shadow text-white shadow-gray-500"
          />
          <div className="flex w-full items-center justify-between">
            <p className="text-shadow text-md w-full leading-6 text-white shadow-gray-500">
              "Winner" of the {year}{' '}
              {pokey && schleppie
                ? 'Pokey and Schleppie'
                : pokey
                  ? 'Pokey'
                  : schleppie
                    ? 'Schleppie'
                    : null}{' '}
              Award{pokey && schleppie ? 's' : ''}!
            </p>
            <a
              href="https://drive.google.com/file/d/1QFTVg0N3-uQeVoMqlOE6QLPqcoCtifzp/view"
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
  });
};
