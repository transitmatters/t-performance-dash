import { useState, useMemo } from 'react';
import type { ModeKind, SummaryData } from '../types';

import { Widget } from '../../../common/components/widgets/Widget';
import { ServiceRidershipChart } from '../LineCard/ServiceRidershipChart';
import { useDateRange } from '../../../common/hooks/usePageParams';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { CHART_COLORS, COLORS } from '../../../common/constants/colors';

type Props = {
  summaryData: SummaryData;
  modeData: Partial<Record<ModeKind, SummaryData>>;
};

type Selection = 'total' | ModeKind;

const DEFAULT_COLOR = '#165c96';

const SELECTION_OPTIONS: [Selection, string][] = [
  ['total', 'All Lines'],
  ['rapid-transit', 'Rapid Transit'],
  ['regional-rail', 'Regional Rail'],
  ['bus', 'Bus'],
];

const colorsBySelection: Partial<Record<Selection, string>> = {
  total: DEFAULT_COLOR,
  'rapid-transit': CHART_COLORS.BLUE,
  'regional-rail': COLORS.mbta.commuterRail,
  bus: COLORS.mbta.bus,
};

export const SummaryCard = (props: Props) => {
  const { summaryData, modeData } = props;
  const [selection, setSelection] = useState<Selection>('total');
  const { startDate, endDate } = useDateRange();

  const { serviceHistory, ridershipHistory } = useMemo(() => {
    if (selection === 'total') {
      return {
        serviceHistory: summaryData.totalServiceHistory ?? {},
        ridershipHistory: summaryData.totalRidershipHistory ?? {},
      };
    }
    const selectedModeData = modeData[selection];
    return {
      serviceHistory: selectedModeData?.totalServiceHistory ?? {},
      ridershipHistory: selectedModeData?.totalRidershipHistory ?? {},
    };
  }, [selection, summaryData, modeData]);

  return (
    <Widget title="Summary" className="pb-16">
      <div className="pt-2 pb-1">
        <ButtonGroup
          options={SELECTION_OPTIONS}
          pressFunction={setSelection}
          selectedIndex={SELECTION_OPTIONS.findIndex(([key]) => key === selection)}
        />
      </div>
      <ServiceRidershipChart
        color={colorsBySelection[selection] ?? DEFAULT_COLOR}
        lineId="total"
        serviceHistory={serviceHistory}
        ridershipHistory={ridershipHistory}
        startDate={startDate}
        endDate={endDate}
      />
    </Widget>
  );
};
