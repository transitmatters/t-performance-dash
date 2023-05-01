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
        'flex items-center self-stretch rounded-md border px-3 py-1 text-sm font-medium text-white  text-opacity-90 shadow-sm hover:bg-opacity-70  focus:outline-none focus:ring-2  focus:ring-offset-2',
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
