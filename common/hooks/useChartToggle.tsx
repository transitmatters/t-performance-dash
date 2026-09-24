import React from 'react';
import { ButtonGroup } from '../components/general/ButtonGroup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { lineColorVar } from '../styles/general';
import { useDelimitatedRoute, useSetQueryParam } from '../utils/router';

interface UseChartToggleOptions {
  /**
   * 'toggle' is a segmented control, 'select' is a dropdown. Left unset, a binary choice (a view
   * switch like Travel times/Speeds) renders as a toggle; three or more options render as a select
   * — several of these controls can share a card header, and pill buttons stop fitting well before
   * a dropdown does.
   */
  variant?: 'toggle' | 'select';
  /**
   * Query-string key to keep this control's value in. Supply one and the control becomes part of
   * the shareable URL; leave it off and the value stays local component state. Only the non-default
   * value is written, so a link to an untouched chart carries no extra params.
   */
  paramKey?: string;
}

/**
 * Pairs a chart's view/filter state with the control that changes it, so a parent can render the
 * control in its card header while the chart itself stays a child. Without this, every parent would
 * repeat the same useState and control wiring.
 */
export const useChartToggle = <K extends string, T extends string>(
  initial: K,
  options: [K, T][],
  { variant, paramKey }: UseChartToggleOptions = {}
): { value: K; control: React.ReactNode } => {
  const { line, query } = useDelimitatedRoute();
  const setQueryParam = useSetQueryParam();
  const [localValue, setLocalValue] = React.useState<K>(initial);

  // An unrecognised param value (a hand-edited or stale link) falls back to the default rather
  // than putting the chart into a state its control cannot display.
  const fromQuery = paramKey ? query[paramKey] : undefined;
  const value = paramKey
    ? ((options.some(([key]) => key === fromQuery) ? fromQuery : initial) as K)
    : localValue;

  const setValue = React.useCallback(
    (next: K) => {
      if (paramKey) {
        setQueryParam(paramKey, next === initial ? undefined : next);
      } else {
        setLocalValue(next);
      }
    },
    [paramKey, setQueryParam, initial]
  );

  const resolvedVariant = variant ?? (options.length > 2 ? 'select' : 'toggle');

  if (resolvedVariant === 'select') {
    return {
      value,
      control: (
        <Select value={value} onValueChange={(next) => setValue(next as K)}>
          <SelectTrigger
            size="sm"
            style={lineColorVar(line)}
            className="border-(--line-color)/40 data-[state=open]:border-(--line-color)"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {options.map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    };
  }

  const selectedIndex = Math.max(
    options.findIndex(([key]) => key === value),
    0
  );

  return {
    value,
    control: (
      <ButtonGroup
        line={line}
        pressFunction={setValue}
        selectedIndex={selectedIndex}
        options={options}
        additionalDivClass="w-auto"
        additionalButtonClass="px-3"
      />
    ),
  };
};

export const DAY_FILTER_OPTIONS: ['all' | 'weekday' | 'weekend', string][] = [
  ['all', 'All days'],
  ['weekday', 'Weekdays'],
  ['weekend', 'Weekends & holidays'],
];

export const PEAK_TIME_OPTIONS: ['weekday' | 'weekend', string][] = [
  ['weekday', 'Weekday'],
  ['weekend', 'Weekend/holiday'],
];
