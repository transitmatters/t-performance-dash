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
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex items-center self-stretch rounded-md px-3 py-1 text-sm font-medium text-white  text-opacity-90 shadow-sm hover:bg-opacity-70  focus:outline-none focus:ring-2  focus:ring-offset-2',
        line && buttonHighlightConfig[line],
        line && lineColorBackground[line]
      )}
      {...props}
    >
      {children}
    </button>
  );
};
