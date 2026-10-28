import { faCalendarDay, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { useDelimitatedRoute } from '../../common/utils/router';
import { stopNoun } from '../../common/utils/stations';

interface TripSetupNoticeProps {
  /** What the page is still waiting on before it can run a query. */
  missing: 'stations' | 'date' | 'dateRange';
}

/**
 * Shown where the charts would be when the trip is not yet fully specified. This used to be a bare
 * `return null`, which left the content well blank and read as a broken page — the one state a
 * first-time visitor is most likely to land in from a partial link.
 */
export const TripSetupNotice = ({ missing }: TripSetupNoticeProps) => {
  const isMobile = !useBreakpoint('md');
  const noun = stopNoun(useDelimitatedRoute().lineShort);
  // The controls live in the sticky header on desktop and in the docked panel on mobile, so point
  // at whichever one the reader is actually looking at.
  const where = isMobile ? 'in the panel at the bottom of the screen' : 'in the bar above';

  const { icon, title, body } =
    missing === 'stations'
      ? {
          icon: faLocationDot,
          title: `Choose a start and end ${noun}`,
          body: `Pick the two ${noun}s you want to travel between ${where}, and this page will show travel times, headways and dwells for that trip.`,
        }
      : {
          icon: faCalendarDay,
          title: missing === 'dateRange' ? 'Choose a date range' : 'Choose a date',
          body:
            missing === 'dateRange'
              ? `Pick a start and end date ${where} to see how this trip performed over time.`
              : `Pick a date ${where} to see every trip that ran between these two ${noun}s.`,
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
