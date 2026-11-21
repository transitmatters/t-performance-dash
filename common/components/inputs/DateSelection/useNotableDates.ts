import type { NotableDate } from '../../../constants/notableDates';
import type { QueryTypeOptions } from '../../../types/router';
import { findNotableDate, getNotableDateQuery, getNotableDates } from '../../../utils/notableDates';
import { useDelimitatedRoute } from '../../../utils/router';

/** The notable dates this page's date picker offers, and the one it's showing, if any. */
export const useNotableDates = (type: QueryTypeOptions) => {
  const { tab, page, line, query } = useDelimitatedRoute();
  const options = getNotableDates({ type, tab, page, line, query });
  return {
    options,
    selected: findNotableDate(options, query),
    queryFor: (entry: NotableDate) => getNotableDateQuery(entry, { page, line, query }),
  };
};
