import React from 'react';
import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../i18n';
import { Button } from '../ui/button';
import { useBetaNoticeStore } from '../../state/betaNoticeStore';
import { isBetaHost } from '../../utils/constants';
import { Notice } from './Notice';

export const BETA_RUM_TEXT = i18n.t('notices.betaRum.text');

export const BetaRumNotice: React.FC = () => {
  const { t } = useTranslation();
  const { rumNoticeDismissed, dismissRumNotice } = useBetaNoticeStore();

  if (!isBetaHost() || rumNoticeDismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl">
      <Notice className="shadow-lg">
        <div className="flex items-start gap-2">
          <p className="flex-1">{BETA_RUM_TEXT}</p>
          <Button variant="ghost" size="icon-sm" onClick={dismissRumNotice}>
            <XIcon />
            <span className="sr-only">{t('notices.dismiss')}</span>
          </Button>
        </div>
      </Notice>
    </div>
  );
};
