import type { ReactNode } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingLayout } from '../layouts/LandingLayout';
import type { LayoutNames } from './layoutTypes';

export const Layouts: { [key in LayoutNames]: ({ children }) => ReactNode } = {
  Landing: LandingLayout,
  Dashboard: DashboardLayout,
};
