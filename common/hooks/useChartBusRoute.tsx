import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useDelimitatedRoute } from '../utils/router';

/**
 * Whether the charts inside show the bus route picked in the header. Most bus pages do, so it
 * defaults to true. A view across many routes (the speed leaderboard, Fleet's "All routes") sets
 * it to false so its charts aren't labelled with one route.
 */
const SelectedBusRouteContext = createContext(true);

export const SelectedBusRouteScope = ({
  shown,
  children,
}: {
  shown: boolean;
  children: ReactNode;
}) => <SelectedBusRouteContext value={shown}>{children}</SelectedBusRouteContext>;

/**
 * The bus route a chart's title and saved image should name, or undefined. Every bus route shares
 * one colour, so without it a screenshot of a bus chart can't say which route it shows (#114).
 */
export const useChartBusRoute = (): string | undefined => {
  const shown = useContext(SelectedBusRouteContext);
  const { query } = useDelimitatedRoute();
  return shown ? query.busRoute : undefined;
};
