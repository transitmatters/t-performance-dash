import { Card } from '../../common/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../common/components/ui/select';
import { DateField } from '../../common/components/inputs/DateSelection/DateField';
import { getDatePickerBounds } from '../../common/constants/dates';
import { FOCUS_RING_ON_SURFACE, lineColorVar } from '../../common/styles/general';
import type { CompareOption } from '../../common/types/comparison';
import { getDefaultCustomCompareDate, useComparisonPeriod } from '../../common/utils/comparison';
import { useDelimitatedRoute, useSetQueryParam } from '../../common/utils/router';

const OPTIONS: [CompareOption, string][] = [
  ['off', 'Nothing'],
  ['previous', 'Previous period'],
  ['year', 'Last year'],
  ['custom', 'Custom dates'],
];

const LABEL_ID = 'trip-comparison-label';

/**
 * Picks a second period to draw over every multi-day trip chart, kept in the `vs` param so a copied
 * link shows the same comparison. The period is always as long as the selected range; that is what
 * lets the two share an x axis.
 */
export const ComparisonSelector = () => {
  const { line, tab, page, query } = useDelimitatedRoute();
  const period = useComparisonPeriod();
  const setQueryParam = useSetQueryParam();
  const { startDate, endDate } = query;
  if (!startDate || !endDate) return null;

  const selected: CompareOption = period?.option ?? 'off';
  const { minDate, maxDate } = getDatePickerBounds(
    tab,
    page,
    query.busRoute ?? query.crRoute ?? query.ferryRoute
  );

  const handleChange = (option: CompareOption) => {
    if (option === 'off') setQueryParam('vs', undefined);
    // Custom starts from whatever was being compared, or a calendar year back.
    else if (option === 'custom')
      setQueryParam('vs', period?.startDate ?? getDefaultCustomCompareDate(startDate));
    else setQueryParam('vs', option);
  };

  return (
    <Card
      size="sm"
      className="flex-row flex-wrap items-center gap-x-3 gap-y-2 px-(--card-spacing)"
      style={lineColorVar(line)}
    >
      <span id={LABEL_ID} className="text-sm font-medium">
        Compare with
      </span>
      <Select value={selected} onValueChange={(next) => handleChange(next as CompareOption)}>
        <SelectTrigger
          size="sm"
          aria-labelledby={LABEL_ID}
          className="border-(--line-color)/40 data-[state=open]:border-(--line-color)"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {OPTIONS.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {period?.option === 'custom' && (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          starting
          <DateField
            value={period.startDate}
            minDate={minDate}
            maxDate={maxDate}
            line={line}
            className={`h-8 rounded-md border border-(--line-color)/40 px-2 text-sm text-foreground ${FOCUS_RING_ON_SURFACE}`}
            onChange={(date) => {
              if (date !== startDate) setQueryParam('vs', date);
            }}
          />
        </span>
      )}
      {period && (
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground">{period.rangeLabel}</span>
          {period.option === 'previous' && ` · the ${period.offsetDays} days before`}
          {period.option === 'year' && ' · 52 weeks back, so weekdays line up'}
        </span>
      )}
    </Card>
  );
};
