import { useEffect, useState } from 'react';

type Viewport<T = number> = {
  width: T;
  height: T;
};

const getInitialViewport = (): null | Viewport => {
  if (typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  return null;
};

export const useViewport = () => {
  const [viewport, setViewport] = useState<null | Viewport>(() => getInitialViewport());

  useEffect(() => {
    const listener = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, []);

  if (viewport) {
    return {
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    };
  }
  return { viewportWidth: null, viewportHeight: null };
};
