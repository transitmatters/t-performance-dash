import classNames from 'classnames';
import React from 'react';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
} from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: React.ReactNode;
  additionalClasses?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, additionalClasses, ...props }) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'text-opacity-90 hover:bg-opacity-70 focus:bg-opacity-0 flex items-center self-stretch rounded-md border px-3 py-1 text-sm font-medium text-white shadow-sm focus:outline-none',
        line && buttonHighlightFocus[line],
        line && lineColorDarkBackground[line],
        line && lineColorLightBorder[line],
        additionalClasses
      )}
      {...props}
    >
      {children}
    </button>
  );
};
