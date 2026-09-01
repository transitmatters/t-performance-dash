import classNames from 'classnames';
import type { SetStateAction } from 'react';
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { lineColorVar } from '../../styles/general';
import type { Line } from '../../types/lines';
import { LINE_COLORS } from '../../constants/colors';
import { readableOn } from '../../utils/general';

interface ButtonGroupProps<K, T> {
  options: [K, T][];
  pressFunction: React.Dispatch<SetStateAction<K>>;
  selectedIndex?: number;
  additionalDivClass?: string;
  additionalButtonClass?: string;
  isOverview?: boolean;
  line?: Line;
}

/**
 * A segmented control: the options are alternative views of the same chart, not navigation, so this
 * is a single-select toggle group rather than tabs.
 */
export const ButtonGroup: <T extends string, K extends string>(
  props: ButtonGroupProps<K, T>
) => React.ReactElement<ButtonGroupProps<K, T>> = ({
  options,
  pressFunction,
  selectedIndex = 0,
  additionalDivClass,
  additionalButtonClass,
  line,
}) => {
  // Radix's ToggleGroup is fully controlled by `value`, unlike the Headless UI Tab.Group this
  // replaced (which tracked its own selection when a caller didn't pass selectedIndex). Mirror
  // that tolerance here: track selection internally, syncing from the prop when it's actually
  // driven externally, so callers that never pass selectedIndex still update on click instead of
  // staying pinned to the first option.
  const [internalIndex, setInternalIndex] = React.useState(selectedIndex);
  React.useEffect(() => {
    setInternalIndex(selectedIndex);
  }, [selectedIndex]);

  const selected = options[internalIndex]?.[0];
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  // The active pill slides between items instead of each item's background snapping on/off —
  // measured via DOM query since the underlying Radix items aren't ref-forwarding components.
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const isFirstMove = useRef(true);

  const movePill = useCallback(
    (animate: boolean) => {
      const container = containerRef.current;
      const pill = pillRef.current;
      if (!container || !pill) return;
      const items = container.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]');
      const active = items[internalIndex];
      if (!active) return;
      if (!animate) {
        const prevTransition = pill.style.transition;
        pill.style.transition = 'none';
        pill.style.transform = `translateX(${active.offsetLeft}px)`;
        pill.style.width = `${active.offsetWidth}px`;
        void pill.offsetWidth;
        pill.style.transition = prevTransition;
      } else {
        pill.style.transform = `translateX(${active.offsetLeft}px)`;
        pill.style.width = `${active.offsetWidth}px`;
      }
    },
    [internalIndex]
  );

  useLayoutEffect(() => {
    movePill(!isFirstMove.current);
    isFirstMove.current = false;
  }, [movePill]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => movePill(false));
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [movePill]);

  return (
    <div ref={containerRef} className="relative" style={lineColorVar(line)}>
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-0 rounded-lg bg-(--line-color) transition-[transform,width] duration-(--tabs-dur) ease-(--tabs-ease) motion-reduce:transition-none"
      />
      <ToggleGroup
        type="single"
        value={selected as string}
        onValueChange={(value) => {
          // Radix clears the value when the active item is pressed again; keep the current selection.
          if (!value) return;
          const index = options.findIndex(([key]) => key === value);
          if (index !== -1) setInternalIndex(index);
          pressFunction(value as Parameters<typeof pressFunction>[0]);
        }}
        variant="outline"
        // shadcn's gap utility here (`gap-[--spacing(var(--gap))]`) isn't resolving in this Tailwind
        // build — computed gap comes out `normal` (0px), so the items touch. Set it explicitly.
        className={classNames('w-full gap-1.5', additionalDivClass)}
      >
        {options.map(([value, label]) => (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={label}
            className={classNames(
              // shadcn's item is shrink-0; these need to divide the row, not each claim all of it.
              // relative z-10 keeps the label above the sliding pill. toggleVariants' own
              // data-[state=on]:bg-muted would otherwise paint opaque over the pill underneath, and
              // the outline variant's border would otherwise draw a second, mismatched ring around it.
              'relative z-10 min-w-0 flex-1 shrink basis-0 bg-transparent text-sm data-[state=on]:border-transparent data-[state=on]:bg-transparent',
              needsDarkText ? 'data-[state=on]:text-stone-900' : 'data-[state=on]:text-white',
              additionalButtonClass
            )}
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};
