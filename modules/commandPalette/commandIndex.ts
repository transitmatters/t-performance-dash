import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faBars,
  faCircleHalfStroke,
  faLink,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { BUS_ROUTE_ID_TO_DISPLAY_NAME, LINE_OBJECTS } from '../../common/constants/lines';
import type { PageMetadata } from '../../common/constants/pages';
import { ALL_PAGES } from '../../common/constants/pages';
import { crStations, getBusRoutes, rtStations } from '../../common/constants/stations';
import type { CommuterRailRoute, Line, LineShort } from '../../common/types/lines';
import {
  COMMUTER_RAIL_LINE_NAMES,
  COMMUTER_RAIL_ROUTES,
  FERRY_LINE_NAMES,
  FERRY_ROUTES,
} from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import { NAV_LINES, lineIcon, pagesForLine } from '../navigation/lineNav';

export type RouteLine = 'line-bus' | 'line-commuter-rail' | 'line-ferry';
export type CommandAction = 'theme' | 'sidebar' | 'copyLink';

export type CommandTarget =
  | { kind: 'href'; href: string }
  | { kind: 'line'; line: Line }
  | { kind: 'page'; line: Line; page: PageMetadata; route?: string }
  | { kind: 'route'; line: RouteLine; route: string }
  | {
      kind: 'station';
      line: Line;
      lineShort: LineShort;
      crRoute?: CommuterRailRoute;
      station: Station;
    }
  | { kind: 'action'; action: CommandAction };

export type CommandGroup = 'Pages' | 'Routes' | 'Stations' | 'Actions';

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  /** Colours the pill and decides the current-line boost. */
  line?: Line;
  /** Pill text naming the line or route the command belongs to. */
  badge?: string;
  /** Right-aligned hint: the path it opens, or what it does. */
  hint?: string;
  icon: IconDefinition;
  /** Lowercased words a query can match. */
  terms: string[];
  /** The label's own words; matching all of them ranks the command above partial matches. */
  labelTerms: string[];
  /** Breaks ties between equal matches: lines before pages before routes before stations. */
  rank: number;
  target: CommandTarget;
}

/** Lowercased alphanumeric words, so "Kendall/MIT" and "SL1/SL2" split the way people type them. */
export const toWords = (text: string): string[] => text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

const LINE_ALIASES: Partial<Record<Line, string[]>> = {
  'line-bus': ['bus', 'buses'],
  'line-commuter-rail': ['cr', 'commuter', 'rail', 'train'],
  'line-ferry': ['ferry', 'boat'],
  'line-RIDE': ['ride', 'paratransit'],
  'line-green': ['trolley'],
  'line-mattapan': ['trolley'],
};

const lineTerms = (line: Line) => [
  ...toWords(LINE_OBJECTS[line].name),
  ...toWords(LINE_OBJECTS[line].short),
  ...(LINE_ALIASES[line] ?? []),
];

const linePath = (line: Line) => `/${LINE_OBJECTS[line].path}`;

const ROUTE_PARAM_PAGES = (line: Line) =>
  pagesForLine(line).filter((page) => page.hasRouteSelector !== false);

/** Words that name the kind of thing, not which one; "Fitchburg" fully names the Fitchburg Line. */
const GENERIC_WORDS = ['line', 'route'];

const command = (fields: Omit<Command, 'terms' | 'labelTerms'> & { extraTerms?: string[] }) => {
  const { extraTerms = [], ...rest } = fields;
  const words = toWords(rest.label);
  return {
    ...rest,
    labelTerms: words.filter((word) => !GENERIC_WORDS.includes(word)),
    terms: [...new Set([...words, ...extraTerms])],
  };
};

const systemCommands = (): Command[] => [
  command({
    id: 'system:landing',
    group: 'Pages',
    label: 'Home',
    hint: '/',
    icon: ALL_PAGES.landing.icon,
    rank: 1,
    target: { kind: 'href', href: '/' },
    extraTerms: ['system', 'scoreboard'],
  }),
  command({
    id: 'system:slowzones',
    group: 'Pages',
    label: 'Slow zones',
    badge: 'System',
    hint: '/system/slowzones',
    icon: ALL_PAGES.systemSlowzones.icon,
    rank: 1,
    target: { kind: 'href', href: '/system/slowzones' },
    extraTerms: ['system', 'speed', 'restrictions'],
  }),
  command({
    id: 'system:ridership',
    group: 'Pages',
    label: 'Service & Ridership',
    badge: 'System',
    hint: '/system/ridership',
    icon: ALL_PAGES.systemServiceAndRidership.icon,
    rank: 1,
    target: { kind: 'href', href: '/system/ridership' },
    extraTerms: ['system'],
  }),
];

const lineCommands = (): Command[] =>
  NAV_LINES.flatMap((line) => [
    command({
      id: `line:${line}`,
      group: 'Pages',
      label: LINE_OBJECTS[line].name,
      line,
      hint: `${linePath(line)}/`,
      icon: lineIcon(line),
      rank: 0,
      target: { kind: 'line', line },
      extraTerms: lineTerms(line),
    }),
    ...pagesForLine(line).map((page) =>
      command({
        id: `page:${line}:${page.key}`,
        group: 'Pages',
        label: page.name,
        line,
        badge: LINE_OBJECTS[line].name,
        hint: `${linePath(line)}${page.path}`,
        icon: page.icon,
        rank: 1,
        target: { kind: 'page', line, page },
        extraTerms: lineTerms(line),
      })
    ),
  ]);

const busRouteTerms = (route: string) =>
  route.split('/').flatMap((part) => {
    const display = BUS_ROUTE_ID_TO_DISPLAY_NAME[part];
    return display ? toWords(`${part} ${display}`) : toWords(part);
  });

const routeCommandsFor = (line: RouteLine, route: string, label: string, terms: string[]) => [
  command({
    id: `route:${line}:${route}`,
    group: 'Routes',
    label,
    line,
    icon: lineIcon(line),
    rank: 2,
    target: { kind: 'route', line, route },
    extraTerms: [...terms, ...lineTerms(line)],
  }),
  ...ROUTE_PARAM_PAGES(line).map((page) =>
    command({
      id: `routePage:${line}:${route}:${page.key}`,
      group: 'Routes',
      label: page.name,
      line,
      badge: label,
      hint: `${linePath(line)}${page.path}`,
      icon: page.icon,
      rank: 3,
      target: { kind: 'page', line, page, route },
      extraTerms: [...toWords(label), ...terms, ...lineTerms(line)],
    })
  ),
];

const routeCommands = (): Command[] => [
  ...getBusRoutes().flatMap((route) =>
    routeCommandsFor('line-bus', route, `Route ${route}`, ['route', ...busRouteTerms(route)])
  ),
  ...COMMUTER_RAIL_ROUTES.flatMap((route) =>
    routeCommandsFor('line-commuter-rail', route, COMMUTER_RAIL_LINE_NAMES[route], toWords(route))
  ),
  ...FERRY_ROUTES.flatMap((route) =>
    routeCommandsFor('line-ferry', route, FERRY_LINE_NAMES[route], toWords(route))
  ),
];

const stationCommand = (
  station: Station,
  line: Line,
  lineShort: LineShort,
  badge: string,
  terms: string[],
  crRoute?: CommuterRailRoute
) =>
  command({
    id: `station:${lineShort}:${crRoute ?? ''}:${station.station}`,
    group: 'Stations',
    label: station.stop_name,
    line,
    badge,
    hint: 'Trips from here',
    icon: faLocationDot,
    rank: 4,
    target: { kind: 'station', line, lineShort, crRoute, station },
    extraTerms: [
      ...terms,
      ...(station.branches ?? []).map((branch) => branch.toLowerCase()),
      'station',
      'stop',
    ],
  });

const stationCommands = (): Command[] => [
  ...(Object.keys(rtStations) as (keyof typeof rtStations)[]).flatMap((lineShort) => {
    const line = `line-${lineShort.toLowerCase()}` as Line;
    return rtStations[lineShort].stations
      .filter((station) => !station.disabled)
      .map((station) =>
        stationCommand(station, line, lineShort, LINE_OBJECTS[line].name, lineTerms(line))
      );
  }),
  ...COMMUTER_RAIL_ROUTES.flatMap((crRoute) =>
    crStations[crRoute].stations
      .filter((station) => !station.disabled)
      .map((station) =>
        stationCommand(
          station,
          'line-commuter-rail',
          'Commuter Rail',
          COMMUTER_RAIL_LINE_NAMES[crRoute],
          [...toWords(COMMUTER_RAIL_LINE_NAMES[crRoute]), ...lineTerms('line-commuter-rail')],
          crRoute
        )
      )
  ),
];

const actionCommands = (): Command[] => [
  command({
    id: 'action:theme',
    group: 'Actions',
    label: 'Toggle dark mode',
    icon: faCircleHalfStroke,
    rank: 5,
    target: { kind: 'action', action: 'theme' },
    extraTerms: ['theme', 'light', 'night'],
  }),
  command({
    id: 'action:sidebar',
    group: 'Actions',
    label: 'Toggle sidebar',
    hint: '⌘B',
    icon: faBars,
    rank: 5,
    target: { kind: 'action', action: 'sidebar' },
    extraTerms: ['collapse', 'expand', 'menu', 'navigation'],
  }),
  command({
    id: 'action:copyLink',
    group: 'Actions',
    label: 'Copy link to this page',
    icon: faLink,
    rank: 5,
    target: { kind: 'action', action: 'copyLink' },
    extraTerms: ['share', 'url'],
  }),
];

let index: Command[] | undefined;

/** Every command the palette can run, built once from the static constants (no network). */
export const getCommandIndex = (): Command[] => {
  index ??= [
    ...systemCommands(),
    ...lineCommands(),
    ...routeCommands(),
    ...stationCommands(),
    ...actionCommands(),
  ];
  return index;
};

export const getCommandById = (id: string) =>
  getCommandIndex().find((candidate) => candidate.id === id);
