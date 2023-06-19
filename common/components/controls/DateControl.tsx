import React from 'react';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../inputs/DateSelection/OverviewDateSelection';
import type { DateStoreSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';

interface DateControlProps {
  dateStoreSection: DateStoreSection;
  queryType: QueryTypeOptions;
}

export const DateControl: React.FC<DateControlProps> = ({ dateStoreSection, queryType }) => {
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
