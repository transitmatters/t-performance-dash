import classNames from 'classnames';
import React, { useState } from 'react';
import { lineColorBackground } from '../../../common/styles/general';
import type { Line } from '../../../common/types/lines';
import { lightLineBorder } from './styles/AlertStyles';

interface AlertBoxInnerProps {
  header: string;
  Icon: any;
  line?: Line;
  children?: React.ReactNode;
}

export const AlertBoxInner: React.FC<AlertBoxInnerProps> = ({ header, Icon, line, children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => {
        setExpanded(!expanded);
      }}
      className={classNames(
        'flex w-full cursor-pointer flex-col gap-y-2 rounded-2xl border py-1 pl-1 pr-4 shadow-simple',
        lightLineBorder[line ?? 'DEFAULT'],
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      <div className="flex w-full flex-row items-center">
        {Icon}
        {children}
      </div>
      {expanded && (
        <div className="p-4">
          <p>{header}</p>
        </div>
      )}
    </div>
  );
};
