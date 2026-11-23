import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import type { BusRoute, CommuterRailRoute, FerryRoute } from '../types/lines';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../types/lines';
import { usePageRoute } from '../utils/router';
import { useCrServiceScope } from './usePageFilters';

interface RouteNameInput {
  busRoute?: BusRoute;
  crRoute?: CommuterRailRoute;
  ferryRoute?: FerryRoute;
}

const getRouteName = ({ busRoute, crRoute, ferryRoute }: RouteNameInput) => {
  if (busRoute) return `Route ${busRoute}`;
  if (crRoute) return COMMUTER_RAIL_LINE_NAMES[crRoute];
  if (ferryRoute) return FERRY_LINE_NAMES[ferryRoute];
  return undefined;
};

/** The line (or route) and page names the header shows. */
export const usePageHeading = () => {
  const {
    line,
    page,
    tab,
    query: { busRoute, crRoute, ferryRoute },
  } = usePageRoute();
  const { value: crScope } = useCrServiceScope();
  const routeName = getRouteName({ busRoute, crRoute, ferryRoute });

  return {
    // A route is named before its line: "Route 1" rather than "Buses".
    lineName:
      routeName ?? (line ? LINE_OBJECTS[line]?.name : tab === 'System' ? 'System' : undefined),
    routeName,
    // Commuter Rail service can chart every line together, while the URL still names one.
    allCrLines: line === 'line-commuter-rail' && page === 'service' && crScope === 'all',
    pageTitle: ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name,
  };
};

/** The tab title, named like the header: "Red Line | Speed | Data Dashboard". */
export const usePageTitle = () => {
  const { lineName, pageTitle, allCrLines } = usePageHeading();
  return [allCrLines ? 'All Commuter Rail lines' : lineName, pageTitle, 'Data Dashboard']
    .filter(Boolean)
    .join(' | ');
};
