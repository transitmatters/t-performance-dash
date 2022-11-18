import { usePathname } from 'next/navigation';
import Link, { LinkProps } from 'next/link';
import React, { useState, useEffect, ReactElement, Children } from 'react';

type ActiveLinkProps = LinkProps & {
  children: ReactElement;
  activeClassName: string;
};

export const ActiveLink = ({ children, activeClassName, ...props }: ActiveLinkProps) => {
  const pathname = usePathname();

  const child = Children.only(children);
  const childClassName = child.props.className || '';
  const [className, setClassName] = useState(childClassName);

  useEffect(() => {
    // Check if the router fields are updated client-side

    // Dynamic route will be matched via props.as
    // Static route will be matched via props.href
    const linkPathname = new URL((props.as || props.href) as string, location.href).pathname;

    // Using URL().pathname to get rid of query and hash
    const activePathname = new URL(pathname, location.href).pathname;

    const newClassName =
      linkPathname === activePathname
        ? `${childClassName} ${activeClassName}`.trim()
        : childClassName;

    if (newClassName !== className) {
      setClassName(newClassName);
    }
  }, [pathname, props.as, props.href, childClassName, activeClassName, setClassName, className]);

  return (
    <Link {...props} legacyBehavior={true}>
      {React.cloneElement(child, {
        className: className || null,
      })}
    </Link>
  );
};