import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { ErrorNotice } from '../../common/components/notices/ErrorNotice';

/**
 * The trips charts render straight into the page rather than through `Widget`, so until now a throw
 * anywhere in the chart tree — a malformed API response, a Chart.js failure — unmounted the whole
 * route and left a blank screen. One failing chart should cost one card, not the page.
 */
export const TripGraphsBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallbackRender={() => (
      <WidgetDiv>
        <div className="flex h-60 items-center justify-center">
          <ErrorNotice />
        </div>
      </WidgetDiv>
    )}
  >
    {children}
  </ErrorBoundary>
);
