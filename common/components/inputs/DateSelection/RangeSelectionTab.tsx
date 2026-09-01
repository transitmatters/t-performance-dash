import React from 'react';
import classNames from 'classnames';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { lineColorVar } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';
import { RANGE_OPTIONS } from '../../../constants/dates';
import { LINE_COLORS } from '../../../constants/colors';
import { readableOn } from '../../../utils/general';

interface RangeSelectionTabProps {
  range: boolean;
  setRange: (range: boolean) => void;
}

export const RangeSelectionTab: React.FC<RangeSelectionTabProps> = ({ range, setRange }) => {
  const { line } = useDelimitatedRoute();
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  return (
    <Tabs
      value={RANGE_OPTIONS[range ? 1 : 0]}
      onValueChange={(value) => setRange(value === RANGE_OPTIONS[1])}
      style={lineColorVar(line)}
      className="w-full"
    >
      <TabsList className="w-full rounded-b-none">
        {RANGE_OPTIONS.map((option) => (
          <TabsTrigger
            key={option}
            value={option}
            className={classNames(
              'w-1/2 text-sm',
              needsDarkText
                ? 'data-[state=active]:text-stone-900'
                : 'data-[state=active]:text-white'
            )}
          >
            {option}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
