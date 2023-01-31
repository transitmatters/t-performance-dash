import classNames from 'classnames';
import React from 'react';
import { useDelimitatedRoute } from '../utils/router';
import { lineButtonSelectConfig } from './inputStyle';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  text: string;
}

export const Button: React.FC<ButtonProps> = ({ text, ...props }) => {
  const route = useDelimitatedRoute();

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
        lineButtonSelectConfig[route.line]
      )}
      {...props}
    >
      {text}
    </button>
  );
};
