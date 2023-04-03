import React, { useState } from 'react';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { ALL_PAGES } from '../../common/constants/datapages';
import { lineColorText } from '../../common/styles/general';

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
        <h3 className="select-none text-4xl font-medium leading-6 text-stone-900 md:text-2xl">
          <span className={lineColorText[line ?? 'DEFAULT']}>
            {line && LINE_OBJECTS[line]?.name}
          </span>
          <span> - {ALL_PAGES[datapage]?.name}</span>
        </h3>
      </div>
    </div>
  );
};
