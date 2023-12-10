import type { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { LandingLayout } from './LandingLayout';
import type { LayoutNames } from './layoutTypes';

export const Layouts: { [key in LayoutNames]: ({ children }) => ReactNode } = {
  Landing: LandingLayout,
  Dashboard: DashboardLayout,
};
