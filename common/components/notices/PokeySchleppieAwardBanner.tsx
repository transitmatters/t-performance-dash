import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import type { BusRoute } from '../../types/lines';

const WINNERS: { [key in number]: { pokey: BusRoute; schleppie: BusRoute } } = {
  2023: {
    pokey: '85',
    schleppie: '1',
  },
};

export const PokeySchleppieAwardBanner = ({ busRoute }) => {
  const years = Object.keys(WINNERS);

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
          <FontAwesomeIcon icon={faTrophy} size={'2x'} />
          <div className="flex w-full items-center justify-between">
            <p className="w-full text-sm leading-6 text-gray-900">
              "Winner" of the {year} {pokey ? 'Pokey' : schleppie ? 'Schleppie' : null} Award!
            </p>
            <a
              href="#"
              className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Read more <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    );
  });
};
