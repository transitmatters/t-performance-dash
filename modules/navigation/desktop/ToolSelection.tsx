import { Tab } from '@headlessui/react';
import { useRouter } from 'next/router';
import React from 'react';
import classNames from 'classnames';
import { useDelimitatedRoute } from '../../../common/utils/router';

export const ToolSelection = ({ toolItems }) => {
  const { linePath } = useDelimitatedRoute();
  const router = useRouter();
  return (
    <Tab.Group
      onChange={(index) => {
        router.push({ pathname: `/${linePath}${toolItems[index].path}` });
      }}
    >
      <Tab.List className="flex flex-col gap-1">
        {toolItems.map((toolItem) => {
          return (
            <Tab key={toolItem.key}>
              {({ selected }) => (
                <div
                  className={classNames(
                    'border bg-white bg-opacity-0 py-2 hover:bg-opacity-80 hover:text-black',
                    selected ? 'bg-opacity-90 text-black' : 'text-white',
                    toolItem.sub && 'ml-4 border-0 pl-1 text-left text-sm'
                  )}
                >
                  <p>{toolItem.name}</p>
                </div>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};
