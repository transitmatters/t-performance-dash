import classNames from 'classnames';
import React from 'react';
import { lineColorBackground } from '../../styles/general';
import type { Line } from '../../types/lines';

interface DividerProps {
  title: string;
  line?: Line;
}

export const Divider: React.FC<DividerProps> = ({ title, line }) => {
  return (
    <div className="relative mb-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex sm:justify-start md:justify-center">
        <span
          className={classNames(
            lineColorBackground[line ?? 'DEFAULT'],
            'pr-3 text-base leading-6 font-semibold text-white md:px-3'
          )}
        >
          {title}
        </span>
      </div>
    </div>
  );
};
