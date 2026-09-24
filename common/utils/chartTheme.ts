import { CHART_COLORS } from '../constants/colors';
import { useThemeStore } from '../state/themeStore';

/** Bold-but-refined line weight for the hero series across the design-system charts. */
export const HERO_LINE_WIDTH = 2.5;

export interface ChartTheme {
  /** Axis tick labels and axis titles. */
  tick: string;
  /** Horizontal rules behind the plot. */
  grid: string;
  /** The axis rule itself. */
  axisBorder: string;
  /** Fill and stroke for the MBTA benchmark band. */
  benchmarkFill: string;
  benchmarkLine: string;
  /** Series color for a point with no benchmark to judge it against (dwells, speeds). */
  neutralPoint: string;
  /** Median line on the aggregate charts. */
  medianLine: string;
}

const LIGHT: ChartTheme = {
  tick: '#57534e',
  grid: 'rgba(0,0,0,0.06)',
  axisBorder: 'rgba(0,0,0,0.10)',
  benchmarkFill: '#a0a0a030',
  benchmarkLine: '#a0a0a030',
  neutralPoint: '#1c1c1c',
  medianLine: '#000000',
};

const DARK: ChartTheme = {
  tick: '#a8a29e',
  grid: 'rgba(255,255,255,0.10)',
  axisBorder: 'rgba(255,255,255,0.18)',
  benchmarkFill: '#e8e8e826',
  benchmarkLine: '#e8e8e84d',
  neutralPoint: '#d6d3d1',
  medianLine: '#e7e5e4',
};

/**
 * Chart.js paints into a canvas, so it can't inherit the CSS theme tokens the rest of the UI uses —
 * every color has to be handed to it as a literal. Left hard-coded for the light plot surface, the
 * gridlines, ticks and any series without a benchmark (dwells especially) disappeared once the card
 * behind them went dark. This resolves that palette from the same store that drives the `dark`
 * class, so both themes get a readable plot.
 */
export const useChartTheme = (): ChartTheme => {
  const theme = useThemeStore((state) => state.theme);
  return theme === 'dark' ? DARK : LIGHT;
};

/** Non-hook access for the few chart helpers that run outside React's render. */
export const getChartTheme = (): ChartTheme =>
  useThemeStore.getState().theme === 'dark' ? DARK : LIGHT;

/**
 * How far a trip ran from its MBTA benchmark, as a color ramp. Saturated enough to read on either
 * plot surface, so it does not vary with the theme — it lives here so the charts and the legend
 * that explains them draw from one source.
 */
export const SEVERITY_COLORS = {
  onTime: CHART_COLORS.GREEN,
  off25: CHART_COLORS.YELLOW,
  off50: CHART_COLORS.RED,
  off100: CHART_COLORS.PURPLE,
};
