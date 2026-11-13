import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { ButtonGroup } from '../components/general/ButtonGroup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { lineColorVar } from '../styles/general';
import type { QueryParams } from '../types/router';
import { useDelimitatedRoute, useSetQueryParam } from '../utils/router';

type ToggleVariant = 'toggle' | 'select';

interface UseChartToggleOptions {
  /**
   * 'toggle' is a segmented control, 'select' is a dropdown. Left unset, a binary choice (a view
   * switch like Travel times/Speeds) renders as a toggle; three or more options render as a select
   * — several of these controls can share a card header, and pill buttons stop fitting well before
   * a dropdown does.
   */
  variant?: ToggleVariant;
  /**
   * Query-string key to keep this control's value in. Supply one and the control becomes part of
   * the shareable URL; leave it off and the value stays local component state. Only the non-default
   * value is written, so a link to an untouched chart carries no extra params.
   */
  paramKey?: keyof QueryParams;
}

interface ToggleControlProps<K extends string> {
  value: K;
  options: [K, string][];
  onChange: (value: K) => void;
  variant?: ToggleVariant;
}

/** A segmented control or dropdown over a fixed set of options. */
export const ToggleControl = <K extends string>({
  value,
  options,
  onChange,
  variant,
}: ToggleControlProps<K>) => {
  const { line } = useDelimitatedRoute();

  if ((variant ?? (options.length > 2 ? 'select' : 'toggle')) === 'select') {
    return (
      <Select value={value} onValueChange={(next) => onChange(next as K)}>
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
    );
  }

  return (
    <ButtonGroup
      line={line}
      pressFunction={onChange}
      selectedIndex={Math.max(
        options.findIndex(([key]) => key === value),
        0
      )}
      options={options}
      additionalDivClass="w-auto"
      additionalButtonClass="flex-none px-3"
    />
  );
};

/**
 * One of a fixed set of options. With a paramKey it lives in the URL, writing only a non-default
 * value; without one it is local state. An unrecognised param value (a hand-edited or stale link)
 * falls back to the default rather than putting the page into a state its control can't display.
 */
export const useOption = <K extends string, T extends string = string>(
  initial: K,
  options: [K, T][],
  paramKey?: keyof QueryParams
) => {
  const { query } = useDelimitatedRoute();
  const setQueryParam = useSetQueryParam();
  const [localValue, setLocalValue] = useState<K>(initial);

  const fromQuery = paramKey ? query[paramKey] : undefined;
  const value = paramKey
    ? ((options.some(([key]) => key === fromQuery) ? fromQuery : initial) as K)
    : localValue;

  const setValue = useCallback(
    (next: K) => {
      if (paramKey) setQueryParam(paramKey, next === initial ? undefined : next);
      else setLocalValue(next);
    },
    [paramKey, setQueryParam, initial]
  );

  return { value, setValue, options };
};

/**
 * Pairs a chart's view/filter state with the control that changes it, so a parent can render the
 * control in its card header while the chart itself stays a child.
 */
export const useChartToggle = <K extends string, T extends string>(
  initial: K,
  options: [K, T][],
  { variant, paramKey }: UseChartToggleOptions = {}
): { value: K; control: ReactNode } => {
  const { value, setValue } = useOption(initial, options, paramKey);
  return {
    value,
    control: (
      <ToggleControl value={value} options={options} onChange={setValue} variant={variant} />
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
