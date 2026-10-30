import { useEffect, useRef } from 'react';
import { useDatePresetStore } from '../state/datePresetStore';
import type { DateStoreSection } from '../constants/pages';
import type { QueryParams } from '../types/router';

export const usePresetsOnFirstLoad = (
  section: DateStoreSection | undefined,
  query: QueryParams
) => {
  const setDefaults = useDatePresetStore((state) => state.setDefaults);
  const loaded = useRef(false);

  useEffect(() => {
    if (!loaded.current && section) {
      loaded.current = true;
      setDefaults(section, query);
    }
  }, [query, section, setDefaults]);
};
