import React, { Children, cloneElement, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { ComponentProps, FC, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';

export interface WidgetCarouselProps {
  children: React.ReactNode;
}

export const WidgetCarousel: FC<WidgetCarouselProps> = ({ children }) => {
  const [activeItem, setActiveItem] = useState(0);

  const items = useMemo(
    () =>
      Children.map(
        children as ReactElement<ComponentProps<'div'>>[],
        (child: ReactElement<ComponentProps<'div'>>) =>
          cloneElement(child, {
            className: classNames(
              child.props.className,
              'block absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2'
            ),
          })
      ),
    [children]
  );

  const navigateTo = useCallback(
    (item: number) => () => {
      item = (item + items.length) % items.length;
      setActiveItem(item);
    },
    [items.length]
  );

  const isAfterActiveItem = (item: number) =>
    item !== activeItem && (activeItem === items.length - 1 ? item === 0 : item - 1 === activeItem);
  const isBeforeActiveItem = (item: number) =>
    item !== activeItem && (activeItem === 0 ? item === items.length - 1 : item + 1 === activeItem);

  return (
    <div className="relative flex flex-row gap-1">
      <div className="flex items-center">
        <button
          className={classNames(
            'group/button flex cursor-pointer items-center justify-center rounded-md focus:outline-none lg:p-1'
          )}
          onClick={navigateTo(activeItem + 1)}
          type="button"
        >
          <FontAwesomeIcon
            icon={faChevronCircleDown}
            size="lg"
            className="text-stone-300 hover:text-stone-600"
          />
        </button>
      </div>
      <div className="relative h-8 w-full overflow-hidden lg:h-[3.25rem] ">
        {items?.map((item, index) => (
          <div
            key={index}
            className={classNames(
              'absolute inset-0 transform transition-all duration-700 ease-in-out',
              {
                hidden:
                  index !== activeItem && !isBeforeActiveItem(index) && !isAfterActiveItem(index),
                '-translate-y-full opacity-0': isBeforeActiveItem(index),
                'translate-y-full opacity-0': isAfterActiveItem(index),
              }
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
