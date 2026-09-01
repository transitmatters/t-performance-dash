import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUsers, faWarning } from '@fortawesome/free-solid-svg-icons';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../common/components/ui/sidebar';
import { useDelimitatedRoute } from '../../common/utils/router';

const SYSTEM_ITEMS = [
  { page: 'landing', name: 'Home', href: '/', icon: faHouse },
  { page: 'systemSlowzones', name: 'Slow zones', href: '/system/slowzones', icon: faWarning },
  {
    page: 'systemServiceAndRidership',
    name: 'Service & Ridership',
    href: '/system/ridership',
    icon: faUsers,
  },
];

interface NavSystemProps {
  close?: () => void;
}

export const NavSystem: React.FC<NavSystemProps> = ({ close }) => {
  const { page } = useDelimitatedRoute();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>System</SidebarGroupLabel>
      <SidebarMenu>
        {SYSTEM_ITEMS.map((item) => (
          <SidebarMenuItem key={item.page}>
            <SidebarMenuButton asChild isActive={page === item.page} tooltip={item.name}>
              <Link href={item.href} onClick={() => close?.()}>
                <FontAwesomeIcon icon={item.icon} className="size-4" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
