import React from 'react';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import { lineColorBackground, lineColorBorder, lineColorText } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';
import { RANGE_OPTIONS } from '../../../constants/dates';

interface RangeSelectionTabProps {
  range: boolean;
  setRange: (range: boolean) => void;
}

export const RangeSelectionTab: React.FC<RangeSelectionTabProps> = ({ range, setRange }) => {
  const { line } = useDelimitatedRoute();
  return (
    <Tab.Group
      onChange={(value) => {
        setRange(Boolean(value));
      }}
      selectedIndex={range ? 1 : 0}
    >
      <Tab.List className="flex w-full flex-row justify-center">
        {RANGE_OPTIONS.map((option, index) => (
          <Tab key={index} className="w-1/2 items-center shadow-sm">
            {({ selected }) => (
              <div
                className={classNames(
                  lineColorBackground[line ?? 'DEFAULT'],
                  selected
                    ? 'bg-opacity-100 text-white text-opacity-90'
                    : `bg-opacity-0 ${lineColorText[line ?? 'DEFAULT']}`,
                  'border py-2 text-sm',
                  index === 0 ? 'rounded-tl-lg' : 'rounded-tr-lg',
                  lineColorBorder[line ?? 'DEFAULT']
                )}
              >
                <p>{option}</p>
              </div>
            )}
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
};
