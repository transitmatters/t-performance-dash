import type { ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useBetaNoticeStore } from '../../state/betaNoticeStore';
import { BETA_FEEDBACK_URL, isBetaHost } from '../../utils/constants';
import { Notice } from './Notice';

const BETA_RUM_TEXT =
  'This is our internal beta. It collects extra usage and performance data with Datadog to help us find bugs. The public dashboard doesn’t.';

const DismissibleNotice = ({
  onDismiss,
  children,
}: {
  onDismiss: () => void;
  children: ReactNode;
}) => (
  <Notice className="shadow-lg">
    <div className="flex items-start gap-2">
      <p className="flex-1">{children}</p>
      <Button variant="ghost" size="icon-sm" onClick={onDismiss}>
        <XIcon />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  </Notice>
);

/** One notice, not a stack: two cards at the bottom of the screen covered the homepage chart. */
export const BetaNotices = () => {
  const { rumNoticeDismissed, feedbackNoticeDismissed, dismissRumNotice, dismissFeedbackNotice } =
    useBetaNoticeStore();

  if (!isBetaHost() || (rumNoticeDismissed && feedbackNoticeDismissed)) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl">
      <DismissibleNotice
        onDismiss={() => {
          dismissRumNotice();
          dismissFeedbackNotice();
        }}
      >
        {!rumNoticeDismissed && `${BETA_RUM_TEXT} `}
        {!feedbackNoticeDismissed && (
          <>
            Found a bug or have an idea?{' '}
            <a href={BETA_FEEDBACK_URL} target="_blank" rel="noreferrer">
              {/* The global `a` reset beats Tailwind's underline on the anchor itself. */}
              <span className="underline underline-offset-2">Share feedback</span>
            </a>
          </>
        )}
      </DismissibleNotice>
    </div>
  );
};
