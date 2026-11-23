import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { parseLinePage } from '../../common/utils/pageParams';
import { usePageRoute } from '../../common/utils/router';
import { stopNoun } from '../../common/utils/stations';

/** Shown in place of the charts when the route has no stations to pick between. */
export const TripSetupNotice = () => {
  const isMobile = !useBreakpoint('md');
  // Not useLinePage: while leaving for a page without a line, this renders once with the new URL.
  const noun = stopNoun(parseLinePage(usePageRoute())?.lineShort);
  // The controls live in the sticky header on desktop and in the docked panel on mobile.
  const where = isMobile ? 'in the panel at the bottom of the screen' : 'in the bar above';
  const title = `Choose a start and end ${noun}`;
  const body = `Pick the two ${noun}s you want to travel between ${where}, and this page will show travel times, headways and dwells for that trip.`;

  return (
    <WidgetDiv>
      <div className="flex h-60 flex-col items-center justify-center gap-2 px-6 text-center">
        <FontAwesomeIcon
          size="2x"
          icon={faLocationDot}
          className="mb-1 text-muted-foreground/50"
          aria-hidden
        />
        <p className="text-base font-medium text-card-foreground">{title}</p>
        <p className="max-w-prose text-sm text-muted-foreground">{body}</p>
      </div>
    </WidgetDiv>
  );
};
