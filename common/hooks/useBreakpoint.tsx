import { useMediaQuery } from 'react-responsive';
import tailwindConfig from '../../tailwind.config.js';

const breakpoints = tailwindConfig.theme.screens;

export function useBreakpoint(breakpointKey: string) {
  return useMediaQuery({
    query: `(min-width: ${breakpoints[breakpointKey]})`,
  });
}
