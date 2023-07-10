import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { Line } from '../../common/types/lines';
import { lineColorBackground, lineColorBorder } from '../../common/styles/general';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
interface LineButtonProps {
  children: React.ReactNode;
  line: Line;
}

export const LineButton: React.FC<LineButtonProps> = ({ children, line }) => {
  const lineObject = LINE_OBJECTS[line];
  const lgBreakpoint = useBreakpoint('lg');

  return (
    <Link
      href={`/${lineObject.path}`}
      className="group flex cursor-pointer flex-row items-center gap-x-8 md:flex-col"
    >
      <div
        className={classNames(
          lineColorBorder[line],
          lineColorBackground[line],
          lgBreakpoint ? 'h-32 w-32' : 'h-24 w-24',
          'flex cursor-pointer items-center justify-center rounded-full border-2 bg-opacity-50 group-hover:bg-opacity-100'
        )}
      >
        {children}
      </div>
      <div className="flex flex-row items-baseline gap-2 md:flex-col md:items-center">
        <h3 className="text-center text-3xl font-thin md:text-xl">{LINE_OBJECTS[line].name}</h3>
        {(line === 'line-green' || line === 'line-bus') && (
          <p className="text-center font-bold">(WIP)</p>
        )}
      </div>
    </Link>
  );
};
