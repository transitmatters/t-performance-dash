import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import licenses from '../common/constants/licenses/licenseInfos.json';
import { Accordion } from '../common/components/accordion/Accordion';
import { Layout } from '../common/layouts/layoutTypes';

function OpenSource() {
  const { t } = useTranslation();
  const licensesDisplays = Object.entries(licenses)
    .map(([library, license]) => {
      if (license.licenseText.length > 1) {
        return {
          title: library,
          content: <p className={'text-xs whitespace-pre-line'}>{license.licenseText}</p>,
        };
      }
    })
    .filter((entry) => entry !== undefined) as {
    title: string;
    content: string | React.ReactNode;
  }[];

  return (
    <div className="w-full">
      <title>{t('openSource.documentTitle')}</title>
      <Accordion contentList={licensesDisplays} />
    </div>
  );
}

export const Route = createFileRoute('/opensource')({
  staticData: { layout: Layout.Landing },
  component: OpenSource,
});
