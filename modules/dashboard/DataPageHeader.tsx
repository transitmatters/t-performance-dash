import React, { useState } from 'react';
import classNames from 'classnames';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { DataPageTabs } from '../navigation/desktop/DataPageTabs';
import { DateSelection } from '../../common/components/inputs/DateSelection/DateSelection';
import { StationSelectorWidget } from '../../common/components/widgets/StationSelectorWidget';
import { optionsStation } from '../../common/utils/stations';
import { lineColorBackground } from '../../common/styles/general';

export const DataPageHeader = () => {
  const isDesktop = useBreakpoint('md');

  const {
    line,
    lineShort,
    datapage,
    query: { endDate },
  } = useDelimitatedRoute();
  const [range, setRange] = useState<boolean>(endDate !== undefined);

  const stations = optionsStation(lineShort);

  const toStation = stations?.[stations.length - 2];
  const fromStation = stations?.[3];

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
          <div
            className={classNames(
              'absolute right-0 top-1 mt-0 flex max-w-sm flex-col gap-y-2 rounded-lg bg-opacity-20 p-2',
              lineColorBackground[line ?? 'DEFAULT']
            )}
          >
            <DateSelection />
            {fromStation && toStation && (
              <StationSelectorWidget
                toStation={toStation}
                fromStation={fromStation}
                setToStation={() => null}
                setFromStation={() => null}
              />
            )}
          </div>
        )}
      </div>
      <DataPageTabs />
    </div>
  );
};
