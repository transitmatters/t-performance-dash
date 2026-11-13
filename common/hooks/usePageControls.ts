import type { DateStoreSection } from '../constants/pages';
import { ALL_PAGES } from '../constants/pages';
import type { Line } from '../types/lines';
import { useDelimitatedRoute } from '../utils/router';

/** The modes whose pages are per route, so they get a route picker. */
const ROUTED_LINES: Line[] = ['line-bus', 'line-commuter-rail', 'line-ferry'];

const SECTIONS_WITH_CONTROLS: DateStoreSection[] = [
  'singleTrips',
  'multiTrips',
  'line',
  'overview',
  'system',
];

/** Which header controls the current page gets. The desktop header and mobile sheet share it. */
export const usePageControls = () => {
  const {
    line,
    page,
    tab,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const config = page ? ALL_PAGES[page] : undefined;
  const section = config?.dateStoreSection;
  const isTrips = section === 'singleTrips' || section === 'multiTrips';

  return {
    visible:
      section !== undefined &&
      SECTIONS_WITH_CONTROLS.includes(section) &&
      (line !== undefined || tab === 'System'),
    line,
    busRoute,
    crRoute,
    ferryRoute,
    queryType: section === 'singleTrips' ? ('single' as const) : ('range' as const),
    showRouteSelector:
      config?.hasRouteSelector !== false && line !== undefined && ROUTED_LINES.includes(line),
    // Pages that only borrow the singleTrips section for date storage (like the bus speed map)
    // aren't stop-to-stop pages, so they get neither stations nor the trip-view switch.
    showTripControls: isTrips && line !== undefined && Boolean(config?.hasStationStore),
    // The Overview is fixed to the last month, so it has no date control.
    showDateControl: section !== 'overview' && (line !== undefined || section === 'system'),
    // Events mark dates on a range; a single day has none to mark.
    showDisplayMenu: section !== 'singleTrips',
  };
};
