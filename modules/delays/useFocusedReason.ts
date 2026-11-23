import { useSearch } from '@tanstack/react-router';
import { useSetQueryParam } from '../../common/utils/router';
import type { DelayReasonKey } from './constants/reasons';
import { DELAY_REASONS } from './constants/reasons';

export const useFocusedReason = () => {
  const param = useSearch({ strict: false, select: (search) => search.focus });
  const setQueryParam = useSetQueryParam();
  const focus = DELAY_REASONS.find((reason) => reason.key === param)?.key ?? null;

  const setFocus = (next: DelayReasonKey | null) => setQueryParam('focus', next ?? undefined);

  return { focus, setFocus };
};
