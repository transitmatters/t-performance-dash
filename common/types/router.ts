import type { DataPage } from './dataPages';
import type { Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  datapage: DataPage;
  query: QueryParams;
}

export interface QueryParams {
  startDate?: string;
  endDate?: string;
  busLine?: string;
}
