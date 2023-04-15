import React from 'react';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../inputs/DateSelection/OverviewDateSelection';
import type { Section } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';

interface DateControlProps {
  section: Section;
  queryType: QueryTypeOptions;
}

export const DateControl: React.FC<DateControlProps> = ({ section, queryType }) => {
  if (section === 'trips' || section === 'line')
    return <DateSelection type={queryType ?? 'range'} />;
  if (section === 'overview') return <OverviewDateSelection />;
  return null;
};
