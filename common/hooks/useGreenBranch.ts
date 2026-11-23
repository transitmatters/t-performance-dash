import { useSearch } from '@tanstack/react-router';
import type { LineRouteId } from '../types/lines';
import { useSetQueryParam } from '../utils/router';

const BRANCHES = ['B', 'C', 'D', 'E'] as const;

/** The Green Line branch in the URL's `branch` param, so links and embeds keep it. B by default. */
export const useGreenBranch = () => {
  const param = useSearch({ strict: false, select: (search) => search.branch });
  const setQueryParam = useSetQueryParam();
  const branch = BRANCHES.find((letter) => letter === param) ?? 'B';
  const routeId: LineRouteId = `Green-${branch}`;

  const setRouteId = (next: LineRouteId) => {
    const letter = next.replace('Green-', '');
    setQueryParam('branch', letter === 'B' ? undefined : letter);
  };

  return { routeId, setRouteId };
};
