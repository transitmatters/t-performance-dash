import classNames from 'classnames';
import React from 'react';
import { lineColorBackground, lineColorDarkBorder } from '../../styles/general';
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

export const DatePickerButton: React.FC<ButtonProps> = ({
  children,
  isFullWidth = false,
  ...props
}) => {
  const { line } = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex  items-center self-stretch border-l bg-black bg-opacity-10 px-3 py-1 text-sm font-medium text-white text-opacity-90 shadow-sm  hover:bg-opacity-5 focus:outline-none focus:ring-2  focus:ring-offset-2',
        line && buttonHighlightConfig[line],
        lineColorDarkBorder[line ?? 'DEFAULT'],
        isFullWidth ? 'w-auto' : 'w-fit'
      )}
      {...props}
    >
      {children}
    </button>
  );
};
