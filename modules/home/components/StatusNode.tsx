import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../../common/utils/cn';
import type { Status } from '../types';

interface StatusNodeProps {
  status: Status;
  className?: string;
}

/**
 * A strip-map stop whose shape carries the status, so it reads without color: a starred stop for
 * a win, a solid stop for good, an open ring for room to grow, a dashed ring with "!" for needs
 * work, a hatched stop when there isn't enough data, and a dash when it isn't measured. Drawn in
 * the current text color (the line's color via `text-primary`). Decorative: the label beside it
 * says the same thing in words.
 */
export const StatusNode: React.FC<StatusNodeProps> = ({ status, className }) => {
  if (status === 'na') {
    return (
      <span
        aria-hidden="true"
        className={cn('bg-muted-foreground/40 inline-block h-0.5 w-3 rounded-full', className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      data-status={status}
      className={cn(
        'relative inline-flex size-5 shrink-0 items-center justify-center rounded-full',
        status === 'win' && 'bg-current shadow-[0_0_0_4px] shadow-current/20',
        status === 'good' && 'bg-current',
        status === 'room' && 'bg-background border-[3px] border-current',
        status === 'problem' && 'bg-background border-2 border-dashed border-current',
        status === 'insufficient' && 'bg-background border-2 border-current/40',
        className
      )}
      style={
        status === 'insufficient'
          ? {
              backgroundImage:
                'repeating-linear-gradient(45deg, color-mix(in oklch, currentColor 45%, transparent) 0 1.5px, transparent 1.5px 4px)',
            }
          : undefined
      }
    >
      {status === 'win' && <Star className="text-background size-3 fill-current" />}
      {status === 'problem' && <span className="text-[11px] leading-none font-bold">!</span>}
    </span>
  );
};
