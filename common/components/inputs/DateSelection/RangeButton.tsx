import classNames from 'classnames';
import React from 'react';
import { lineColorDarkBorder } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';
import { buttonHighlightConfig } from '../styles/inputStyle';

interface RangeButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: string | React.ReactNode;
}

export const RangeButton: React.FC<RangeButtonProps> = ({ children, ...props }) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex  items-center self-stretch border-l bg-black bg-opacity-10 px-3 py-1 text-sm font-medium text-white text-opacity-90 shadow-sm  hover:bg-opacity-5 focus:bg-opacity-0 focus:outline-none ',
        line && buttonHighlightConfig[line],
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
      {...props}
    >
      {children}
    </button>
  );
};