import React from 'react';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../inputs/DateSelection/OverviewDateSelection';
import type { DateConfigSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';

interface DateControlProps {
  dateConfigSection: DateConfigSection;
  queryType: QueryTypeOptions;
}

export const DateControl: React.FC<DateControlProps> = ({ dateConfigSection, queryType }) => {
  if (
    dateConfigSection === 'trips' ||
    dateConfigSection === 'line' ||
    dateConfigSection === 'system'
  )
    return <DateSelection type={queryType ?? 'range'} />;
  if (dateConfigSection === 'overview') return <OverviewDateSelection />;
  return null;
};
