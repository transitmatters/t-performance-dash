import type { Page } from '../constants/pages';
import type { BusRoute, Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  page: Page;
  query: QueryParams;
  tab: Tab;
}

export type QueryParams = {
  startDate?: string;
  endDate?: string;
  busRoute?: BusRoute;
  view?: View;
};

export type View = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

export type Tab = 'Bus' | 'Subway' | 'System';
