import { PRODUCTION } from './constants';

declare global {
  interface Window { goatcounter: any; }
}

export function goatcount(path=window.location.pathname + window.location.search) {
  if (window.location.hostname === PRODUCTION) {
    window.goatcounter?.count?.({
      path,
    });
  }
}
