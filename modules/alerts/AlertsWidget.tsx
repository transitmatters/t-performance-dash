import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibilityAlertsData, useAlertsData } from '../../common/api/hooks/alerts';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { LineShort } from '../../common/types/lines';
import { Alerts } from '../commute/alerts/Alerts';

export const AlertsWidget = ({ lineShort }: { lineShort: LineShort }) => {
  const { t } = useTranslation('alerts');
  const {
    query: { busRoute },
  } = useDelimitatedRoute();
  const rideAlerts = useAlertsData(lineShort, busRoute);
  const accessibilityAlerts = useAccessibilityAlertsData(lineShort);

  return (
    <>
      <Alerts title={t('alerts')} alerts={rideAlerts} />
      <Alerts title={t('accessibility')} alerts={accessibilityAlerts} />
    </>
  );
};
