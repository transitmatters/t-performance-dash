import React from 'react';
import { useRouter } from 'next/router';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../inputs/DateSelection/OverviewDateSelection';
import { useDelimitatedRoute } from '../../utils/router';
import type { DateStoreSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';

interface DateControlProps {
  dateStoreSection: DateStoreSection;
  queryType: QueryTypeOptions;
}

export const DateControl: React.FC<DateControlProps> = ({ dateStoreSection, queryType }) => {
  const router = useRouter();
  const { tab } = useDelimitatedRoute();
  // The redesigned Overview (see modules/dashboard/redesign/) is fixed to the last month and
  // has its own metric-driven chart — the Week/Month/Year/All-time toggle wouldn't do anything.
  // It's now the default for the Subway Overview tab; `?redesign=0` opts back into the classic page.
  const showingRedesign =
    dateStoreSection === 'overview' && tab === 'Subway' && router.query.redesign !== '0';
  if (showingRedesign) return null;
  if (
    dateStoreSection === 'singleTrips' ||
    dateStoreSection === 'line' ||
    dateStoreSection === 'system' ||
    dateStoreSection === 'multiTrips'
  )
    return <DateSelection type={queryType ?? 'range'} />;
  if (dateStoreSection === 'overview') return <OverviewDateSelection />;
  return null;
};
