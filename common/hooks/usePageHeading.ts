import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import type { Tab } from '../types/router';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../types/lines';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../types/lines';
import { useDelimitatedRoute } from '../utils/router';

interface LineNameInput {
  line: Line | undefined;
  tab: Tab;
  busRoute?: BusRoute;
  crRoute?: CommuterRailRoute;
  ferryRoute?: FerryRoute;
}

/** A route is named before its line: "Route 1" rather than "Buses". */
const getLineName = ({ line, tab, busRoute, crRoute, ferryRoute }: LineNameInput) => {
  if (busRoute) return `Route ${busRoute}`;
  if (crRoute) return COMMUTER_RAIL_LINE_NAMES[crRoute];
  if (ferryRoute) return FERRY_LINE_NAMES[ferryRoute];
  if (line) return LINE_OBJECTS[line]?.name;
  if (tab === 'System') return 'System';
  return undefined;
};

/** The line (or route) and page names the header shows. */
export const usePageHeading = () => {
  const {
    line,
    page,
    tab,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();

  return {
    lineName: getLineName({ line, tab, busRoute, crRoute, ferryRoute }),
    pageTitle: ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name,
  };
};
