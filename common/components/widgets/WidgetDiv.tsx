import React from 'react';
import { cn } from '../../utils/cn';
import { Card } from '../ui/card';

interface WidgetDivProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The dashboard's chart card. Built on the shadcn `Card` so it shares one surface, one radius and
 * one spacing token with the redesigned pages — it used to reproduce the same look with hard-coded
 * padding and its own type scale, which read as a bug rather than as a different section wherever
 * the two met. `Card` pads vertically via `--card-spacing`; the horizontal half is added here so
 * every child lines up without carrying padding of its own.
 */
export const WidgetDiv: React.FC<WidgetDivProps> = ({ children, className }) => {
  return <Card className={cn('h-full px-(--card-spacing)', className)}>{children}</Card>;
};
