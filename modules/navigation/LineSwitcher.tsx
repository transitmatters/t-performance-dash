import { useId } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from '../../common/components/general/Link';
import { RouteBullet } from '../../common/components/transit/RouteBullet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../common/components/ui/dropdown-menu';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { headingMenuTrigger, lineColorVar } from '../../common/styles/general';
import type { Line } from '../../common/types/lines';
import { SUBWAY_LINES } from '../../common/types/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { NAV_LINES, hrefForLine, lineIcon } from './lineNav';

const LineLabel = ({ line, current }: { line: Line; current: boolean }) => (
  <>
    {/* Important: the item's focus style recolors every descendant, bullets included. */}
    <span className="flex size-4 items-center justify-center **:text-(--line-color)!">
      {SUBWAY_LINES.includes(line) ? (
        <RouteBullet />
      ) : (
        <FontAwesomeIcon icon={lineIcon(line)} className="size-3.5" aria-hidden />
      )}
    </span>
    <span className={classNames(current && 'font-semibold')}>{LINE_OBJECTS[line].name}</span>
    {current && <FontAwesomeIcon icon={faCheck} className="ml-auto size-3" aria-hidden />}
  </>
);

/**
 * The line name in the page header, as a menu of every line. The sidebar lists lines too, but on a
 * short screen the open line's pages push the rest below the fold, and on phones it's behind the
 * menu button. `compact` drops the name for the icon alone, for a header that also has a route:
 * always, or (`'belowLg'`) only on narrower screens.
 */
export const LineSwitcher = ({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean | 'belowLg';
}) => {
  const route = useDelimitatedRoute();
  const descriptionId = useId();
  const { line, colorKey } = route;
  if (!line) return null;

  return (
    <DropdownMenu>
      {/* Described rather than labelled: a label would replace the line's name in the heading. */}
      <DropdownMenuTrigger
        aria-describedby={descriptionId}
        className={classNames(headingMenuTrigger(colorKey), className)}
      >
        <FontAwesomeIcon icon={lineIcon(line)} className="size-4" aria-hidden />
        <span
          className={classNames(
            compact === true && 'sr-only',
            compact === 'belowLg' && 'sr-only lg:not-sr-only'
          )}
        >
          {LINE_OBJECTS[line].name}
        </span>
        <FontAwesomeIcon icon={faChevronDown} className="size-3 opacity-70" aria-hidden />
        <span id={descriptionId} hidden>
          Change line
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {NAV_LINES.map((navLine) =>
          // The current line only closes the menu; linking it would drop the page and dates.
          navLine === line ? (
            <DropdownMenuItem
              key={navLine}
              aria-current
              style={lineColorVar(navLine)}
              className="focus:bg-(--line-color)/10"
            >
              <LineLabel line={navLine} current />
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              key={navLine}
              asChild
              style={lineColorVar(navLine)}
              className="focus:bg-(--line-color)/10"
            >
              <Link href={hrefForLine(navLine, route)}>
                <LineLabel line={navLine} current={false} />
              </Link>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
