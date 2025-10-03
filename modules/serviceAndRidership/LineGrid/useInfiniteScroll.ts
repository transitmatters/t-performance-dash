import { useEffect } from 'react';

type Options = {
  element: undefined | null | HTMLElement;
  onRequestMoreItems: undefined | null | (() => unknown);
  enabled?: boolean;
  scrollTolerance?: number;
};

const isScrolledToBottom = (element: HTMLElement, tolerance: number) => {
  return element.scrollHeight - element.scrollTop - tolerance <= element.clientHeight;
};

export const useInfiniteScroll = (options: Options) => {
  const { element, enabled, onRequestMoreItems, scrollTolerance = 0 } = options;

  useEffect(() => {
    if (element && enabled && onRequestMoreItems) {
      const measureElement = () => {
        if (element && enabled && isScrolledToBottom(element, scrollTolerance)) {
          onRequestMoreItems();
        }
      };
      measureElement();
      const target = element === document.documentElement ? window : element;
      target.addEventListener('scroll', measureElement);
      return () => target.removeEventListener('scroll', measureElement);
    }
    return () => {};
  }, [element, enabled, scrollTolerance, onRequestMoreItems]);
};
