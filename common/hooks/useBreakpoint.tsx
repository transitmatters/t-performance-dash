import { useMediaQuery } from 'react-responsive';
import { theme } from '../../tailwind.config.js';

const breakpoints = theme.screens;

export function useBreakpoint(breakpointKey: string) {
  return useMediaQuery({
    query: `(min-width: ${breakpoints[breakpointKey]})`,
  });
}
