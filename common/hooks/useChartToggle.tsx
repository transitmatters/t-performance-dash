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
import { useDelimitatedRoute } from '../utils/router';

interface UseChartToggleOptions {
  /**
   * 'toggle' is a segmented control, 'select' is a dropdown. Left unset, a binary choice (a view
   * switch like Travel times/Speeds) renders as a toggle; three or more options render as a select
   * — several of these controls can share a card header, and pill buttons stop fitting well before
   * a dropdown does.
   */
  variant?: 'toggle' | 'select';
}

/**
 * Pairs a chart's view/filter state with the control that changes it, so a parent can render the
 * control in its card header while the chart itself stays a child. Without this, every parent would
 * repeat the same useState and control wiring.
 */
export const useChartToggle = <K extends string, T extends string>(
  initial: K,
  options: [K, T][],
  { variant }: UseChartToggleOptions = {}
): { value: K; control: React.ReactNode } => {
  const { line } = useDelimitatedRoute();
  const [value, setValue] = React.useState<K>(initial);
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
