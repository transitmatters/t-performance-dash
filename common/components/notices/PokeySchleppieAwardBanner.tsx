import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import type { BusRoute } from '../../types/lines';
import type { PokeySchleppieAward, PokeySchleppiePlacement } from '../../constants/pokeySchleppie';
import {
  getPokeySchleppiePlacements,
  POKEY_SCHLEPPIE_AWARDS,
} from '../../constants/pokeySchleppie';

const AWARDS: Record<PokeySchleppieAward, { name: string; description: string }> = {
  pokey: { name: 'Pokey', description: 'slowest' },
  schleppie: { name: 'Schleppie', description: 'most bunched' },
};

const describePlacement = (
  { year, award, route, rank }: PokeySchleppiePlacement,
  busRoute: BusRoute
) => {
  const { name, description } = AWARDS[award];
  const routeName = route === busRoute ? '' : `${route} · `;
  const result = rank === 1 ? `${name} "winner"` : `#${rank} ${description}`;
  return `${year} · ${routeName}${result}`;
};

interface PokeySchleppieAwardBannerProps {
  busRoute: BusRoute;
}

export const PokeySchleppieAwardBanner: React.FunctionComponent<PokeySchleppieAwardBannerProps> = ({
  busRoute,
}) => {
  const placements = getPokeySchleppiePlacements(busRoute);
  if (!placements.length) {
    return null;
  }

  return (
    <div className="flex items-start gap-x-3 rounded-xl bg-card px-4 py-3 text-card-foreground ring-1 ring-foreground/10">
      <FontAwesomeIcon
        icon={faTrophy}
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm">
          <span className="font-semibold">Pokey/Schleppie Awards</span>{' '}
          <span className="text-muted-foreground">
            for the MBTA&apos;s slowest and most bunched bus routes
          </span>
        </p>
        <ul className="flex flex-wrap gap-2">
          {placements.map((placement) => (
            <li key={`${placement.year}-${placement.award}-${placement.route}`}>
              <a
                href={POKEY_SCHLEPPIE_AWARDS[placement.year].url}
                target="_blank"
                rel="noreferrer"
                title={`Read the ${placement.year} Pokey/Schleppie Awards`}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-foreground/15 transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {placement.rank === 1 && (
                  <FontAwesomeIcon icon={faTrophy} className="h-3 w-3 text-amber-500" aria-hidden />
                )}
                {describePlacement(placement, busRoute)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
