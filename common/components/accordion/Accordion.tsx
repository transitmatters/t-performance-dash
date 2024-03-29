import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import React from 'react';

interface AccordionProps {
  contentList: {
    title: string;
    content: string | React.ReactNode;
  }[];
  size?: 'md' | 'lg';
}

export const Accordion: React.FC<AccordionProps> = ({ contentList, size = 'md' }) => {
  return (
    <div className="w-full">
      <div className="mx-auto w-full rounded-2xl bg-white p-2">
        {contentList.map(({ title, content }) => {
          return (
            <Disclosure key={title} as={'div'}>
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                    <span className={size === 'lg' ? 'text-lg' : 'text-md'}>{title}</span>
                    <ChevronUpIcon className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`} />
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                    {content}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          );
        })}
      </div>
    </div>
  );
};
