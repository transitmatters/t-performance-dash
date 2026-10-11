import React from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useBetaNoticeStore } from '../../state/betaNoticeStore';
import { isBetaHost } from '../../utils/constants';
import { Notice } from './Notice';

export const BETA_RUM_TEXT =
  'This is our internal beta. It collects extra usage and performance data with Datadog to help us find bugs. The public dashboard doesn’t.';

export const BetaRumNotice: React.FC = () => {
  const { rumNoticeDismissed, dismissRumNotice } = useBetaNoticeStore();

  if (!isBetaHost() || rumNoticeDismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl">
      <Notice className="shadow-lg">
        <div className="flex items-start gap-2">
          <p className="flex-1">{BETA_RUM_TEXT}</p>
          <Button variant="ghost" size="icon-sm" onClick={dismissRumNotice}>
            <XIcon />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </Notice>
    </div>
  );
};
