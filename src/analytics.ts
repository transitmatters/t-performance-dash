import { PRODUCTION } from './constants';

declare global {
  interface Window { goatcounter: any; }
}

export function goatcount() {
  if (window.location.hostname === PRODUCTION) {
    window.goatcounter?.count?.({
      path: window.location.pathname + window.location.search,
    });
  }
}
