import { useEffect, useState } from 'react';
import { useDatePresetStore } from '../state/datePresetStore';
import type { DateStoreSection } from '../constants/pages';
import type { QueryParams } from '../types/router';

export const usePresetsOnFirstLoad = (
  section: DateStoreSection | undefined,
  query: QueryParams
) => {
  const setDefaults = useDatePresetStore((state) => state.setDefaults);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (firstLoad && section) {
      setDefaults(section, query);
      setFirstLoad(false);
    }
  }, [firstLoad, query, section, setDefaults]);
};
