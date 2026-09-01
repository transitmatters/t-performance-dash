import React from 'react';
import { cn } from '../../utils/cn';

interface RouteLineProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * The motif kit's "structure" element: the line rendered as a line — a connector/spine/underline.
 * Drawn in the current text color (set via `text-primary` or `style={{ color }}`). Decorative.
 */
export const RouteLine: React.FC<RouteLineProps> = ({ orientation = 'horizontal', className }) => (
  <span
    aria-hidden="true"
    data-slot="route-line"
    className={cn(
      'block bg-current',
      orientation === 'horizontal' ? 'h-0.5 w-full' : 'h-full w-0.5',
      className
    )}
  />
);
