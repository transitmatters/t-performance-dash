export const BNRD = {
  1: {
    url: 'https://www.mbta.com/projects/bus-network-redesign/phase-1-service-changes',
    date: new Date('12-15-2025'),
    new_routes: [104, 109, 110, 116],
    changed_routes: [86],
    legacy_routes: ['104-109', '114-116-117'],
  },
};

export const isNewBnrdRoute = (route: string) => {
  const routeNum = parseInt(route);
  return BNRD[1].new_routes.includes(routeNum);
};

export const isChangedBnrdRoute = (route: string) => {
  const routeNum = parseInt(route);
  return BNRD[1].changed_routes.includes(routeNum);
};

export const isLegacyBnrdRoute = (route: string) => {
  return BNRD[1].legacy_routes.includes(route);
};

export const isBNRDRoute = (route: string) => {
  return isNewBnrdRoute(route) || isChangedBnrdRoute(route) || isLegacyBnrdRoute(route);
};
