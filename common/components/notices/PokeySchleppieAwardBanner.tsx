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
        className="bg-card text-card-foreground ring-foreground/10 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-4 py-3 ring-1"
      >
        <FontAwesomeIcon
          icon={faTrophy}
          className="mt-0.5 h-4 w-4 shrink-0 self-start text-amber-500"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-sm">
          &ldquo;Winner&rdquo; of the {year}{' '}
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
          rel="noreferrer"
          className="ring-foreground/15 hover:bg-foreground/5 focus-visible:ring-ring flex-none rounded-full px-3 py-1 text-sm font-medium ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Read more <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  });
};
