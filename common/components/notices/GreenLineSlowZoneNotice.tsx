import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../utils/router';
import { Notice } from './Notice';

export const GreenLineSlowZoneNotice: React.FC = () => {
  const { t } = useTranslation();
  const { line } = useDelimitatedRoute();

  if (line !== 'line-green') {
    return null;
  }

  return (
    <Notice variant="warning" title={t('notices.greenLineSlowZones.title')}>
      <p>
        <Trans
          t={t}
          i18nKey="notices.greenLineSlowZones.body"
          components={{
            gradeSeparated: <a href="https://en.wikipedia.org/wiki/Grade_separation" />,
          }}
        />
      </p>
    </Notice>
  );
};
