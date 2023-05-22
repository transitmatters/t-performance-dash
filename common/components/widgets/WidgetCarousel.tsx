import { faCircleArrowLeft, faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Carousel } from 'flowbite-react';
import React from 'react';
interface WidgetCarouselProps {
  children: React.ReactNode;
}

export const WidgetCarousel: React.FC<WidgetCarouselProps> = ({ children }) => {
  return (
    <div className="flex h-8 w-full justify-start lg:h-32 lg:w-40">
      <Carousel
        slide={false}
        theme={{
          root: {
            leftControl:
              'absolute top-0 left-0 flex h-full justify-center items-end w-5 pl-4 focus:outline-none',
            rightControl:
              'absolute top-0 right-0 flex h-full justify-center items-end w-5 pr-4 focus:outline-none',
          },
        }}
        indicators={false}
        leftControl={
          <FontAwesomeIcon
            icon={faCircleArrowLeft}
            className="text-stone-300 hover:text-stone-700"
            size="lg"
          />
        }
        rightControl={
          <FontAwesomeIcon
            icon={faCircleArrowRight}
            className="text-stone-300 hover:text-stone-700"
            size="lg"
          />
        }
      >
        {children}
      </Carousel>
    </div>
  );
};
