import type { LineRouteId } from '../../common/types/lines';
import { useDelimitatedRoute, useSetQueryParam } from '../../common/utils/router';

const BRANCHES = ['B', 'C', 'D', 'E'] as const;

/** The Green Line branch in the URL's `branch` param, so links and embeds keep it. B by default. */
export const useGreenBranch = () => {
  const { query } = useDelimitatedRoute();
  const setQueryParam = useSetQueryParam();
  const branch = BRANCHES.find((letter) => letter === query.branch) ?? 'B';
  const routeId = `Green-${branch}` as LineRouteId;

  const setRouteId = (next: LineRouteId) => {
    const letter = next.replace('Green-', '');
    setQueryParam('branch', letter === 'B' ? undefined : letter);
  };

  return { routeId, setRouteId };
};
