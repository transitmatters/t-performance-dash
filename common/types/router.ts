import type { Page } from '../constants/pages';
import type { QueryParams } from '../utils/searchSchemas';
import type { Line, LineColorKey, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  page: Page;
  query: QueryParams;
  tab: Tab;
  /** The color the page is drawn in: its line's, or `line-silver` on a Silver Line route. */
  colorKey: LineColorKey | undefined;
  color: string;
}

export const DATE_PARAMS = ['startDate', 'endDate', 'date'];
export const STATION_PARAMS = ['from', 'to'];

export type { QueryParams } from '../utils/searchSchemas';

/** Query keys that carry chart view state rather than identifying the trip itself. */
export const CHART_PARAMS = ['ttView', 'ttDays', 'hwDays', 'dwDays', 'peak'];

export type QueryTypeOptions = 'single' | 'range';

export type Tab = 'Bus' | 'Subway' | 'Commuter Rail' | 'System' | 'Ferry' | 'The RIDE';
