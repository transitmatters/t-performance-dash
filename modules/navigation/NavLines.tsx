import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { Link } from '../../common/components/general/Link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../common/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '../../common/components/ui/sidebar';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { lineColorVar } from '../../common/styles/general';
import { useDelimitatedRoute } from '../../common/utils/router';
import { NavPageItems } from './NavPageItems';
import { NAV_LINES, hrefForLine, lineIcon, pagesForLine } from './lineNav';

interface NavLinesProps {
  close?: () => void;
}

export const NavLines = ({ close }: NavLinesProps) => {
  const route = useDelimitatedRoute();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Lines</SidebarGroupLabel>
      <SidebarMenu>
        {NAV_LINES.map((line) => {
          const lineObject = LINE_OBJECTS[line];
          const isActive = route.line === line;
          return (
            <Collapsible key={line} asChild open={isActive} className="group/line">
              <SidebarMenuItem
                style={lineColorVar(line)}
                className={classNames('rounded-md', isActive && 'bg-(--line-color)/10')}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    tooltip={lineObject.name}
                    style={lineColorVar(line)}
                    className={classNames(
                      'group-data-[collapsible=icon]:justify-center hover:bg-transparent',
                      isActive && 'font-semibold'
                    )}
                  >
                    <Link
                      href={hrefForLine(line, route)}
                      aria-current={isActive ? true : undefined}
                      onClick={() => close?.()}
                    >
                      {/* Shown only in the rail, where there's no room for the line's name. */}
                      <FontAwesomeIcon
                        icon={lineIcon(line)}
                        className="hidden size-4 text-(--line-color) group-data-[collapsible=icon]:block"
                      />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {lineObject.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mx-0 ml-[1.05rem] border-l border-(--line-color)/40 pr-1 pl-4">
                    <NavPageItems pages={pagesForLine(line)} close={close} />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};
