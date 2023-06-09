import React from 'react';
import { Line } from 'react-chartjs-2';

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
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import { THREE_MONTHS_AGO_STRING, TODAY_STRING } from '../../../common/constants/dates';
import { COLORS } from '../../../common/constants/colors';
import type { RidershipCount } from '../../../common/types/dataPoints';
import type { Line as LineType } from '../../../common/types/lines';
import { SPEED_RANGE_PARAM_MAP } from '../../speed/constants/speeds';
import { convertToRidershipDataset } from '../utils';
import { LandingPageChart } from './LandingPageChart';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface OverallRidershipChartProps {
  ridershipData: { line: LineType; data: RidershipCount[] }[];
}
export const OverallRidershipChart: React.FC<OverallRidershipChartProps> = ({ ridershipData }) => {
  const labels = ridershipData[0].data.map((point) => point.date);
  const datasets = ridershipData.map((item) => convertToRidershipDataset(item.data, item.line));

  return (
    <div className="h-[300px] w-full max-w-xl px-16">
      <LandingPageChart datasets={datasets} labels={labels} id="system-ridership" />
    </div>
  );
};
