import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { lineColorVar } from '../../../styles/general';
import { LINE_COLORS } from '../../../constants/colors';
import type { Line } from '../../../types/lines';
import { readableOn } from '../../../utils/general';

interface DateFieldProps {
  /** YYYY-MM-DD, matching the query-string format everywhere else in the date state. */
  value: string | undefined;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  line?: Line;
  placeholder?: string;
  className?: string;
}

/** A single date field: a button showing the current date, opening a calendar to change it. */
export const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  line,
  placeholder = 'mm/dd/yyyy',
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const selected = value ? dayjs(value).toDate() : undefined;
  const min = minDate ? dayjs(minDate).toDate() : undefined;
  const max = maxDate ? dayjs(maxDate).toDate() : undefined;
  // { before, after } together is DateInterval (disables the days *between* them), not what we
  // want here — an array ORs the two matchers, disabling before min or after max independently.
  const disabledMatchers = [...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])];
  // Bus yellow and the other light line colors can't carry white selected-day text.
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={classNames('cursor-pointer text-center', className)}>
          {selected ? dayjs(selected).format('MMM D, YYYY') : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-auto p-0"
        style={
          {
            ...lineColorVar(line),
            // The calendar's selected-day styling is themed via --primary; point it at the line
            // color rather than adding a separate override for every possible line.
            '--primary': 'var(--line-color)',
            '--primary-foreground': needsDarkText ? 'var(--color-stone-900)' : '#fff',
          } as React.CSSProperties
        }
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? max ?? min}
          startMonth={min}
          endMonth={max}
          disabled={disabledMatchers}
          onSelect={(date) => {
            if (!date) return;
            onChange(dayjs(date).format('YYYY-MM-DD'));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
