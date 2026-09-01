import React from 'react';
import { cn } from '../../utils/cn';

const SIZES = { sm: 'size-2.5', md: 'size-3.5', lg: 'size-4' } as const;

interface RouteBulletProps {
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * The motif kit's "identity" element: the T's colored line bullet — used sparingly to say
 * *which* line (a switcher row, a section title). Drawn in the current text color, so set it
 * with `text-primary` (active line) or an explicit `style={{ color }}`. Decorative.
 */
export const RouteBullet: React.FC<RouteBulletProps> = ({ size = 'md', className }) => (
  <span
    aria-hidden="true"
    data-slot="route-bullet"
    className={cn('inline-block shrink-0 rounded-full bg-current', SIZES[size], className)}
  />
);
