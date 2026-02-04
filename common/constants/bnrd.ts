export const BNRD = {
  1: {
    url: 'https://www.mbta.com/projects/bus-network-redesign/phase-1-service-changes',
    date: new Date('12-15-2024'),
    new_routes: [104, 109, 110, 116],
    changed_routes: [86],
    legacy_routes: ['104-109', '114-116-117'],
  },
  2: {
    url: 'https://www.mbta.com/service-changes/spring-2026-better-bus-network-service-changes',
    date: new Date('04-05-2026'),
    new_routes: [],
    changed_routes: [85, 87, 350],
    legacy_routes: ['CT2', '40/50'],
  },
};

export const isNewBnrdRoute = (route: string) => {
  const routeNum = parseInt(route, 10);
  return BNRD[1].new_routes.includes(routeNum) || BNRD[2].new_routes.includes(routeNum);
};

export const isChangedBnrdRoute = (route: string) => {
  const routeNum = parseInt(route, 10);
  return BNRD[1].changed_routes.includes(routeNum) || BNRD[2].changed_routes.includes(routeNum);
};

export const isLegacyBnrdRoute = (route: string) => {
  return BNRD[1].legacy_routes.includes(route) || BNRD[2].legacy_routes.includes(route);
};

export const isBNRDRoute = (route: string) => {
  return isNewBnrdRoute(route) || isChangedBnrdRoute(route) || isLegacyBnrdRoute(route);
};
