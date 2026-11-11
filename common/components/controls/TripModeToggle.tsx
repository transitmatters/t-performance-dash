import classNames from 'classnames';
import { Link } from '../general/Link';
import { TRIP_PAGES } from '../../constants/pages';
import { LINE_COLORS } from '../../constants/colors';
import { FOCUS_RING_ON_SURFACE, lineColorVar } from '../../styles/general';
import { readableOn } from '../../utils/general';
import { useDelimitatedRoute, useGenerateHref, useHandleConfigStore } from '../../utils/router';

/** Labelled for where they sit — beside the date control, which is what they change. */
const MODE_LABELS: Record<string, string> = {
  singleTrips: 'Single day',
  multiTrips: 'Date range',
};

/**
 * Switches between the two trip views. They are separate routes rendering the same component, told
 * apart only by which date params happen to be set; `getTripHopDates` keeps the selected day or
 * range across the hop.
 */
export const TripModeToggle = () => {
  const { line, page, query, linePath } = useDelimitatedRoute();
  const generateHref = useGenerateHref();
  const handlePageConfig = useHandleConfigStore();

  if (!line) return null;

  const selectedText = readableOn(LINE_COLORS[line]) === 'dark' ? 'text-stone-900' : 'text-white';

  return (
    <div
      role="group"
      aria-label="Trip view"
      style={lineColorVar(line)}
      className="flex h-10 w-full shrink-0 flex-row gap-0.5 rounded-md border border-stone-200 bg-white p-0.5 md:h-8 md:w-auto dark:border-stone-700 dark:bg-stone-900"
    >
      {TRIP_PAGES.map((tripPage) => {
        const selected = page === tripPage.key;
        return (
          <Link
            key={tripPage.key}
            href={generateHref(tripPage, page, query, linePath)}
            aria-current={selected ? 'page' : undefined}
            onClick={() => handlePageConfig(tripPage)}
            className={classNames(
              'flex flex-1 items-center justify-center rounded-[5px] px-3 text-sm whitespace-nowrap transition-colors focus-visible:ring-offset-1',
              FOCUS_RING_ON_SURFACE,
              selected
                ? 'bg-(--line-color) font-semibold'
                : 'hover:bg-stone-100 dark:hover:bg-stone-800'
            )}
          >
            {/* The global `a { color: inherit }` outranks text utilities on the link itself. */}
            <span className={selected ? selectedText : 'text-stone-700 dark:text-stone-300'}>
              {MODE_LABELS[tripPage.key] ?? tripPage.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
