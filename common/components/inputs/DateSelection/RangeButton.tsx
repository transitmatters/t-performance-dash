import classNames from 'classnames';
import React from 'react';
import { buttonHighlightFocus, lineColorDarkBorder } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';

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
      title="Range"
      className={classNames(
        'bg-opacity-50 text-opacity-90 hover:bg-opacity-100 focus:bg-opacity-100 inline-flex items-center self-stretch border-l bg-white px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none',
        line && buttonHighlightFocus[line],
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
      {...props}
    >
      {children}
    </button>
  );
};
