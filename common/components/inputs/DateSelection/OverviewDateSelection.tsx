import { ButtonGroup } from '../../general/ButtonGroup';
import { useDateStore } from '../../../state/dateStore';
import { useDatePresetStore } from '../../../state/datePresetStore';
import type { OverviewDatePresetKey } from '../../../constants/dates';
import { OverviewRangeTypes } from '../../../constants/dates';
import { useDelimitatedRoute, useNavigateToQuery } from '../../../utils/router';

export const OverviewDateSelection = () => {
  const navigateToQuery = useNavigateToQuery();
  const { line, query } = useDelimitatedRoute();
  const setDatePreset = useDatePresetStore((state) => state.setDatePreset);
  const selectedView = query.view ?? 'year';
  const selectedIndex = Object.keys(OverviewRangeTypes).findIndex((view) => view === selectedView);

  const overviewPresetChange = useDateStore((state) => state.overviewPresetChange);
  const handlePresetSelection = (value: OverviewDatePresetKey) => {
    overviewPresetChange({ view: value });
    setDatePreset(value, 'line', true);
    navigateToQuery((search) => ({ ...search, view: value }), false);
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
