import React, { useState } from 'react';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { Button } from '../../common/components/inputs/Button';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { DataPageTabs } from '../navigation/desktop/DataPageTabs';
import { DateSelector } from '../../common/components/inputs/DateSelector';

export const DataPageHeader = () => {
  const isDesktop = useBreakpoint('lg');

  const { line } = useDelimitatedRoute();
  const [range, setRange] = useState<boolean>(false);

  return (
    <div className="relative border-b border-gray-200 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-2xl font-medium leading-6 text-gray-900 md:text-xl">
          {line && LINE_OBJECTS[line]?.name}
        </h3>
        <div className="mt-3 flex md:absolute md:top-3 md:right-0 md:mt-0">
          {isDesktop && (
            <div className="mt-4 flex flex-row gap-x-2 md:mt-0 md:ml-4">
              <DateSelector range={range} />
              <Button text={range ? '🅧' : 'Range'} onClick={() => setRange(!range)} />
            </div>
          )}
        </div>
      </div>
      <DataPageTabs />
    </div>
  );
};
