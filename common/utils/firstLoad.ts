import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDatePresetStore } from '../state/datePresetStore';
import type { DateStoreSection } from '../constants/pages';
import type { QueryParams } from '../types/router';

export const usePresetsOnFirstLoad = (
  section: DateStoreSection | undefined,
  query: QueryParams
) => {
  const setDefaults = useDatePresetStore((state) => state.setDefaults);
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (firstLoad && router.isReady && section) {
      setDefaults(section, query);
      setFirstLoad(false);
    }
  }, [firstLoad, query, router.isReady, section, setDefaults]);
};
