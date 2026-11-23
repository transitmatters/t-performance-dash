import { usePageDates } from '../../hooks/usePageParams';
import { asDateRange } from '../../utils/pageParams';
import { TODAY_STRING } from '../../constants/dates';
import { Notice } from './Notice';

export const SameDayNotice = () => {
  if (asDateRange(usePageDates()).endDate !== TODAY_STRING) {
    return null;
  }

  return (
    <Notice variant="warning">
      Data from today may be incomplete — it arrives with a delay of up to two hours.
    </Notice>
  );
};
