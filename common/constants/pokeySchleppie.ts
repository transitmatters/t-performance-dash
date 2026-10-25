import type { BusRoute } from '../types/lines';

export type PokeySchleppieAward = 'pokey' | 'schleppie';

// Routes are written as the awards print them, in rank order (#1 first). A name matches any bus
// route page that includes it, so '19' shows on 17/19 and '116' on both 116 and 114/116/117.
export const POKEY_SCHLEPPIE_AWARDS: Record<
  number,
  { url: string; pokey: string[]; schleppie: string[] }
> = {
  2024: {
    url: 'https://drive.google.com/file/d/1QFTVg0N3-uQeVoMqlOE6QLPqcoCtifzp/view',
    pokey: ['1'],
    schleppie: ['1'],
  },
  2025: {
    url: 'https://transitmatters.org/blog/pokey-schleppie-2025',
    pokey: ['1', 'CT3', 'SL4/SL5', '19', '66', '45', '91', '23', '10', '28'],
    schleppie: ['23', '111', '1', '39', '32', 'SL4/SL5', '22', '66', '28', '57'],
  },
  2026: {
    url: 'https://static1.squarespace.com/static/533b9a24e4b01d79d0ae4376/t/6aa89b93b1de2f7c174a98e3/1789483706900/TransitMattersPokeySchleppie2026.pdf',
    pokey: ['SL4', '1', '93', '47', 'CT3', '92', '66', 'SL5', '19', '10'],
    schleppie: ['32', '116', '1', '39', '66', '22', '31', '57', '23', '111'],
  },
};

export interface PokeySchleppiePlacement {
  year: number;
  award: PokeySchleppieAward;
  route: string;
  rank: number;
}

export const getPokeySchleppiePlacements = (busRoute: BusRoute): PokeySchleppiePlacement[] => {
  const busRouteParts = busRoute.split('/');

  // Need this for combined routes
  const matchesBusRoute = (route: string) =>
    route.split('/').some((part) => busRouteParts.includes(part));

  const placements: PokeySchleppiePlacement[] = [];

  for (const [year, lists] of Object.entries(POKEY_SCHLEPPIE_AWARDS)) {
    for (const award of ['pokey', 'schleppie'] as const) {
      lists[award].forEach((route, index) => {
        if (matchesBusRoute(route)) {
          placements.push({ year: Number(year), award, route, rank: index + 1 });
        }
      });
    }
  }
  return placements;
};
