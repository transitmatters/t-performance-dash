import React from 'react';
import { useRouter } from 'next/router';
import { ButtonGroup } from '../general/ButtonGroup';
import { switchToRange, switchToSingleDay } from '../../../modules/navigation/utils/rangeTabUtils';
import { useDashboardConfig } from '../../state/dashboardConfig';
import { useDelimitatedRoute } from '../../utils/router';

export const RangeControl = () => {
  const dashboardConfig = useDashboardConfig();
  const router = useRouter();
  const {
    query: { queryType },
  } = useDelimitatedRoute();
  const selected = queryType === 'single' ? 0 : 1;

  const handleChange = (index: 'range' | 'single') => {
    if (index === 'single') {
      switchToSingleDay(router, dashboardConfig);
      return;
    }
    switchToRange(router, dashboardConfig);
  };

  return (
    <ButtonGroup
      selectedIndex={selected}
      options={Object.entries({ single: 'Per Trip', range: 'Daily Avg.' })}
      pressFunction={handleChange}
      additionalDivClass="h-10 md:h-7 w-fit"
      additionalButtonClass="w-fit"
    />
  );
};
