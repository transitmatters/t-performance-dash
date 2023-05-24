import React, { Children, cloneElement, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { ComponentProps, FC, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft, faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import { lineColorLightText, lineColorText } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

export interface WidgetCarouselProps {
  children: React.ReactNode;
}

export const WidgetCarousel: FC<WidgetCarouselProps> = ({ children }) => {
  const [activeItem, setActiveItem] = useState(0);
  const { line } = useDelimitatedRoute();

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
    <div className="relative lg:w-40">
      <div className="relative h-[38px] w-full overflow-hidden lg:h-[6.5rem] ">
        {items?.map((item, index) => (
          <div
            key={index}
            className={classNames(
              'absolute inset-0 transform transition-all duration-700 ease-in-out',
              {
                hidden:
                  index !== activeItem && !isBeforeActiveItem(index) && !isAfterActiveItem(index),
                '-translate-x-full opacity-0': isBeforeActiveItem(index),
                'translate-x-full opacity-0': isAfterActiveItem(index),
              }
            )}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="absolute top-0 flex h-full w-full flex-row justify-between lg:relative lg:h-auto">
        <button
          className="group/button flex cursor-pointer items-center justify-center focus:outline-none lg:px-4"
          onClick={navigateTo(activeItem - 1)}
          type="button"
        >
          <FontAwesomeIcon
            icon={faCircleArrowLeft}
            className={`${lineColorLightText[line ?? 'DEFAULT']} bg-white  hover:${
              lineColorText[line ?? 'DEFAULT']
            }`}
            size="lg"
          />
        </button>
        <button
          className="group/button flex  cursor-pointer items-center justify-center focus:outline-none lg:px-4"
          onClick={navigateTo(activeItem + 1)}
          type="button"
        >
          <FontAwesomeIcon
            icon={faCircleArrowRight}
            className={`${lineColorLightText[line ?? 'DEFAULT']} bg-white hover:${
              lineColorText[line ?? 'DEFAULT']
            }`}
            size="lg"
          />
        </button>
      </div>
    </div>
  );
};
