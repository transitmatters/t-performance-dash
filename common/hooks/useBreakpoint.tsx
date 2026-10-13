import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS } from '../constants/breakpoints';

export function useBreakpoint(breakpointKey: keyof typeof BREAKPOINTS) {
  return useMediaQuery({
    query: `(min-width: ${BREAKPOINTS[breakpointKey]})`,
  });
}
