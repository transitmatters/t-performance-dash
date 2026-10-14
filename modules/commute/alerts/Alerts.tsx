import React from 'react';
import classNames from 'classnames';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { lineColorBackground } from '../../../common/styles/general';
import { Divider } from '../../../common/components/general/Divider';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import type { AlertsResponse } from '../../../common/types/alerts';
import { AlertBox } from './AlertBox';

interface AlertsProps {
  title: string;
  alerts: UseQueryResult<AlertsResponse[]>;
}

export const Alerts: React.FC<AlertsProps> = ({ title, alerts }) => {
  const { t } = useTranslation('commute');
  const {
    line,
    lineShort,
    query: { busRoute },
  } = useDelimitatedRoute();

  const divStyle = classNames(
    'ring-foreground/10 flex w-full flex-col gap-y-2 rounded-xl py-3 text-white ring-1 sm:py-4 md:max-h-[309px] md:overflow-y-auto',
    lineColorBackground[line ?? 'DEFAULT']
  );

  const alertsReady = !alerts.isError && !alerts.isLoading && line && lineShort;

  if (!alertsReady) {
    return (
      <div className={divStyle}>
        <h3 className="w-full px-4 text-2xl md:w-auto">{t('title')}</h3>
        <ChartPlaceHolder query={alerts} isInverse />
      </div>
    );
  }
  return (
    <div className={divStyle}>
      <h3 className="w-full px-4 text-2xl md:w-auto">{title}</h3>
      <div className="flex w-full flex-row gap-x-4 overflow-x-auto px-4 md:flex-col md:gap-x-0 md:overflow-x-auto">
        <div className="md:w-full">
          <Divider title={t('today')} line={line} />

          <AlertBox
            alerts={alerts.data || []}
            lineShort={lineShort}
            busRoute={busRoute}
            type={'current'}
          />
        </div>
        <div className="md:mt-2 md:flex md:w-full md:flex-col">
          <Divider title={t('upcoming')} line={line} />

          <AlertBox
            alerts={alerts.data || []}
            lineShort={lineShort}
            busRoute={busRoute}
            type={'upcoming'}
          />
        </div>
      </div>
    </div>
  );
};
