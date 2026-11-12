/**
 * Titles for exported chart images. A chart's export normally takes the title and subtitle of the
 * widget card around it; these are the fallback for a chart drawn outside a card, such as an embed.
 * Every dataset name a SaveChartImageButton can take has to be listed here.
 */
const CHART_TITLES = {
  headways: 'Headways',
  traveltimes: 'Travel times',
  traveltimesByHour: 'Travel times by hour',
  dwells: 'Dwells',
  speeds: 'Speed',
  speed: 'Speed',
  ridership: 'Ridership',
  predictions: 'Arrival predictions',
  service: 'Service',
  slowtime: 'Total slow time',
  'delay-totals': 'How much delay',
  'delay-causes': 'What caused it',
  'delays-by-reason': 'How the causes changed',
  'fleet-mix': 'Fleet mix',
  'fleet-pct-new-trains': '% of trips run by new trains',
  'fleet-car-age': 'Average car age',
  'fleet-pct-battery-trips': '% of trips run by battery-electric buses',
  'fleet-bus-age': 'Average bus age',
  'fleet-cab-car-age': 'Average cab car age',
  'reliability-on-time': 'On time over time',
  'reliability-off-schedule': 'Bunching or long gaps',
  'reliability-excess-trip-time': 'Where the extra time comes from',
  'traveltimes-by-vehicle': 'By vehicle',
} as const;

export type ChartDatasetName = keyof typeof CHART_TITLES;

export const CHART_DATASET_NAMES = Object.keys(CHART_TITLES) as ChartDatasetName[];

const CHART_SUBTITLES: Partial<Record<ChartDatasetName, string>> = {
  headways: 'Time between trains',
  traveltimes: 'Time between stops',
  dwells: 'Time spent at station',
  speeds: 'Average speed between stops',
  speed: 'Average speed between stops',
  slowtime: 'Time over baseline',
};

export const getChartTitle = (datasetName: ChartDatasetName): string => CHART_TITLES[datasetName];

export interface CardHeading {
  title?: string;
  subtitle?: string;
}

interface ChartHeadingOptions {
  datasetName: ChartDatasetName;
  chartTitle?: string;
  chartSubtitle?: string;
  /** The heading of the widget card the chart sits in, if any. */
  card?: CardHeading;
}

/** An explicit title wins, then the on-screen card heading, then the fallback maps. */
export const resolveChartHeading = ({
  datasetName,
  chartTitle,
  chartSubtitle,
  card,
}: ChartHeadingOptions): { title: string; subtitle?: string } => {
  if (card?.title) {
    return { title: chartTitle ?? card.title, subtitle: chartSubtitle ?? card.subtitle };
  }
  return {
    title: chartTitle ?? getChartTitle(datasetName),
    subtitle: chartSubtitle ?? CHART_SUBTITLES[datasetName],
  };
};
