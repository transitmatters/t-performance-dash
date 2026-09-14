import React from 'react';
import { cn } from '../../utils/cn';

const SIZES = { sm: 'size-2.5', md: 'size-3', lg: 'size-3.5' } as const;

interface StationNodeProps {
  size?: keyof typeof SIZES;
  /** Filled marks the active/selected stop; otherwise a ring (a stop on the line). */
  filled?: boolean;
  className?: string;
}

/**
 * The motif kit's "point" element: a transit station marker. Drawn in the current text color,
 * so set it with `text-primary` (active line) or an explicit `style={{ color }}`. Decorative —
 * the label beside it carries the meaning.
 */
export const StationNode: React.FC<StationNodeProps> = ({
  size = 'md',
  filled = false,
  className,
}) => (
  <span
    aria-hidden="true"
    data-slot="station-node"
    className={cn(
      'inline-block shrink-0 rounded-full border-2 border-current',
      filled ? 'bg-current' : 'bg-background',
      SIZES[size],
      className
    )}
  />
);
