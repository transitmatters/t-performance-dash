import { cn } from '../../../common/utils/cn';

/**
 * A bar standing in for a value that hasn't loaded. Inline, so it can sit inside buttons and table
 * cells; it pulses while loading and holds still once loading has failed.
 */
export const Placeholder = ({
  className,
  pulse = true,
}: {
  className?: string;
  pulse?: boolean;
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
