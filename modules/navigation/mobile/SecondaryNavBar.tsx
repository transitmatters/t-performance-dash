import React, { useState } from 'react';
import { Dropdown } from '../../../common/components/dropdowns/Dropdown';
import Device from '../../../common/components/general/Device/Device';
import { Button } from '../../../common/components/inputs/Button';
import { NativeDateInput } from '../../../common/components/inputs/NativeDateInput';
import { DateSelector } from '../../../common/components/inputs/DateSelector';
import { useDelimitatedRoute } from '../../../common/utils/router';

const visualizationOptions = [
  { name: 'Map', id: 1 },
  { name: 'Segments', id: 2 },
  { name: 'Totals', id: 3 },
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
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white">
        <Device>
          {({ isMobile }) => {
            if (isMobile) {
              return <NativeDateInput range={range} />;
            }
            return <DateSelector range={range} />;
          }}
        </Device>
        <Button text={range ? '🅧' : 'Range'} onClick={() => setRange(!range)} />
        <Dropdown
          options={visualizationOptions}
          setSelectedValue={() => null}
          selectedValue={visualizationOptions[0]}
        />
      </div>
    </div>
  );
};
