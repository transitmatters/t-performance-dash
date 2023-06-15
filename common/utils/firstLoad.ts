import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDatePresetStore } from '../state/datePresetStore';

export const usePresetsOnFirstLoad = (section, query) => {
  const setDefaults = useDatePresetStore((state) => state.setDefaults);
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (firstLoad && router.isReady) {
      setDefaults(section, query);
      setFirstLoad(false);
    }
  }, [firstLoad, query, router.isReady, section, setDefaults]);
};
