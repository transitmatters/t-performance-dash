import { useDelimitatedRoute, useSetQueryParam } from '../../common/utils/router';
import type { DelayReasonKey } from './constants/reasons';
import { DELAY_REASONS } from './constants/reasons';

export const useFocusedReason = () => {
  const { query } = useDelimitatedRoute();
  const setQueryParam = useSetQueryParam();
  const focus = DELAY_REASONS.find((reason) => reason.key === query.focus)?.key ?? null;

  const setFocus = (next: DelayReasonKey | null) => setQueryParam('focus', next ?? undefined);

  return { focus, setFocus };
};
