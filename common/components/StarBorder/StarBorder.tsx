import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from 'react';

type StarBorderProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: ReactNode;
  color?: string;
  speed?: CSSProperties['animationDuration'];
};

export const StarBorder = <T extends ElementType = 'button'>({
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
      className={`relative inline-block overflow-hidden rounded-md py-px ${className}`}
      {...rest}
    >
      <div
        className="absolute right-[-250%] bottom-[-11px] z-0 h-[50%] w-[300%] animate-star-movement-bottom rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="absolute top-[-10px] left-[-250%] z-0 h-[50%] w-[300%] animate-star-movement-top rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="relative z-1">{children}</div>
    </Component>
  );
};
