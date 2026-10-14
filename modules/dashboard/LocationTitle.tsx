import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { Location } from '../../common/types/charts';

interface LocationTitleProps {
  location: Location;
  both: boolean;
}

/**
 * Station names use the TransitMatters red rather than the line color: several line colors (bus
 * yellow especially) fall well short of readable contrast on a white card. The TM red is itself
 * darkened for a light card, so it needs a lighter counterpart once the card goes dark.
 */
export const LocationTitle: React.FC<LocationTitleProps> = ({ location, both }) => {
  const { t } = useTranslation();
  const station = <b className="truncate text-tm-red dark:text-red-400" />;
  const connector = <span className="font-normal text-stone-500 dark:text-stone-400" />;
  return (
    <p className="flex w-full gap-1 overflow-hidden text-[13px] font-semibold md:justify-end">
      <Trans
        t={t}
        i18nKey={both ? 'location.fromTo' : 'location.fromDirection'}
        values={{
          from: location.from,
          to: location.to,
          direction: t(`directions.${location.direction}`),
        }}
        components={{ from: station, to: station, connector }}
      />
    </p>
  );
};
