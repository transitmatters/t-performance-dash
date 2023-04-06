import React, { useState } from 'react';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { DataPageTabs } from '../navigation/desktop/DataPageTabs';
import { DateSelection } from '../../common/components/inputs/DateSelection/DateSelection';

export const DataPageHeader = () => {
  const isDesktop = useBreakpoint('md');

  const {
    line,
    datapage,
    query: { endDate },
  } = useDelimitatedRoute();
  const [range, setRange] = useState<boolean>(endDate !== undefined);

  React.useEffect(() => {
    if (!range && endDate !== undefined) {
      setRange(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  return (
    <div className="relative border-b border-gray-200 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-2xl font-medium leading-6 text-gray-900 md:text-xl">
          {line && LINE_OBJECTS[line]?.name}
        </h3>
        {isDesktop && datapage !== 'overview' && (
          <div className="absolute right-0 top-1 mt-0">
            <DateSelection range />
          </div>
        )}
      </div>
      <DataPageTabs />
    </div>
  );
};
