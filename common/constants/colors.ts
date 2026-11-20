import type { Line, LineColorKey } from '../types/lines';
import { colorVisionPalette } from '../utils/colorVision';
import { hexWithAlpha } from '../utils/general';

/**
 * Colorblind mode keeps each line in its color family but pulls the confusable trio apart: Red
 * leans vermilion, Green leans blue-green, and Orange leans yellow, so they separate by hue and
 * lightness for red-green color vision too. Blue, bus, Commuter Rail, ferry and silver already do.
 * colorVision.test.ts checks the separation under simulated color vision deficiency.
 */
const CVD_LINE = {
  red: '#d1400f',
  orange: '#e89a00',
  green: '#008a64',
};

// Canonical MBTA brand hex — the true line colors. These drive the graphic/swatch roles via
// `--line-color` (route bullets, the header fill, chart series, sparklines, station nodes), where
// the color is a fill and contrast isn't a text concern. The AA-adjusted variants used for
// text/UI/focus roles live in the `[data-line]` token blocks in styles/globals.css — see the
// note there. Keep these EXACT, as a brand commitment; adjust only the token variants. The one
// deliberate exception is colorblind mode, which swaps Red, Orange and Green for CVD_LINE above:
// those are off-brand on purpose, so don't "fix" them back to these.
export const MBTA_BRAND_COLORS = {
  red: '#da291c',
  mattapan: '#da291c',
  orange: '#ed8b00',
  blue: '#003da5',
  green: '#00843d',
  bus: '#FFC72C',
  commuterRail: '#80276c',
  ferry: '#008EAA',
  theRide: '#FFC72C',
  silver: '#7C878E',
};

export const COLORS = {
  mbta: colorVisionPalette(MBTA_BRAND_COLORS, {
    red: CVD_LINE.red,
    mattapan: CVD_LINE.red,
    orange: CVD_LINE.orange,
    green: CVD_LINE.green,
  }),
  charts: {
    fillBackgroundColor: '#bfc8d680',
    fillBackgroundColorHourly: '#88aee680',
    pointBackgroundColor: '#1c1c1c',
    pointColor: '#1c1c1c',
  },
  tm: {
    red: '#a31e1e',
    grey: '#2e2d2c',
  },
  design: {
    darkGrey: '#353535',
    sideBar: '#403e3e',
    subtitleGrey: '#808080',
    lightGrey: '#DADADA',
    background: '#F6F6F6',
  },
};

/**
 * Colorblind mode's status ramp: on time is blue rather than green, and the off-schedule steps run
 * amber, vermilion, purple, so no two depend on telling red from green.
 */
const CVD_STATUS = {
  good: '#3b8bd4',
  warn: '#e5a000',
  bad: '#cf4f00',
  worst: '#9b3f97',
};

// Colors for charts
const STANDARD_CHART_COLORS = {
  GREY: '#1c1c1c',
  BLUE: '#0096FF',
  GREEN: '#64b96a',
  // Darkened from #f5ed00, which sat at 1.24:1 against the white plot surface (below the 2:1
  // floor) and read as invisible. #d9a400 clears it at 2.27:1 and stays in the same amber family.
  YELLOW: '#d9a400',
  RED: '#c33149',
  PURPLE: '#bb5cc1',
  FILL: '#bfc8d680',
  FILL_HOURLY: '#88aee680',
  DARK_LINE: '#303030a0',
  // Neutral gray so baseline/benchmark lines (e.g. the historical-max rule) stay visible on both
  // the light and dark plot surfaces; a near-black annotation disappeared in dark mode.
  ANNOTATIONS: hexWithAlpha('#808080', 0.85),
  BLOCKS: hexWithAlpha('#202020', 0.2),
  BLOCKS_SOLID: '#d2d2d2',
  // Amber, apart from the grey "No data" blocks and the yellow alert boxes. The band tints the
  // series it covers; its outlined label reads over bars in either theme.
  SHUTDOWN: hexWithAlpha('#f59e0b', 0.25),
  SHUTDOWN_TEXT: '#92400e',
  SHUTDOWN_TEXT_STROKE: '#ffffff',
  // Tints the side of a benchmark that meets the target; light enough for both plot surfaces
  TARGET_ZONE: hexWithAlpha('#64b96a', 0.15),
};

export const CHART_COLORS = colorVisionPalette(STANDARD_CHART_COLORS, {
  GREEN: CVD_STATUS.good,
  YELLOW: CVD_STATUS.warn,
  RED: CVD_STATUS.bad,
  PURPLE: CVD_STATUS.worst,
  TARGET_ZONE: hexWithAlpha(CVD_STATUS.good, 0.15),
});

export const LINE_COLORS: { [key in LineColorKey | 'default']: string } = colorVisionPalette(
  {
    'line-red': MBTA_BRAND_COLORS.red,
    'line-orange': MBTA_BRAND_COLORS.orange,
    'line-blue': MBTA_BRAND_COLORS.blue,
    'line-green': MBTA_BRAND_COLORS.green,
    'line-bus': MBTA_BRAND_COLORS.bus,
    'line-mattapan': MBTA_BRAND_COLORS.mattapan,
    'line-commuter-rail': MBTA_BRAND_COLORS.commuterRail,
    'line-ferry': MBTA_BRAND_COLORS.ferry,
    'line-RIDE': MBTA_BRAND_COLORS.theRide,
    'line-silver': MBTA_BRAND_COLORS.silver,
    default: '#303030',
  },
  {
    'line-red': CVD_LINE.red,
    'line-mattapan': CVD_LINE.red,
    'line-orange': CVD_LINE.orange,
    'line-green': CVD_LINE.green,
  }
);

/** The color a line's page is drawn in: Silver Line routes (SL1–SL5, SLW) get their own silver. */
export const getLineColorKey = <L extends Line | undefined>(
  line: L,
  busRoute: string | undefined
): L | 'line-silver' => (line === 'line-bus' && busRoute?.startsWith('SL') ? 'line-silver' : line);

/**
 * Line colours for small text, such as station names: each brand colour with its OKLCH lightness
 * capped at 0.56 on light cards and raised to at least 0.72 on dark ones, so every line reads at
 * 4.5:1 or better while keeping its hue.
 */
export const LINE_TEXT_COLORS: Record<LineColorKey, { light: string; dark: string }> =
  colorVisionPalette(
    {
      'line-red': { light: '#d52216', dark: '#ff7360' },
      'line-mattapan': { light: '#d52216', dark: '#ff7360' },
      'line-orange': { light: '#a76101', dark: '#ed8b00' },
      'line-blue': { light: '#003da5', dark: '#70a3fe' },
      'line-green': { light: '#00843d', dark: '#55be73' },
      'line-bus': { light: '#916f04', dark: '#ffc72c' },
      'line-RIDE': { light: '#916f04', dark: '#ffc72c' },
      'line-commuter-rail': { light: '#80276c', dark: '#de7ec4' },
      'line-ferry': { light: '#07829b', dark: '#45b5d1' },
      'line-silver': { light: '#6b767c', dark: '#9ba6ac' },
    },
    {
      'line-red': { light: '#cb3a02', dark: '#fe754f' },
      'line-mattapan': { light: '#cb3a02', dark: '#fe754f' },
      'line-orange': { light: '#9e6700', dark: '#e89a00' },
      'line-green': { light: '#028560', dark: '#4fbc93' },
    }
  );

// Darker line shades, mirroring the `mbta.dark*` colors in tailwind.config.js.
export const LINE_COLORS_DARK: { [key in LineColorKey | 'default']: string } = colorVisionPalette(
  {
    'line-red': '#bc2020',
    'line-orange': '#e08300',
    'line-blue': '#19376B',
    'line-green': '#0E5E3D',
    'line-bus': '#E6A800',
    'line-mattapan': '#bc2020',
    'line-commuter-rail': '#6c215c',
    'line-ferry': '#006B82',
    'line-RIDE': '#E6A800',
    'line-silver': '#5A656A',
    default: '#292524',
  },
  {
    'line-red': '#b93300',
    'line-mattapan': '#b93300',
    'line-orange': '#dc9200',
    'line-green': '#026649',
  }
);

/**
 * Line colors lifted for use as text on a dark ground — the exported chart image, chiefly. The
 * canonical hues are tuned to sit on white: blue lands at 1.9:1 and Commuter Rail at 2.1:1 against
 * a dark card, so those two in particular have to be raised to stay readable. Every value here
 * clears 4.5:1 on #171717.
 */
export const LINE_COLORS_ON_DARK: { [key in LineColorKey | 'default']: string } =
  colorVisionPalette(
    {
      'line-red': '#f1554a',
      'line-orange': '#ed8b00',
      'line-blue': '#5b8def',
      'line-green': '#2fb56e',
      'line-bus': '#ffc72c',
      'line-mattapan': '#f1554a',
      'line-commuter-rail': '#c05fa8',
      'line-ferry': '#3fbbd6',
      'line-RIDE': '#ffc72c',
      // Already 4.9:1 on #171717, so the brand silver is used as is.
      'line-silver': MBTA_BRAND_COLORS.silver,
      default: '#d6d3d1',
    },
    {
      'line-red': '#fe754f',
      'line-mattapan': '#fe754f',
      'line-orange': '#e89a00',
      'line-green': '#4fbc93',
    }
  );

export const LINE_COLORS_LEVELS: {
  [key in Line | 'default']: { [num in number]: string } | string;
} = colorVisionPalette(
  {
    'line-red': { 0: '#D13434', 1: '#d64949', 2: '#da5e5e', 3: '#df7272' },
    'line-orange': { 0: '#ed8b00', 1: '#ff9907', 2: '#ffa321', 3: '#ffae3b' },
    'line-blue': { 0: '#003da5', 1: '#0046bf', 2: '#0050d8', 3: '#0059f2' },
    'line-green': { 0: '#00834d', 1: '#009d5c', 2: '#00b66b', 3: '#00d07a' },
    'line-mattapan': { 0: '#D13434', 1: '#d64949', 2: '#da5e5e', 3: '#df7272' },
    'line-bus': { 0: '#ffc72c', 1: '#ffce46', 2: '#ffd55f', 3: '#ffdb79' },
    'line-commuter-rail': { 0: '#80276c', 1: '#8f2f7e', 2: '#9e3790', 3: '#ad41a2' },
    'line-ferry': { 0: '#008EAA', 1: '#1a9bb5', 2: '#33a8c0', 3: '#4db5cb' },
    'line-RIDE': { 0: '#ffc72c', 1: '#ffce46', 2: '#ffd55f', 3: '#ffdb79' },
    default: '#303030',
  },
  {
    'line-red': { 0: '#d1400f', 1: '#dc4a1e', 2: '#e6552a', 3: '#f15f35' },
    'line-mattapan': { 0: '#d1400f', 1: '#dc4a1e', 2: '#e6552a', 3: '#f15f35' },
    'line-orange': { 0: '#e89a00', 1: '#f2a41e', 2: '#fcad2f', 3: '#ffba5b' },
    'line-green': { 0: '#008a64', 1: '#19936d', 2: '#299d75', 3: '#36a67e' },
  }
);
