import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import type { Line } from '../../types/lines';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useDelimitatedRoute, useGenerateHref, useHandleConfigStore } from '../../utils/router';
import { getSelectedDates } from '../../state/utils/dateStoreUtils';
import { LINE_COLORS } from '../../constants/colors';
import type { Page } from '../../constants/pages';
import { ALL_PAGES } from '../../constants/pages';
import { mbtaTextConfig } from '../../styles/general';
import { LocationTitle } from '../../../modules/dashboard/LocationTitle';

interface WidgetTitle {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  location?: Location;
  both?: boolean;
  line?: Line;
  /** A control that acts on this card's chart — a view switch or a filter. */
  action?: React.ReactNode;
  /** When set, the title becomes a chevron link to this page, colored by line — the homescreen card style. */
  tab?: Page;
  /** A pre-resolved chevron-link href, for targets `tab` can't express (e.g. a route/date-specific link). Takes precedence over `tab`. */
  titleHref?: null | LinkProps['href'];
}

const titleClassName = 'text-lg leading-tight font-semibold whitespace-nowrap md:text-xl';

export const WidgetTitle: React.FC<WidgetTitle> = ({
  title,
  subtitle,
  both = false,
  location,
  line,
  action,
  tab,
  titleHref,
}) => {
  const isMobile = !useBreakpoint('md');
  const { page, query, linePath } = useDelimitatedRoute();
  const handlePageConfig = useHandleConfigStore();
  const generateHref = useGenerateHref();
  const date = getSelectedDates({
    startDate: query.startDate ? query.startDate : query.date,
    endDate: query.endDate,
    view: query.view,
  });

  const linkHref =
    titleHref !== undefined
      ? titleHref
      : tab
        ? generateHref(ALL_PAGES[tab], page, query, linePath)
        : null;

  const titleElement = linkHref ? (
    <Link
      onClick={tab ? () => handlePageConfig(ALL_PAGES[tab]) : undefined}
      href={linkHref}
      className="flex items-center"
    >
      <h2 className={classNames(titleClassName, line ? mbtaTextConfig[line] : 'text-stone-800')}>
        {title}
      </h2>
      <FontAwesomeIcon
        icon={faChevronRight}
        style={line ? { color: LINE_COLORS[line] } : undefined}
        className={classNames('h-4 w-auto pl-2', !line && 'text-stone-800')}
      />
    </Link>
  ) : (
    <h2 className={classNames(titleClassName, 'text-stone-800')}>{title}</h2>
  );

  return (
    <div className="flex w-full flex-col items-baseline justify-between gap-x-4 gap-y-1 pb-2 md:flex-row">
      <div className="flex w-full flex-col md:w-auto">
        <div className="flex w-full flex-row items-baseline justify-between">
          {titleElement}
          {isMobile && <p className="text-xs text-stone-500 italic">{date}</p>}
        </div>
        {subtitle && (
          <h2
            className={classNames(
              'text-[13px] leading-tight whitespace-nowrap text-stone-500 italic'
            )}
          >
            {subtitle}
          </h2>
        )}
      </div>
      <div className="flex w-full shrink flex-col gap-y-1 overflow-hidden md:items-end">
        <div className="flex w-full flex-row items-center gap-x-3 md:justify-end">
          {!isMobile && <p className="shrink-0 text-xs text-stone-500 italic">{date}</p>}
          {action && <div className="min-w-0 shrink-0">{action}</div>}
        </div>
        {location && <LocationTitle location={location} both={both} />}
      </div>
    </div>
  );
};
