import { usePathname } from 'next/navigation';
import type { LinkProps } from 'next/link';
import Link from 'next/link';
import type { ReactElement } from 'react';
import React, { useState, useEffect, Children } from 'react';

type ActiveLinkProps = LinkProps & {
  children: ReactElement;
  activeClassName: string;
  lambda: () => boolean;
};

export const ActiveLink = ({ children, activeClassName, lambda, ...props }: ActiveLinkProps) => {
  const pathname = usePathname() as string;

  const child = Children.only(children);
  const childClassName = child.props.className || '';
  const [className, setClassName] = useState(childClassName);

  useEffect(() => {
    const newClassName = lambda() ? `${childClassName} ${activeClassName}`.trim() : childClassName;

    if (newClassName !== className) {
      setClassName(newClassName);
    }
  }, [pathname, childClassName, activeClassName, setClassName, className, lambda]);

  return (
    <Link {...props} legacyBehavior={true}>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};
