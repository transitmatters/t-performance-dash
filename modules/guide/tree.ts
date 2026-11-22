import type { Page, PageMetadata } from '../../common/constants/pages';
import { ALL_PAGES } from '../../common/constants/pages';
import type { Line } from '../../common/types/lines';
import type { Route } from '../../common/types/router';
import type { CommandTarget } from '../commandPalette/commandIndex';
import type { GuideAnchor } from './anchors';

/**
 * Dash, the dashboard's guide, is a fixed choose-your-own-adventure: every state the guide can be
 * in is one of these nodes, and every choice leads to another node or closes it. Nothing is
 * generated, so what it says can be reviewed like any other copy.
 */
export const GUIDE_NAME = 'Dash';

export type GuideNodeId =
  | 'welcome'
  | 'pickMode'
  | 'pickSubway'
  | 'commute'
  | 'commuteOther'
  | 'tourLines'
  | 'tourSystem'
  | 'tourSearch'
  | 'tourDone'
  | 'goodbye'
  | 'statusShapes'
  | 'pagesMenu'
  | 'datesHelp'
  | 'shareHelp'
  | 'busIntro'
  | 'commuterRailIntro'
  | 'ferryIntro'
  | 'rideIntro'
  | 'aboutHome'
  | 'aboutOverview'
  | 'aboutTrips'
  | 'aboutBusTrips'
  | 'aboutMultiTrips'
  | 'aboutSlowZones'
  | 'aboutSystemSlowZones'
  | 'aboutSpeed'
  | 'aboutService'
  | 'aboutDelays'
  | 'aboutRidership'
  | 'aboutReliability'
  | 'aboutPredictions'
  | 'aboutFleet'
  | 'aboutSpeedMap'
  | 'aboutRankings'
  | 'aboutSystemRidership';

/** Where a choice navigates before its next node shows. */
export type GuideGo =
  | Exclude<CommandTarget, { kind: 'action' }>
  /**
   * A page of the line on screen, keeping its route, or `fallback` when that line doesn't have
   * the page (or no line is open). Without a fallback that's the Red Line's.
   */
  | { kind: 'linePage'; page: PageMetadata; fallback?: Exclude<CommandTarget, { kind: 'action' }> };

export interface GuideChoice {
  label: string;
  /**
   * The node to show next. `here` is the node about the page on screen (see `PAGE_NODES`), and
   * `close` puts the guide away.
   */
  next: GuideNodeId | 'here' | 'close';
  go?: GuideGo;
  /** Opens the search palette as the guide closes. */
  openSearch?: boolean;
  /** Takes Dash out of the corner until search's "Show the guide" brings it back. */
  hide?: boolean;
}

export interface GuideNode {
  /** One or two short paragraphs. Tests cap the length so the bubble stays small. */
  say: string[];
  /** Highlighted while the node shows, when it's on screen. */
  point?: GuideAnchor;
  choices: GuideChoice[];
}

const SOMETHING_ELSE: GuideChoice = { label: 'Something else', next: 'welcome' };
const GOT_IT: GuideChoice = { label: 'Got it, thanks', next: 'close' };
const DATES: GuideChoice = { label: 'How do I change the dates?', next: 'datesHelp' };
const SHARE: GuideChoice = { label: 'Can I share or download this?', next: 'shareHelp' };

// A page on the line already open keeps its route and stops (see useResolveCommand), so naming the
// line outright only loses them when switching lines.
const overviewOf = (line: Line): GuideGo => ({ kind: 'page', line, page: ALL_PAGES.overview });
const tripsOn = (line: Line): GuideGo => ({ kind: 'page', line, page: ALL_PAGES.singleTrips });
const SYSTEM_SLOW_ZONES: GuideGo = { kind: 'href', href: '/system/slowzones' };

export const GUIDE_TREE: Record<GuideNodeId, GuideNode> = {
  welcome: {
    say: [
      `Hi, I'm ${GUIDE_NAME}! I can show you around the TransitMatters dashboard.`,
      'What would you like to do?',
    ],
    choices: [
      { label: 'See how my line is doing', next: 'pickMode' },
      { label: 'Look up my commute', next: 'commute' },
      { label: 'What am I looking at?', next: 'here' },
      { label: 'Show me the basics', next: 'tourLines' },
      { label: 'Not now', next: 'close' },
    ],
  },

  // Finding a line
  pickMode: {
    say: ['Which kind of service do you ride?'],
    choices: [
      { label: 'Subway', next: 'pickSubway' },
      { label: 'Bus', next: 'busIntro', go: overviewOf('line-bus') },
      {
        label: 'Commuter Rail',
        next: 'commuterRailIntro',
        go: overviewOf('line-commuter-rail'),
      },
      { label: 'Ferry', next: 'ferryIntro', go: { kind: 'line', line: 'line-ferry' } },
      { label: 'The RIDE', next: 'rideIntro', go: { kind: 'line', line: 'line-RIDE' } },
    ],
  },
  pickSubway: {
    say: ['Which line?'],
    choices: [
      { label: 'Red Line', next: 'aboutOverview', go: overviewOf('line-red') },
      { label: 'Orange Line', next: 'aboutOverview', go: overviewOf('line-orange') },
      { label: 'Blue Line', next: 'aboutOverview', go: overviewOf('line-blue') },
      { label: 'Green Line', next: 'aboutOverview', go: overviewOf('line-green') },
      { label: 'Mattapan Trolley', next: 'aboutOverview', go: overviewOf('line-mattapan') },
    ],
  },
  busIntro: {
    say: [
      'Each bus route has its own pages. Choose a route from the page title.',
      'The overview sums up its latest 30 days.',
    ],
    choices: [
      {
        label: 'How long do trips take?',
        next: 'aboutBusTrips',
        go: tripsOn('line-bus'),
      },
      {
        label: 'Which routes are slowest?',
        next: 'aboutRankings',
        go: { kind: 'page', line: 'line-bus', page: ALL_PAGES.leaderboard },
      },
      {
        label: 'Where do buses get stuck?',
        next: 'aboutSpeedMap',
        go: { kind: 'page', line: 'line-bus', page: ALL_PAGES.speedmap },
      },
      SOMETHING_ELSE,
    ],
  },
  commuterRailIntro: {
    say: [
      'Each Commuter Rail line has its own pages. Choose a line from the page title.',
      'The overview sums up its latest 30 days.',
    ],
    choices: [
      {
        label: 'How long do trips take?',
        next: 'aboutTrips',
        go: tripsOn('line-commuter-rail'),
      },
      {
        label: 'How often do trains run?',
        next: 'aboutService',
        go: { kind: 'page', line: 'line-commuter-rail', page: ALL_PAGES.service },
      },
      {
        label: 'Are trains on time?',
        next: 'aboutReliability',
        go: { kind: 'page', line: 'line-commuter-rail', page: ALL_PAGES.reliability },
      },
      SOMETHING_ELSE,
    ],
  },
  ferryIntro: {
    say: [
      'Ferries have trip data: how long each crossing took and the time between boats.',
      'Choose a route from the page title.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  rideIntro: {
    say: [
      "The RIDE is the MBTA's paratransit service. Its pages show how many trips it gave and how often pickups were on time.",
    ],
    choices: [
      {
        label: 'Are pickups on time?',
        next: 'aboutReliability',
        go: { kind: 'page', line: 'line-RIDE', page: ALL_PAGES.reliability },
      },
      SOMETHING_ELSE,
    ],
  },

  // Looking up a commute
  commute: {
    say: ["Let's look up a trip. Which line do you ride?"],
    choices: [
      { label: 'Red Line', next: 'aboutTrips', go: tripsOn('line-red') },
      { label: 'Orange Line', next: 'aboutTrips', go: tripsOn('line-orange') },
      { label: 'Blue Line', next: 'aboutTrips', go: tripsOn('line-blue') },
      { label: 'Green Line', next: 'aboutTrips', go: tripsOn('line-green') },
      { label: 'Mattapan Trolley', next: 'aboutTrips', go: tripsOn('line-mattapan') },
      { label: 'Bus, Commuter Rail or Ferry', next: 'commuteOther' },
    ],
  },
  commuteOther: {
    say: ['Which one?'],
    choices: [
      { label: 'Bus', next: 'aboutBusTrips', go: tripsOn('line-bus') },
      { label: 'Commuter Rail', next: 'aboutTrips', go: tripsOn('line-commuter-rail') },
      { label: 'Ferry', next: 'aboutTrips', go: tripsOn('line-ferry') },
    ],
  },

  // The basics
  tourLines: {
    say: [
      'Everything starts in the menu. Each line is listed there; pick one to see its pages.',
      'On a phone, open it with the button at the top left.',
    ],
    point: 'lines',
    choices: [{ label: 'Next', next: 'tourSystem' }],
  },
  tourSystem: {
    say: [
      'Above the lines are the system pages. They compare every line at once: the home scoreboard, slow zones, and service and ridership.',
    ],
    point: 'system',
    choices: [{ label: 'Next', next: 'tourSearch' }],
  },
  tourSearch: {
    say: [
      'Know where you want to go? Search jumps straight to any line, route, station or page.',
      'Press / from anywhere to open it.',
    ],
    point: 'search',
    choices: [
      { label: 'Try it now', next: 'close', openSearch: true },
      { label: 'Next', next: 'tourDone' },
    ],
  },
  tourDone: {
    say: [
      "That's the basics. I'll stay down here in the corner. Click me whenever you want to know what a page shows.",
    ],
    choices: [{ label: 'Thanks!', next: 'close' }, SOMETHING_ELSE],
  },

  goodbye: {
    say: ['OK, I\'ll get out of your way. To bring me back, search for "guide".'],
    choices: [
      { label: `Hide ${GUIDE_NAME}`, next: 'close', hide: true },
      { label: 'Actually, stay', next: 'welcome' },
    ],
  },

  // Help that applies on many pages
  pagesMenu: {
    say: ["Each line's pages are listed under it in the menu. Here's what a few of them show."],
    point: 'lines',
    choices: [
      { label: 'Speed', next: 'aboutSpeed', go: { kind: 'linePage', page: ALL_PAGES.speed } },
      {
        label: 'Service',
        next: 'aboutService',
        go: { kind: 'linePage', page: ALL_PAGES.service },
      },
      { label: 'Delays', next: 'aboutDelays', go: { kind: 'linePage', page: ALL_PAGES.delays } },
      {
        label: 'Ridership',
        next: 'aboutRidership',
        go: { kind: 'linePage', page: ALL_PAGES.ridership },
      },
      SOMETHING_ELSE,
    ],
  },
  datesHelp: {
    say: [
      'Pick a day or a range of dates here. Presets like "Past week" and "Past month" are one click away.',
      'The dates are part of the link, so sharing the page shares them too.',
    ],
    point: 'dates',
    choices: [SHARE, GOT_IT, SOMETHING_ELSE],
  },
  shareHelp: {
    say: [
      'Every chart has buttons under it: copy a link to this exact view, save the chart as an image, download its data as a CSV, or embed it on another site.',
    ],
    choices: [GOT_IT, SOMETHING_ELSE],
  },

  // About each page. PAGE_NODES maps pages to these.
  aboutHome: {
    say: [
      'The home page answers one question: how is the T doing?',
      'Each row of the scoreboard is a line. Each column grades one thing: service, frequency, reliability, delays and speed.',
    ],
    point: 'scoreboard',
    choices: [
      { label: 'What do the shapes mean?', next: 'statusShapes' },
      { label: 'Tell me about my line', next: 'pickMode' },
      SOMETHING_ELSE,
    ],
  },
  statusShapes: {
    say: [
      'Each grade has its own shape, so you don\'t have to tell colors apart: a star is a win, a filled stop is good, an open ring is room to grow, and a dashed ring with "!" needs work.',
      'Select any grade to see how it was measured.',
    ],
    point: 'statusLegend',
    choices: [{ label: 'Tell me about my line', next: 'pickMode' }, GOT_IT, SOMETHING_ELSE],
  },
  aboutOverview: {
    say: [
      // Subway compares with the previous 30 days and bus with a year ago, so this names neither.
      'The line overview sums up the latest 30 days. Each row is one measure, with how much it has changed.',
      'Select a row to chart it below. Any service alerts are listed further down.',
    ],
    choices: [
      {
        label: 'How long do trips take?',
        next: 'aboutTrips',
        go: { kind: 'linePage', page: ALL_PAGES.singleTrips },
      },
      {
        label: 'Where are the slow zones?',
        next: 'aboutSlowZones',
        go: { kind: 'linePage', page: ALL_PAGES.slowzones, fallback: SYSTEM_SLOW_ZONES },
      },
      { label: 'What do the other pages show?', next: 'pagesMenu' },
      SOMETHING_ELSE,
    ],
  },
  aboutTrips: {
    say: [
      'Trips shows one day of travel between two stops: how long each trip took, and how long riders waited between vehicles.',
      'Pick your two stops here.',
    ],
    point: 'stations',
    choices: [
      DATES,
      {
        label: 'Can I see several days?',
        next: 'aboutMultiTrips',
        go: { kind: 'linePage', page: ALL_PAGES.multiTrips },
      },
      SHARE,
      SOMETHING_ELSE,
    ],
  },
  aboutBusTrips: {
    say: [
      'Trips shows one day of travel between two stops: how long each trip took, and how long riders waited between buses.',
      'Choose your route from the page title, then pick your two stops.',
    ],
    point: 'stations',
    choices: [
      DATES,
      {
        label: 'Can I see several days?',
        next: 'aboutMultiTrips',
        go: { kind: 'linePage', page: ALL_PAGES.multiTrips },
      },
      SHARE,
      SOMETHING_ELSE,
    ],
  },
  aboutMultiTrips: {
    say: [
      'Multi-day trips follows the same two stops across a range of dates, so you can see whether a trip is getting faster or slower.',
      'Switch between one day and several here.',
    ],
    point: 'tripMode',
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutSlowZones: {
    say: [
      'A slow zone is a stretch of track where trains have been running slower than usual, often because of track problems. Each one adds time to every trip through it.',
      'The map shows where they are, and the charts show how much time they add.',
    ],
    choices: [
      { label: 'Show me every line', next: 'aboutSystemSlowZones', go: SYSTEM_SLOW_ZONES },
      DATES,
      SOMETHING_ELSE,
    ],
  },
  aboutSystemSlowZones: {
    say: [
      'This page adds up slow zones across the subway, so you can compare the lines and see how the total has changed.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutSpeed: {
    say: [
      'Speed shows how fast the line ran on average, so you can spot when it sped up or slowed down.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutService: {
    say: [
      'Service shows how many trips ran compared with the schedule, and how often trains came through the day.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutDelays: {
    say: ['Delays adds up how long MBTA delay alerts were up, and what caused them.'],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutRidership: {
    say: ['Ridership shows how many people rode, and which stations or stops are busiest.'],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutReliability: {
    say: [
      'Reliability shows how often service ran on time, and how many trips were cancelled or missed.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutPredictions: {
    say: [
      "Predictions checks the MBTA's arrival countdowns, the ones in apps and on station signs, against when trains actually arrived.",
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutFleet: {
    say: [
      'Fleet shows which vehicles ran: how much service used newer cars, and how old the fleet is.',
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
  aboutSpeedMap: {
    say: [
      'The speed map shows how fast buses moved along each stretch of street, so you can see where they get stuck.',
    ],
    choices: [DATES, SOMETHING_ELSE],
  },
  aboutRankings: {
    say: ['Rankings lines up every bus route by speed, from fastest to slowest.'],
    choices: [DATES, SOMETHING_ELSE],
  },
  aboutSystemRidership: {
    say: [
      "Service & Ridership puts every line's service and ridership side by side, so you can see how each has changed over time.",
    ],
    choices: [DATES, SHARE, SOMETHING_ELSE],
  },
};

/** The node about each page: where the guide opens there, and what "What am I looking at?" leads to. */
export const PAGE_NODES: Partial<Record<Page, GuideNodeId>> = {
  landing: 'aboutHome',
  overview: 'aboutOverview',
  singleTrips: 'aboutTrips',
  multiTrips: 'aboutMultiTrips',
  slowzones: 'aboutSlowZones',
  systemSlowzones: 'aboutSystemSlowZones',
  speed: 'aboutSpeed',
  service: 'aboutService',
  delays: 'aboutDelays',
  ridership: 'aboutRidership',
  reliability: 'aboutReliability',
  predictions: 'aboutPredictions',
  fleet: 'aboutFleet',
  speedmap: 'aboutSpeedMap',
  leaderboard: 'aboutRankings',
  systemServiceAndRidership: 'aboutSystemRidership',
};

/** The bus trip page asks for a route first, so it gets its own node. */
export const pageNode = (page: Page | undefined, line: Line | undefined): GuideNodeId => {
  if (page === 'singleTrips' && line === 'line-bus') return 'aboutBusTrips';
  return (page && PAGE_NODES[page]) ?? 'welcome';
};

/** A `go` as a palette target, so the guide navigates exactly the way search and the sidebar do. */
export const targetFor = (
  go: GuideGo,
  { line, query }: Pick<Route, 'line' | 'query'>
): Exclude<CommandTarget, { kind: 'action' }> => {
  if (go.kind !== 'linePage') return go;
  if (line && go.page.lines.includes(line)) {
    // Only the open mode's route param survives in the URL, so at most one of these is set.
    const route = query.busRoute ?? query.crRoute ?? query.ferryRoute;
    return { kind: 'page', line, page: go.page, route };
  }
  return go.fallback ?? { kind: 'page', line: 'line-red', page: go.page };
};
