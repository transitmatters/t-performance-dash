import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '../general/Link';
import { useDelimitatedRoute } from '../../utils/router';

/**
 * The single Commuter Rail data caveat: beta status, how the data is collected,
 * and its known gaps. Renders as plain prose for embedding inside the
 * "About this data" accordion (see TripDataNotes).
 */
export const BetaDataNotice: React.FC = () => {
  const { t } = useTranslation();
  const { line, linePath } = useDelimitatedRoute();

  if (line !== 'line-commuter-rail' && linePath !== 'commuter-rail') {
    return null;
  }

  return (
    <>
      <p className="font-medium text-foreground">{t('notices.betaData.title')}</p>
      <p>
        <Trans
          t={t}
          i18nKey="notices.betaData.collection"
          components={{
            v3Api: (
              <Link
                href="https://www.mbta.com/developers/v3-api/streaming"
                rel="noopener noreferrer"
                target="_blank"
              />
            ),
            github: (
              <Link
                href="https://github.com/transitmatters/gobble"
                rel="noopener noreferrer"
                target="_blank"
              />
            ),
          }}
        />
      </p>
      <p>{t('notices.betaData.benchmarks')}</p>
    </>
  );
};
