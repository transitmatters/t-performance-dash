import { DashboardLayout } from '../layouts/DashboardLayout';
import { MetricsLayout } from '../layouts/MetricsLayout';
import { TripExplorerLayout } from '../layouts/TripExplorerLayout';
export const Layouts = {
  Dashboard: DashboardLayout,
  Metrics: MetricsLayout,
  Trips: TripExplorerLayout,
};
export type LayoutKeys = keyof typeof Layouts;
