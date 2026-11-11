import { LINE_OBJECTS } from '../constants/lines';
import { ALL_PAGES } from '../constants/pages';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../types/lines';
import { useDelimitatedRoute } from '../utils/router';

/** The line (or route) and page names the header shows. */
export const usePageHeading = () => {
  const {
    line,
    page,
    tab,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();

  const lineName = busRoute
    ? `Route ${busRoute}`
    : crRoute
      ? COMMUTER_RAIL_LINE_NAMES[crRoute]
      : ferryRoute
        ? FERRY_LINE_NAMES[ferryRoute]
        : line
          ? LINE_OBJECTS[line]?.name
          : tab === 'System'
            ? 'System'
            : undefined;
  const pageTitle = ALL_PAGES[page]?.title ?? ALL_PAGES[page]?.name;

  return { lineName, pageTitle };
};
