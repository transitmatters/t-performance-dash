import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { hideHoverCard, showHoverCard } from '../hoverCard/hoverCardStore';
import type { ResolvedHoverCardContent } from '../hoverCard/types';
import { Skeleton } from '../../ui/skeleton';
import type { TrackGeometry } from './chartGeometryPlugin';
import { cn } from '@/common/utils/cn';

export const LANE_HEIGHT = 10;
const LANE_GAP = 2;
const LABEL_PADDING = 8;

/** Opens the shared chart hover card above an element of the track. */
export const showTrackCard = (
  element: HTMLElement,
  content: ResolvedHoverCardContent,
  x?: number
) => {
  const rect = element.getBoundingClientRect();
  showHoverCard('annotation', {
    content,
    x: x ?? rect.left + rect.width / 2,
    y: rect.top,
    placement: 'above',
    owner: element,
  });
};

export const hideTrackCard = (element: HTMLElement) => hideHoverCard('annotation', element);

interface TrackRowProps {
  label: string;
  // Shown when the label doesn't fit in the y axis's width
  shortLabel?: string;
  icon: IconDefinition;
  geometry: TrackGeometry;
  status: 'loading' | 'empty' | 'ready';
  emptyText: string;
  lanes?: number;
  // Overrides the lanes' height, for rows drawn as a line rather than segments
  contentHeight?: number;
  // Hides the label text, so every row's icon shows alone when any row's label doesn't fit
  iconOnly?: boolean;
  // Reports whether the label fits whole, or null once the row is gone
  onLabelFit?: (label: string, fits: boolean | null) => void;
  children?: ReactNode;
}

export const TrackRow = ({
  label,
  shortLabel,
  icon,
  geometry,
  status,
  emptyText,
  lanes = 1,
  contentHeight,
  iconOnly = false,
  onLabelFit,
  children,
}: TrackRowProps) => {
  const lanesHeight = contentHeight ?? lanes * LANE_HEIGHT + (lanes - 1) * LANE_GAP;
  const height = Math.max(lanesHeight, 14);
  const candidates = shortLabel ? [label, shortLabel] : [label];
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[] | null>(null);
  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (!cancelled) setWidths(measureRefs.current.map((element) => element?.offsetWidth ?? 0));
    };
    measure();
    // Web fonts can load after the first measurement and change the widths
    void document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [label, shortLabel]);
  // The longest label that fits whole beside the icon
  const fitting = widths
    ? candidates.find((_, index) => widths[index] <= geometry.left - LABEL_PADDING)
    : undefined;
  const fits = widths ? fitting !== undefined : null;
  useLayoutEffect(() => {
    if (fits === null) return;
    onLabelFit?.(label, fits);
    return () => onLabelFit?.(label, null);
  }, [fits, label, onLabelFit]);
  const text = iconOnly ? undefined : fitting;
  return (
    <div role="group" aria-label={label} className="flex items-center">
      <div
        className="relative flex shrink-0 justify-end text-xs leading-none text-muted-foreground"
        style={{ width: geometry.left, paddingRight: LABEL_PADDING }}
      >
        <span
          className="flex min-w-0 items-center gap-1"
          title={text === label ? undefined : label}
        >
          <FontAwesomeIcon icon={icon} className="size-3 shrink-0" aria-hidden />
          {text && <span className="whitespace-nowrap">{text}</span>}
        </span>
        {candidates.map((candidate, index) => (
          <span
            key={candidate}
            ref={(element) => {
              measureRefs.current[index] = element;
            }}
            aria-hidden
            className="invisible absolute top-0 left-0 flex items-center gap-1 whitespace-nowrap"
          >
            <span className="size-3 shrink-0" />
            {candidate}
          </span>
        ))}
      </div>
      <div className="relative shrink-0" style={{ width: geometry.right - geometry.left, height }}>
        {status === 'loading' && (
          <Skeleton className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2" />
        )}
        {status === 'empty' && (
          <p className="absolute inset-0 flex items-center text-xs leading-none text-muted-foreground/80">
            {emptyText}
          </p>
        )}
        {status === 'ready' && (
          <>
            <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div
              className="absolute inset-x-0"
              style={{ top: (height - lanesHeight) / 2, height: lanesHeight }}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface SegmentProps {
  start: number;
  end: number;
  lane?: number;
  color: string;
  pinned: boolean;
  label: string;
  card: ResolvedHoverCardContent;
  onToggle: () => void;
}

/** One alert or stretch of weather, placed by fractions of the plot's width. */
export const Segment = ({
  start,
  end,
  lane = 0,
  color,
  pinned,
  label,
  card,
  onToggle,
}: SegmentProps) => {
  const withHint = {
    ...card,
    notes: [
      ...(card.notes ?? []),
      pinned ? 'Click to remove the shading' : 'Click to shade it on the chart',
    ],
  };
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={label}
      onClick={(event) => {
        onToggle();
        // Keep the card open, with the hint flipped
        showTrackCard(event.currentTarget, {
          ...withHint,
          notes: [
            ...(card.notes ?? []),
            pinned ? 'Click to shade it on the chart' : 'Click to remove the shading',
          ],
        });
      }}
      onMouseEnter={(event) => showTrackCard(event.currentTarget, withHint)}
      onMouseLeave={(event) => hideTrackCard(event.currentTarget)}
      onFocus={(event) => showTrackCard(event.currentTarget, withHint)}
      onBlur={(event) => hideTrackCard(event.currentTarget)}
      className={cn(
        'absolute min-w-1 rounded-[3px] transition-[opacity,box-shadow] duration-100 focus-visible:outline-hidden',
        pinned
          ? 'opacity-100 ring-2 ring-foreground/70 ring-offset-1 ring-offset-background'
          : 'opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring'
      )}
      style={{
        left: `${start * 100}%`,
        width: `${Math.max(end - start, 0) * 100}%`,
        top: lane * (LANE_HEIGHT + LANE_GAP),
        height: LANE_HEIGHT,
        backgroundColor: color,
      }}
    />
  );
};
