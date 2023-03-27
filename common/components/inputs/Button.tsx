import classNames from 'classnames';
import React from 'react';
import { lineColorBackground } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';
import { buttonHighlightConfig } from './styles/inputStyle';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: string | React.ReactNode;
  isFullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isFullWidth = false, ...props }) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex  items-center  self-stretch  rounded-sm px-3 py-1 text-sm font-medium text-white text-opacity-90 shadow-sm hover:bg-opacity-70  focus:outline-none focus:ring-2  focus:ring-offset-2',
        line && buttonHighlightConfig[line],
        line && lineColorBackground[line],
        isFullWidth ? 'w-auto' : 'w-fit'
      )}
      {...props}
    >
      {children}
    </button>
  );
};
