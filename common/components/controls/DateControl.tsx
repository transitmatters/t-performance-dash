import { DateSelection } from '../inputs/DateSelection/DateSelection';
import type { DateStoreSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';

interface DateControlProps {
  dateStoreSection: DateStoreSection;
  queryType: QueryTypeOptions;
}

// The Overview (see modules/dashboard/redesign/) is fixed to the last month and charts one metric
// at a time, so it has no date control.
export const DateControl = ({ dateStoreSection, queryType }: DateControlProps) => {
  if (
    dateStoreSection === 'singleTrips' ||
    dateStoreSection === 'line' ||
    dateStoreSection === 'system' ||
    dateStoreSection === 'multiTrips'
  )
    return <DateSelection type={queryType ?? 'range'} />;
  return null;
};
