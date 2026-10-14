import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../../common/i18n';
import type { ModeKind, SummaryData } from '../types';

import { Widget } from '../../../common/components/widgets/Widget';
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
  total: i18n.t('serviceAndRidership:summary.selection.total'),
  'rapid-transit': i18n.t('serviceAndRidership:summary.selection.rapidTransit'),
  'regional-rail': i18n.t('serviceAndRidership:summary.selection.regionalRail'),
  bus: i18n.t('serviceAndRidership:summary.selection.bus'),
};

const colorsBySelection: Partial<Record<Selection, string>> = {
  total: DEFAULT_COLOR,
  'rapid-transit': CHART_COLORS.BLUE,
  'regional-rail': COLORS.mbta.commuterRail,
  bus: COLORS.mbta.bus,
};

export const SummaryCard = (props: Props) => {
  const { t } = useTranslation('serviceAndRidership');
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
    <Widget title={t('summary.title')} className="pb-16">
      <div className="pt-2 pb-1">
        <ButtonGroup
          options={Object.entries(SelectionLabels).map(([key, value]) => [key, value])}
          pressFunction={setSelection}
          selectedIndex={Object.keys(SelectionLabels).findIndex((key) => key === selection)}
        />
      </div>
      <ServiceRidershipChart
        color={colorsBySelection[selection] ?? DEFAULT_COLOR}
        lineTitle={t('summary.total')}
        lineId="total"
        serviceHistory={serviceHistory}
        ridershipHistory={ridershipHistory}
        startDate={startDate}
        endDate={endDate}
      />
    </Widget>
  );
};
