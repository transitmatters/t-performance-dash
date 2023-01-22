import React, { useState } from 'react';
import { Section, SECTION_ITEMS } from '../../constants/sections';
import { classNames } from '../utils/tailwind';
import styles from './DataPageSelection.module.css';

interface DataPageSelectionProps {
  selectedSection: Section;
}

const DataPageSelectionItem = ({
  dataPage,
  index,
  setCurrentItem,
  scrollDirection,
  setScrollDirection,
  currentIndices,
}) => {
  // This if-statement block is all for the sliding animation. Probably could be improved.
  let position = styles['SSI-Invisible'];
  const nonCenterStyle = 'text-design-subtitleGrey text-sm w-11';
  let scrollDirectionOnClick = 0;
  if (index === currentIndices[0]) {
    position = `${nonCenterStyle} ${scrollDirection > 0 ? styles['SSI-Off-From-Left'] : 'hidden'}`;
  } else if (index === currentIndices[1]) {
    position = `${nonCenterStyle} ${
      scrollDirection > 0 ? styles['SSI-Left-From-Center'] : styles['SSI-Left-From-Off']
    }`;
    scrollDirectionOnClick = -1;
  } else if (index === currentIndices[2]) {
    position = `SSI-Center text-base w-24 ${
      scrollDirection > 0 ? styles['SSI-Center-From-Right'] : styles['SSI-Center-From-Left']
    }`;
  } else if (index === currentIndices[3]) {
    position = `${nonCenterStyle} ${
      scrollDirection > 0 ? styles['SSI-Right-From-Off'] : styles['SSI-Right-From-Center']
    }`;
    scrollDirectionOnClick = 1;
  } else if (index === currentIndices[4]) {
    position = `${nonCenterStyle} ${scrollDirection > 0 ? 'hidden' : styles['SSI-Off-From-Right']}`;
  } else {
    position = 'hidden';
  }

  return (
    <div
      className={classNames('absolute flex cursor-pointer items-center justify-center', position)}
      onClick={() => {
        setCurrentItem(index);
        setScrollDirection(scrollDirectionOnClick);
      }}
    >
      <p className="select-none truncate whitespace-nowrap text-center">{dataPage}</p>
    </div>
  );
};

export const DataPageSelection: React.FC<DataPageSelectionProps> = ({ selectedSection }) => {
  const [scrollDirection, setScrollDirection] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const dataPageListLength = SECTION_ITEMS[selectedSection].length;
  const offsets = [-2, -1, 0, 1, 2];
  const currentIndices = offsets.map(
    (num) => (num + currentItem + dataPageListLength) % dataPageListLength
  );

  return (
    <div className="border-1 flex h-8 w-52 items-center justify-center overflow-hidden rounded-md border border-black shadow-simpleInset">
      {SECTION_ITEMS[selectedSection].map((statItem: string, index: number) => {
        return (
          <DataPageSelectionItem
            key={statItem}
            dataPage={statItem}
            index={index}
            setCurrentItem={setCurrentItem}
            setScrollDirection={setScrollDirection}
            scrollDirection={scrollDirection}
            currentIndices={currentIndices}
          />
        );
      })}
    </div>
  );
};
