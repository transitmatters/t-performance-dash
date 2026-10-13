import React from 'react';
import { cn } from '../../../common/utils/cn';

/**
 * A bar standing in for a value that hasn't loaded. Inline, so it can sit inside buttons and table
 * cells; it pulses while loading and holds still once loading has failed.
 */
export const Placeholder: React.FC<{ className?: string; pulse?: boolean }> = ({
  className,
  pulse = true,
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-block rounded bg-muted align-middle',
      pulse && 'animate-pulse motion-reduce:animate-none',
      className
    )}
  />
);
