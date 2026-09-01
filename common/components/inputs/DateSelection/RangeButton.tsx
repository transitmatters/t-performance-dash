import classNames from 'classnames';
import React from 'react';
import { buttonHighlightFocus, lineColorDarkBorder } from '../../../styles/general';
import { useDelimitatedRoute } from '../../../utils/router';

interface RangeButtonProps extends React.DetailedHTMLProps<
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
        'inline-flex items-center self-stretch border-l bg-white/50 px-3 py-1 text-sm font-medium text-white/90 shadow-xs hover:bg-white focus:bg-white focus:outline-hidden',
        line && buttonHighlightFocus[line],
        lineColorDarkBorder[line ?? 'DEFAULT']
      )}
      {...props}
    >
      {children}
    </button>
  );
};
