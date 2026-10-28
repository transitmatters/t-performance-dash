import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { PRODUCTION } from '../utils/constants';

const SITE_URL = 'https://transitmatters-dd.goatcounter.com/count';

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string; event: boolean }) => void };
  }
}

/**
 * Production-only page counting, matching what `next-goatcounter` recorded: count.js counts the
 * first load itself, and every client-side navigation after it is counted by path + query string
 * (without the leading slash, as the old integration sent it).
 */
export const useGoatCounter = () => {
  const { pathname, searchStr } = useLocation();

  useEffect(() => {
    if (window.location.hostname !== PRODUCTION) return;
    try {
      window.localStorage.setItem('siteUrl', SITE_URL.replace(/\/count$/, ''));
    } catch {
      // Storage can be blocked inside a third-party iframe (embeds); counting still works.
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = '//gc.zgo.at/count.js';
    script.dataset.goatcounter = SITE_URL;
    // count.js skips framed pages unless told otherwise; embeds are meant to be framed.
    script.dataset.goatcounterSettings = JSON.stringify({ allow_frame: true });
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    window.goatcounter?.count({ path: `${pathname}${searchStr}`.slice(1), event: false });
  }, [pathname, searchStr]);
};
