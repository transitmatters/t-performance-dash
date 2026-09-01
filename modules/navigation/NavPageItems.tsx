import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import type { PageMetadata } from '../../common/constants/pages';
import { SidebarMenuSubButton, SidebarMenuSubItem } from '../../common/components/ui/sidebar';
import { LINE_COLORS } from '../../common/constants/colors';
import { lineColorVar } from '../../common/styles/general';
import { readableOn } from '../../common/utils/general';
import {
  useDelimitatedRoute,
  useGenerateHref,
  useHandleConfigStore,
} from '../../common/utils/router';

interface NavPageItemsProps {
  pages: PageMetadata[];
  close?: () => void;
}

/**
 * Renders a group of pages as sidebar sub-items. Pages the current line doesn't support are
 * rendered as disabled rather than hidden, so the metrics stay in the same place per line.
 */
export const NavPageItems: React.FC<NavPageItemsProps> = ({ pages, close }) => {
  const { line, page, query, linePath } = useDelimitatedRoute();
  const handlePageConfig = useHandleConfigStore();
  const generateHref = useGenerateHref();
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';

  return (
    <>
      {pages.map((tab) => {
        const enabled = line ? tab.lines.includes(line) : true;
        const selected = page === tab.key;

        if (!enabled) {
          return (
            <SidebarMenuSubItem key={tab.key}>
              <SidebarMenuSubButton
                aria-disabled
                className="text-sidebar-foreground/40 pointer-events-none"
              >
                <span className="truncate">{tab.name}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuSubItem key={tab.key}>
            <SidebarMenuSubButton
              asChild
              style={lineColorVar(line)}
              className={classNames(
                selected
                  ? classNames(
                      'bg-(--line-color) font-semibold hover:bg-(--line-color)',
                      needsDarkText
                        ? 'text-stone-900 hover:text-stone-900'
                        : 'text-white hover:text-white'
                    )
                  : 'text-sidebar-foreground/70'
              )}
            >
              <Link
                href={generateHref(tab, page, query, linePath)}
                aria-current={selected ? 'page' : undefined}
                onClick={() => {
                  handlePageConfig(tab);
                  close?.();
                }}
              >
                <span className="truncate">{tab.name}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </>
  );
};
