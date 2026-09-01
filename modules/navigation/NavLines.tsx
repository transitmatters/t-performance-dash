import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBus,
  faChevronRight,
  faShip,
  faTrain,
  faTrainSubway,
  faTrainTram,
} from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../common/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '../../common/components/ui/sidebar';
import { LINE_OBJECTS } from '../../common/constants/lines';
import type { PageMetadata } from '../../common/constants/pages';
import {
  BUS_OVERVIEW,
  COMMUTER_RAIL_OVERVIEW,
  FERRY_OVERVIEW,
  LINE_PAGES,
  OVERVIEW_PAGE,
  TRIP_PAGES,
} from '../../common/constants/pages';
import {
  BUS_DEFAULTS,
  COMMUTER_RAIL_DEFAULTS,
  FERRY_DEFAULTS,
} from '../../common/state/defaults/dateDefaults';
import { lineColorVar } from '../../common/styles/general';
import type { Line } from '../../common/types/lines';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../common/utils/router';
import { NavPageItems } from './NavPageItems';

const NAV_LINES: Line[] = [
  'line-red',
  'line-orange',
  'line-blue',
  'line-green',
  'line-mattapan',
  'line-bus',
  'line-commuter-rail',
  'line-RIDE',
  'line-ferry',
];

const lineIcon = (line: Line) => {
  switch (line) {
    case 'line-bus':
    case 'line-RIDE':
      return faBus;
    case 'line-green':
    case 'line-mattapan':
      return faTrainTram;
    case 'line-commuter-rail':
      return faTrain;
    case 'line-ferry':
      return faShip;
    default:
      return faTrainSubway;
  }
};

/** The pages each mode actually supports. Modes differ, so this is per-line rather than shared. */
const pagesForLine = (line: Line): PageMetadata[] => {
  const forThisLine = LINE_PAGES.filter((page) => page.lines.includes(line));
  switch (line) {
    case 'line-bus':
      return [...BUS_OVERVIEW, ...TRIP_PAGES];
    case 'line-commuter-rail':
      return [...COMMUTER_RAIL_OVERVIEW, ...forThisLine, ...TRIP_PAGES];
    case 'line-ferry':
      return [...FERRY_OVERVIEW, ...TRIP_PAGES];
    case 'line-RIDE':
      return forThisLine;
    default:
      return [...OVERVIEW_PAGE, ...forThisLine, ...TRIP_PAGES];
  }
};

const hrefForLine = (line: Line, route: ReturnType<typeof useDelimitatedRoute>) => {
  switch (line) {
    case 'line-bus':
      return `/bus/trips/single?busRoute=1&date=${BUS_DEFAULTS.singleTripConfig.date}`;
    case 'line-commuter-rail':
      return `/commuter-rail/trips/single?crRoute=CR-Fairmount&date=${COMMUTER_RAIL_DEFAULTS.singleTripConfig.date}`;
    case 'line-ferry':
      return `/ferry/trips/single?ferryRoute=Boat-F6&date=${FERRY_DEFAULTS.singleTripConfig.date}`;
    case 'line-RIDE':
      return '/the-ride/ridership';
    default:
      return getLineSelectionItemHref(line, route);
  }
};

interface NavLinesProps {
  close?: () => void;
}

export const NavLines: React.FC<NavLinesProps> = ({ close }) => {
  const route = useDelimitatedRoute();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Lines</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_LINES.map((line) => {
          const lineObject = LINE_OBJECTS[line];
          const isActive = route.line === line;
          return (
            <Collapsible key={line} asChild open={isActive} className="group/line">
              <SidebarMenuItem
                style={lineColorVar(line)}
                className={classNames('rounded-md', isActive && 'bg-(--line-color)/10')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    tooltip={lineObject.name}
                    style={lineColorVar(line)}
                    className={classNames(
                      'hover:bg-transparent',
                      isActive && 'font-semibold text-stone-900'
                    )}
                  >
                    <Link href={hrefForLine(line, route)} onClick={() => close?.()}>
                      <span className="size-2.5 shrink-0 rounded-full bg-(--line-color)" />
                      <span className="truncate">{lineObject.name}</span>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="ml-auto size-3 opacity-50 transition-transform duration-200 group-data-[state=open]/line:rotate-90"
                      />
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mx-0 border-0 pr-1 pl-6">
                    <NavPageItems pages={pagesForLine(line)} close={close} />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
