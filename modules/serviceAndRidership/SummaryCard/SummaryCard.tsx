import React, { useState, useMemo } from 'react';
import type { ModeKind, SummaryData } from '../types';

import { CardFrame } from '../CardFrame';
import { ServiceRidershipChart } from '../LineCard/ServiceRidershipChart';
import { useServiceAndRidershipContext } from '../useServiceAndRidershipContext';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { CHART_COLORS, COLORS } from '../../../common/constants/colors';

type Props = {
  summaryData: SummaryData;
  modeData: Record<ModeKind, SummaryData>;
};

type Selection = 'total' | ModeKind;

const DEFAULT_COLOR = '#165c96';

const SelectionLabels: Partial<Record<Selection, string>> = {
  total: 'All Lines',
  'rapid-transit': 'Rapid Transit',
  'regional-rail': 'Regional Rail',
  bus: 'Bus',
};

const colorsBySelection: Partial<Record<Selection, string>> = {
  total: DEFAULT_COLOR,
  'rapid-transit': CHART_COLORS.BLUE,
  'regional-rail': COLORS.mbta.commuterRail,
  bus: COLORS.mbta.bus,
};

export const SummaryCard = (props: Props) => {
  const { summaryData, modeData } = props;
  const [selection, setSelection] = useState<Selection>('total');
  const { startDate, endDate } = useServiceAndRidershipContext();

  const { serviceHistory, ridershipHistory } = useMemo(() => {
    if (selection === 'total') {
      return {
        serviceHistory: summaryData.totalServiceHistory ?? {},
        ridershipHistory: summaryData.totalRidershipHistory ?? {},
      };
    }
    const selectedModeData = modeData[selection];
    return {
      serviceHistory: selectedModeData.totalServiceHistory ?? {},
      ridershipHistory: selectedModeData.totalRidershipHistory ?? {},
    };
  }, [selection, summaryData, modeData]);

  return (
    <CardFrame title="Summary">
      <div className="pb-1 pt-2">
        <ButtonGroup
          options={Object.entries(SelectionLabels).map(([key, value]) => [key, value])}
          pressFunction={setSelection}
          selectedIndex={Object.keys(SelectionLabels).findIndex((key) => key === selection)}
        />
      </div>
      <ServiceRidershipChart
        color={colorsBySelection[selection] ?? DEFAULT_COLOR}
        lineTitle="Total"
        lineId="total"
        serviceHistory={serviceHistory}
        ridershipHistory={ridershipHistory}
        startDate={startDate}
        endDate={endDate}
      />
    </CardFrame>
  );
};
