import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';
import { LINE_COLORS_DARK } from '../../constants/colors';
import {
  buttonHighlightFocus,
  lineColorDarkBackground,
  lineColorLightBorder,
  lineColorVar,
} from '../../styles/general';
import { readableOn } from '../../utils/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonProps extends DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  children: ReactNode;
  additionalClasses?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, additionalClasses, ...props },
  ref
) {
  const { line } = useDelimitatedRoute();
  // The button's background is the line's dark shade, not its base color, so contrast has to be
  // checked against that: white text fails badly on orange/bus, whose "dark" shades are only a
  // touch darker than the base color.
  const needsDarkText = readableOn(LINE_COLORS_DARK[line ?? 'default']) === 'dark';

  return (
    <button
      ref={ref}
      type="button"
      style={lineColorVar(line)}
      className={classNames(
        'flex items-center self-stretch rounded-md border px-3 py-1 text-sm font-medium shadow-xs hover:bg-(--line-color-dark)/70 focus-visible:ring-2 focus-visible:outline-hidden',
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
});
