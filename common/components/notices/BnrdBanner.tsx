import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BNRD, isBNRDRoute } from '../../constants/bnrd';
import type { BusRoute } from '../../types/lines';

interface BnrdBannerProps {
  busRoute: BusRoute | undefined;
}

export const BnrdBanner: React.FunctionComponent<BnrdBannerProps> = ({ busRoute }) => {
  const { t } = useTranslation();
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
      case '65':
      case '60/65-legacy':
      case '220/221/222':
      case '434/435/436':
      case '465':
        return BNRD[3].url;
      default:
        return BNRD[1].url;
    }
  };

  const getText = (): string => {
    switch (busRoute) {
      case '40/50':
        return t('notices.bnrd.route40_50');
      case '85':
      case 'CT2':
        return t('notices.bnrd.route85');
      case '86':
        return t('notices.bnrd.route86');
      case '87':
        return t('notices.bnrd.route87');
      case '104':
        return t('notices.bnrd.route104');
      case '109':
        return t('notices.bnrd.route109');
      case '110':
        return t('notices.bnrd.route110');
      case '116':
        return t('notices.bnrd.route116');
      case '350/351':
        return t('notices.bnrd.route350');
      case '65':
        return t('notices.bnrd.route65');
      case '60/65-legacy':
        return t('notices.bnrd.route60_65Legacy');
      case '220/221/222':
        return t('notices.bnrd.route220');
      case '220/221/222-legacy':
        return t('notices.bnrd.route220Legacy');
      case '434/435/436':
        return t('notices.bnrd.route434');
      case '434/435/436-legacy':
        return t('notices.bnrd.route434Legacy');
      case '465':
        return t('notices.bnrd.route465');
      default:
        return t('notices.bnrd.default');
    }
  };

  if (isBNRDRoute(busRoute)) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-card px-4 py-3 text-card-foreground ring-1 ring-foreground/10">
        <FontAwesomeIcon
          icon={faCircleExclamation}
          className="mt-0.5 h-4 w-4 shrink-0 self-start text-muted-foreground"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-sm">{getText()}</p>
        <a
          href={getUrl()}
          target="_blank"
          rel="noreferrer"
          className="flex-none rounded-full px-3 py-1 text-sm font-medium ring-1 ring-foreground/15 transition-colors hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {t('notices.readMore')} <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  }

  return null;
};
