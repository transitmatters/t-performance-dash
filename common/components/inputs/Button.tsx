import classNames from 'classnames';
import React from 'react';
import { LINE_COLORS_DARK } from '../../constants/colors';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
  lineColorVar,
} from '../../styles/general';
import { readableOn } from '../../utils/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonProps extends React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  children: React.ReactNode;
  additionalClasses?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, additionalClasses, ...props }) => {
  const { line } = useDelimitatedRoute();
  // The button's background is the line's dark shade, not its base color, so contrast has to be
  // checked against that: white text fails badly on orange/bus, whose "dark" shades are only a
  // touch darker than the base color.
  const needsDarkText = readableOn(LINE_COLORS_DARK[line ?? 'default']) === 'dark';

  return (
    <button
      type="button"
      style={lineColorVar(line)}
      className={classNames(
        'flex items-center self-stretch rounded-md border px-3 py-1 text-sm font-medium shadow-xs hover:bg-(--line-color-dark)/70 focus:bg-transparent focus:ring-2 focus:outline-hidden',
        needsDarkText ? 'text-stone-900' : 'text-white/90',
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
