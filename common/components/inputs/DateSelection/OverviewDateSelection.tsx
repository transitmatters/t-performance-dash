import React from 'react';
import { useRouter } from 'next/router';
import { ButtonGroup } from '../../general/ButtonGroup';
import { useDateStore } from '../../../state/dateStore';
import { useDatePresetStore } from '../../../state/datePresetStore';
import type { OverviewDatePresetKey } from '../../../constants/dates';
import { OverviewRangeTypes } from '../../../constants/dates';
import { useDelimitatedRoute } from '../../../utils/router';

export const OverviewDateSelection = () => {
  const router = useRouter();
  const { line } = useDelimitatedRoute();
  const setDatePreset = useDatePresetStore((state) => state.setDatePreset);
  const selectedView = router.query.view ?? 'year';
  const selectedIndex = Object.keys(OverviewRangeTypes).findIndex((view) => view === selectedView);

  const overviewPresetChange = useDateStore((state) => state.overviewPresetChange);
  const handlePresetSelection = (value: OverviewDatePresetKey) => {
    overviewPresetChange({ view: value });
    setDatePreset(value, 'line', true);
    router.query.view = value;
    router.push({ pathname: router.pathname, query: router.query }, undefined, { shallow: true });
  };

  return (
    <ButtonGroup
      selectedIndex={selectedIndex}
      pressFunction={handlePresetSelection}
      options={Object.entries(OverviewRangeTypes)}
      additionalButtonClass="w-fit text-xs sm:text-base md:text-xs lg:text-sm"
      additionalDivClass="md:max-w-md h-10 md:h-7"
      isOverview
      line={line}
    />
  );
};
