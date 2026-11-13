import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';
import { CONTROL_SURFACE, FOCUS_RING_ON_SURFACE } from '../../styles/general';

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
  return (
    <button
      ref={ref}
      type="button"
      className={classNames(
        'flex items-center self-stretch rounded-md px-3 py-1 text-sm font-medium focus-visible:ring-offset-1',
        CONTROL_SURFACE,
        FOCUS_RING_ON_SURFACE,
        additionalClasses
      )}
      {...props}
    >
      {children}
    </button>
  );
});
