import React from 'react';
import { useRouter } from 'next/router';
import { ButtonGroup } from '../../general/ButtonGroup';
import { useDashboardConfig } from '../../../state/dashboardConfig';
import type { OverviewDatePresetKey } from '../../../constants/dates';
import { OverviewRangeTypes } from '../../../constants/dates';

export const OverviewDateSelection = () => {
  const router = useRouter();
  const selectedView = router.query.view ?? 'year';
  const selectedIndex = Object.keys(OverviewRangeTypes).findIndex((view) => view === selectedView);

  const overviewPresetChange = useDashboardConfig((state) => state.overviewPresetChange);
  const handlePresetSelection = (value: OverviewDatePresetKey) => {
    overviewPresetChange({ view: value });
    router.query.view = value;
    router.push(router);
  };

  return (
    <ButtonGroup
      selectedIndex={selectedIndex}
      pressFunction={handlePresetSelection}
      options={Object.entries(OverviewRangeTypes)}
    />
  );
};
