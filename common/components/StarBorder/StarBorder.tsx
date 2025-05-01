import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
};

export const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  color = 'white',
  speed = '6s',
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as ?? 'button';

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-md py-[1px] ${className}`}
      {...rest}
    >
      <div
        className="animate-star-movement-bottom absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="animate-star-movement-top absolute left-[-250%] top-[-10px] z-0 h-[50%] w-[300%] rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="z-1 relative">{children}</div>
    </Component>
  );
};
