import React from 'react';

import licenses from '../common/constants/licenses/licenseInfos.json';
import { Accordion } from '../common/components/accordion/Accordion';

export default function OpenSource() {
  const licensesDisplays = Object.entries(licenses)
    .map(([library, license]) => {
      if (license.licenseText.length > 1) {
        return {
          title: library,
          content: <p className={'whitespace-pre-line text-xs'}>{license.licenseText}</p>,
        };
      }
    })
    .filter((entry) => entry !== undefined) as {
    title: string;
    content: string | React.ReactNode;
  }[];

  return (
    <div className="w-full">
      <Accordion contentList={licensesDisplays} />
    </div>
  );
}
