import React from 'react';
import { useRouter } from 'next/router';
import { ButtonGroup } from '../../general/ButtonGroup';
import { useDashboardConfig } from '../../../state/dashboardConfig';
import { useDatePresetConfig } from '../../../state/datePresetConfig';
import type { OverviewDatePresetKey } from '../../../constants/dates';
import { OverviewRangeTypes } from '../../../constants/dates';

export const OverviewDateSelection = () => {
  const router = useRouter();
  const setDatePreset = useDatePresetConfig((state) => state.setDatePreset);
  const selectedView = router.query.view ?? 'year';
  const selectedIndex = Object.keys(OverviewRangeTypes).findIndex((view) => view === selectedView);

  const overviewPresetChange = useDashboardConfig((state) => state.overviewPresetChange);
  const handlePresetSelection = (value: OverviewDatePresetKey) => {
    overviewPresetChange({ view: value });
    setDatePreset(value, 'line', true);
    router.query.view = value;
    router.push({ pathname: router.pathname, query: router.query });
  };

  return (
    <ButtonGroup
      selectedIndex={selectedIndex}
      pressFunction={handlePresetSelection}
      options={Object.entries(OverviewRangeTypes)}
      additionalButtonClass="w-fit"
      additionalDivClass="md:max-w-md h-10 md:h-7 "
    />
  );
};
