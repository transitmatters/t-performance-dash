import React from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import type { LinkProps } from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import type { Line } from '../../types/lines';
import { useDelimitatedRoute, useGenerateHref, useHandleConfigStore } from '../../utils/router';
import { LINE_COLORS } from '../../constants/colors';
import type { Page } from '../../constants/pages';
import { ALL_PAGES } from '../../constants/pages';
import { mbtaTextConfig } from '../../styles/general';
import { LocationTitle } from '../../../modules/dashboard/LocationTitle';
import { CardDescription, CardHeader, CardTitle } from '../ui/card';

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

/** Type comes from CardTitle; only the wrapping behaviour is ours. */
const titleClassName = 'text-balance md:whitespace-nowrap';

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
  const { page, query, linePath } = useDelimitatedRoute();
  const handlePageConfig = useHandleConfigStore();
  const generateHref = useGenerateHref();

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
      <CardTitle
        as="h2"
        className={classNames(titleClassName, line ? mbtaTextConfig[line] : 'text-card-foreground')}
      >
        {title}
      </CardTitle>
      <FontAwesomeIcon
        icon={faChevronRight}
        style={line ? { color: LINE_COLORS[line] } : undefined}
        className={classNames('h-4 w-auto pl-2', !line && 'text-card-foreground')}
      />
    </Link>
  ) : (
    <CardTitle as="h2" className={classNames(titleClassName, 'text-card-foreground')}>
      {title}
    </CardTitle>
  );

  return (
    // CardHeader supplies the slot and the horizontal padding token; the grid it ships with places
    // an action in a fixed second column, which cannot wrap, so the layout stays flex here.
    <CardHeader className="flex w-full flex-col items-baseline justify-between gap-x-4 gap-y-1 px-0 md:flex-row">
      <div className="flex w-full flex-col gap-0.5 md:w-auto">
        {titleElement}
        {subtitle && (
          <CardDescription className="text-[13px] leading-tight md:whitespace-nowrap">
            {subtitle}
          </CardDescription>
        )}
      </div>
      <div className="flex w-full min-w-0 shrink flex-col gap-y-1 md:items-end">
        {action && (
          <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-x-2 gap-y-1 md:justify-end">
            {action}
          </div>
        )}
        {location && <LocationTitle location={location} both={both} />}
      </div>
    </CardHeader>
  );
};
