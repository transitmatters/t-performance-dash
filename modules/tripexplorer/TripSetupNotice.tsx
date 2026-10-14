import { faCalendarDay, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';

interface TripSetupNoticeProps {
  /** What the page is still waiting on before it can run a query. */
  missing: 'stations' | 'date' | 'dateRange';
}

/**
 * Shown where the charts would be when the trip is not yet fully specified. This used to be a bare
 * `return null`, which left the content well blank and read as a broken page — the one state a
 * first-time visitor is most likely to land in from a partial link.
 */
export const TripSetupNotice: React.FC<TripSetupNoticeProps> = ({ missing }) => {
  const { t } = useTranslation('tripexplorer');
  const isMobile = !useBreakpoint('md');
  // The controls live in the sticky header on desktop and in the docked panel on mobile, so point
  // at whichever one the reader is actually looking at.
  const where = isMobile ? 'mobile' : 'desktop';

  const { icon, title, body } =
    missing === 'stations'
      ? {
          icon: faLocationDot,
          title: t('setup.stations.title'),
          body: t(`setup.stations.body.${where}`),
        }
      : missing === 'dateRange'
        ? {
            icon: faCalendarDay,
            title: t('setup.dateRange.title'),
            body: t(`setup.dateRange.body.${where}`),
          }
        : {
            icon: faCalendarDay,
            title: t('setup.date.title'),
            body: t(`setup.date.body.${where}`),
          };

  return (
    <WidgetDiv>
      <div className="flex h-60 flex-col items-center justify-center gap-2 px-6 text-center">
        <FontAwesomeIcon
          size="2x"
          icon={icon}
          className="mb-1 text-muted-foreground/50"
          aria-hidden
        />
        <p className="text-base font-medium text-card-foreground">{title}</p>
        <p className="max-w-prose text-sm text-muted-foreground">{body}</p>
      </div>
    </WidgetDiv>
  );
};
