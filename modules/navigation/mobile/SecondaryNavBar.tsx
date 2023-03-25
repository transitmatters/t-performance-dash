import React, { useState } from 'react';
import { Dropdown } from '../../../common/components/dropdowns/Dropdown';
import Device from '../../../common/components/general/Device/Device';
import { Button } from '../../../common/components/inputs/Button';
import { NativeDateInput } from '../../../common/components/inputs/NativeDateInput';
import { DateSelector } from '../../../common/components/inputs/DateSelector';
import { useDelimitatedRoute } from '../../../common/utils/router';
import type { SelectOption } from '../../../common/types/inputs';

const visualizationOptions: SelectOption[] = [
  { label: 'Map', id: 1, value: 'Map' },
  { label: 'Segments', id: 2, value: 'Segments' },
  { label: 'Totals', id: 3, value: 'Totals' },
];

export const SecondaryNavBar: React.FC = () => {
  const {
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
    <div className="pb-safe fixed bottom-11 z-20 w-full border border-gray-300 bg-white px-2">
      <div className="my-1 flex w-full flex-row items-center gap-x-2 bg-white">
        <Device>
          {({ isMobile }) => {
            if (isMobile) {
              return <NativeDateInput range={range} />;
            }
            return <DateSelector range={range} />;
          }}
        </Device>
        <Button onClick={() => setRange(!range)}> {range ? '🅧' : 'Range'}</Button>
        <Dropdown
          options={visualizationOptions}
          setValue={() => null}
          value={visualizationOptions[0]}
        />
      </div>
    </div>
  );
};
