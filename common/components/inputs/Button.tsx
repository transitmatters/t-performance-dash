import classNames from 'classnames';
import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { buttonHighlightFocus } from '../../styles/general';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: React.ReactNode;
  isFullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, isFullWidth = false, ...props }) => {
  const route = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-normal leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2',
        route.line && buttonHighlightFocus[route.line],
        isFullWidth ? 'w-auto' : 'w-fit'
      )}
      {...props}
    >
      {children}
    </button>
  );
};
