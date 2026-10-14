import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { AlertBoxInner } from './AlertBoxInner';

interface StopClosureProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
}

export const StopClosure: React.FC<StopClosureProps> = ({ alert, type }) => {
  const { t } = useTranslation('commute');
  return (
    <AlertBoxInner
      header={alert.header}
      Icon={() => <p className={classNames('m-0.5 pr-2 pl-2 text-4xl')}>🚧</p>}
      alert={alert}
      type={type}
    >
      <p className="mr-1">{t('stopClosures')}</p>
    </AlertBoxInner>
  );
};
