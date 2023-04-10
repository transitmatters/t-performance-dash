import classNames from 'classnames';
import React from 'react';
import {
  lineColorBackground,
  buttonHighlightFocus,
  lineColorDarkBorder,
} from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: React.ReactNode;
  isFullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isFullWidth = false, ...props }) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex items-center self-stretch rounded-md border px-3 py-1 text-sm font-medium text-white  text-opacity-90 shadow-sm hover:bg-opacity-70  focus:outline-none focus:ring-2  focus:ring-offset-2',
        line && buttonHighlightFocus[line],
        line && lineColorBackground[line],
        line && lineColorDarkBorder[line],
        isFullWidth ? 'w-auto' : 'w-fit'
      )}
      {...props}
    >
      {children}
    </button>
  );
};
