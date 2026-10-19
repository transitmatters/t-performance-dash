export const BNRD: Record<
  number,
  {
    url: string;
    date: Date;
    new_routes: number[];
    changed_routes: number[];
    legacy_routes: string[];
  }
> = {
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
  3: {
    url: 'https://www.mbta.com/service-changes/fall-2026-better-bus-network-service-changes',
    date: new Date('09-06-2026'),
    new_routes: [465],
    changed_routes: [65, 220, 222, 435],
    legacy_routes: ['60/65-legacy', '220/221/222-legacy', '434/435/436-legacy'],
  },
};

// A route string may be a single number ('65') or a combined display route
// ('220/221/222'), so every slash-separated part is checked individually.
const routeNums = (route: string) => route.split('/').map((part) => parseInt(part, 10));

export const isNewBnrdRoute = (route: string) => {
  const nums = routeNums(route);
  return Object.values(BNRD).some((phase) => nums.some((n) => phase.new_routes.includes(n)));
};

export const isChangedBnrdRoute = (route: string) => {
  const nums = routeNums(route);
  return Object.values(BNRD).some((phase) => nums.some((n) => phase.changed_routes.includes(n)));
};

export const isLegacyBnrdRoute = (route: string) => {
  return Object.values(BNRD).some((phase) => phase.legacy_routes.includes(route));
};

export const isBNRDRoute = (route: string) => {
  return isNewBnrdRoute(route) || isChangedBnrdRoute(route) || isLegacyBnrdRoute(route);
};
