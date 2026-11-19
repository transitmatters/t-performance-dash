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
import { useDelimitatedRoute } from '../../common/utils/router';
import { NAV_LINES, hrefForLine, lineIcon } from './lineNav';

const RAPID_TRANSIT = new Set([
  'line-red',
  'line-orange',
  'line-blue',
  'line-green',
  'line-mattapan',
]);

/**
 * The line name in the page header, as a menu of every line. The sidebar lists lines too, but on a
 * short screen the open line's pages push the rest below the fold, and on phones it's behind the
 * menu button. `compact` drops the name for the icon alone, for a phone header that also has a route.
 */
export const LineSwitcher = ({ className, compact }: { className?: string; compact?: boolean }) => {
  const route = useDelimitatedRoute();
  const { line, colorKey } = route;
  if (!line) return null;

  return (
    <DropdownMenu>
      {/* No aria-label: it would replace the line's name in the page heading for screen readers. */}
      <DropdownMenuTrigger className={classNames(headingMenuTrigger(colorKey), className)}>
        <FontAwesomeIcon icon={lineIcon(line)} className="size-4" aria-hidden />
        <span className={classNames(compact && 'sr-only')}>{LINE_OBJECTS[line].name}</span>
        <FontAwesomeIcon icon={faChevronDown} className="size-3 opacity-70" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {NAV_LINES.map((navLine) => (
          <DropdownMenuItem
            key={navLine}
            asChild
            style={lineColorVar(navLine)}
            className="focus:bg-(--line-color)/10"
          >
            <Link
              href={hrefForLine(navLine, route)}
              aria-current={navLine === line ? true : undefined}
            >
              {/* Important: the item's focus style recolors every descendant, bullets included. */}
              <span className="flex size-4 items-center justify-center **:text-(--line-color)!">
                {RAPID_TRANSIT.has(navLine) ? (
                  <RouteBullet />
                ) : (
                  <FontAwesomeIcon icon={lineIcon(navLine)} className="size-3.5" aria-hidden />
                )}
              </span>
              <span className={classNames(navLine === line && 'font-semibold')}>
                {LINE_OBJECTS[navLine].name}
              </span>
              {navLine === line && (
                <FontAwesomeIcon icon={faCheck} className="ml-auto size-3" aria-hidden />
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
