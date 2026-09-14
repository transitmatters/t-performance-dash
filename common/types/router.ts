import type { OverviewDatePresetKey } from '../constants/dates';
import type { Page } from '../constants/pages';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  page: Page;
  query: QueryParams;
  tab: Tab;
  color: string;
}

export const DATE_PARAMS = ['startDate', 'endDate', 'date'];
export const STATION_PARAMS = ['from', 'to'];

export type QueryParams = {
  startDate?: string;
  endDate?: string;
  date?: string;
  busRoute?: BusRoute;
  crRoute?: CommuterRailRoute;
  ferryRoute?: FerryRoute;
  view?: OverviewDatePresetKey;
  to?: string;
  from?: string;
  /**
   * Per-chart view and filter state. These ride in the URL so a copied link reproduces what the
   * sender was actually looking at — a "weekdays only" chart shared as "all days" is a different
   * claim. Each is omitted while it sits at its default, so ordinary links stay short.
   */
  ttView?: string;
  ttDays?: string;
  hwDays?: string;
  dwDays?: string;
  peak?: string;
};

/** Query keys that carry chart view state rather than identifying the trip itself. */
export const CHART_PARAMS = ['ttView', 'ttDays', 'hwDays', 'dwDays', 'peak'];

export type QueryTypeOptions = 'single' | 'range';

export type Tab = 'Bus' | 'Subway' | 'Commuter Rail' | 'System' | 'Ferry' | 'The RIDE';
