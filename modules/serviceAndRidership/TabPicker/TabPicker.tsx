import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useTabState, TabList, Tab } from 'reakit/Tab';

import styles from './TabPicker.module.css';

type MinimalItem<Value> = { value: Value; label: string };

type Props<Value> = {
  'aria-label': string;
  baseId: string;
  className?: string;
  items: MinimalItem<Value>[];
  onSelectValue: (v: Value) => unknown;
  style?: React.CSSProperties;
  tabClassName?: string;
  value: Value;
};

const getTabId = (baseId: string, value: string) => `${baseId}-${value}`;

export const TabPicker = <Value extends string>(props: Props<Value>) => {
  const {
    'aria-label': ariaLabel,
    baseId,
    className,
    items,
    onSelectValue,
    style = {},
    tabClassName,
    value,
  } = props;
  const tabState = useTabState({ selectedId: getTabId(baseId, value) });

  useEffect(() => {
    const selectedElement = document.querySelector(`#${tabState.selectedId}`);
    if (selectedElement) {
      onSelectValue(selectedElement.getAttribute('data-value') as Value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabState.selectedId]);

  return (
    <TabList
      {...tabState}
      style={style}
      className={classNames(styles.tabList, className)}
      aria-label={ariaLabel}
      as="div"
    >
      {items.map(({ value, label }) => {
        return (
          <Tab
            {...tabState}
            id={getTabId(baseId, value)}
            className={classNames(styles.tab, tabClassName)}
            key={value}
            as="div"
            data-value={value}
          >
            <span>{label}</span>
          </Tab>
        );
      })}
    </TabList>
  );
};
