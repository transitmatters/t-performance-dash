import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDatePresetConfig } from '../state/datePresetConfig';

export const usePresetsOnFirstLoad = (section, query) => {
  const setDefaults = useDatePresetConfig((state) => state.setDefaults);
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (firstLoad && router.isReady) {
      setDefaults(section, query);
      setFirstLoad(false);
    }
  }, [firstLoad, query, router.isReady, section, setDefaults]);
};
