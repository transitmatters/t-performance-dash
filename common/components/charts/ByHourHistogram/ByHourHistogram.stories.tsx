import React from 'react';

import { COLORS } from '../../../constants/colors';
import { ByHourHistogram } from './ByHourHistogram';

export default {
  title: 'ByHourHistogram',
  component: ByHourHistogram,
};

const simpleData = [
  {
    label: '2023',
    data: [0, 0, 0, 0, 5, 6, 7, 8, 7, 6, 5, 5, 4, 4, 5, 6, 7, 8, 9, 10, 10, 9, 8, 7],
    style: { opacity: 0.5 },
  },
  {
    label: '2024',
    data: [0, 0, 0, 0, 6, 7, 8, 9, 9, 7, 6, 5, 4, 5, 6, 6, 8, 9, 9, 11, 12, 10, 8, 8],
  },
];

export const Default = () => (
  <ByHourHistogram
    data={simpleData}
    valueAxis={{ title: 'Items', tooltipItemLabel: 'trips per direction' }}
    style={{ color: COLORS.mbta.red }}
  />
);
