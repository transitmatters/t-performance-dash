import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  LineController,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { annotationHoverCardPlugin } from '../components/charts/annotationTooltip';
import { hoverHighlightPlugin } from '../components/charts/hoverCard/hoverHighlightPlugin';
import { externalHoverCard, hoverCardCleanupPlugin } from '../components/charts/hoverCard/external';

ChartJS.register(
  BarController,
  BarElement,
  LineController,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Annotation,
  ChartDataLabels,
  Filler,
  Title,
  Tooltip,
  Legend,
  hoverHighlightPlugin,
  annotationHoverCardPlugin,
  hoverCardCleanupPlugin
);

// Hovers render in the shared HTML card (ChartHoverCard) instead of Chart.js's canvas tooltip.
ChartJS.defaults.plugins.tooltip.enabled = false;
ChartJS.defaults.plugins.tooltip.external = externalHoverCard;

// Vertical gridlines add noise without helping anyone compare values, so drop them for every
// chart at once rather than per-config — the x axis is a time or category scale throughout.
(['time', 'timeseries', 'category'] as const).forEach((scaleType) => {
  const scale = ChartJS.defaults.scales[scaleType];
  if (scale) scale.grid = { ...scale.grid, display: false };
});

// Keep the remaining horizontal rules recessive. A neutral gray at low alpha reads on both the
// light and dark grounds — a near-black rule vanishes on the dark theme.
if (ChartJS.defaults.scales.linear) {
  ChartJS.defaults.scales.linear.grid = {
    ...ChartJS.defaults.scales.linear.grid,
    color: 'rgba(128,128,128,0.16)',
  };
}

// ChartDataLabels plugin defaults to displaying on every chart.
if (ChartJS.defaults.plugins.datalabels?.display)
  ChartJS.defaults.plugins.datalabels.display = false;
