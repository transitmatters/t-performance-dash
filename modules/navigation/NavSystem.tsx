import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUsers, faWarning } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../common/i18n';
import { Link } from '../../common/components/general/Link';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../../common/components/ui/sidebar';
import { useDelimitatedRoute } from '../../common/utils/router';

const SYSTEM_ITEMS = [
  { page: 'landing', name: i18n.t('pages.landing.name'), href: '/', icon: faHouse },
  {
    page: 'systemSlowzones',
    name: i18n.t('pages.systemSlowzones.name'),
    href: '/system/slowzones',
    icon: faWarning,
  },
  {
    page: 'systemServiceAndRidership',
    name: i18n.t('pages.systemServiceAndRidership.name'),
    href: '/system/ridership',
    icon: faUsers,
  },
];

interface NavSystemProps {
  close?: () => void;
}

export const NavSystem: React.FC<NavSystemProps> = ({ close }) => {
  const { t } = useTranslation('navigation');
  const { page } = useDelimitatedRoute();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('system')}</SidebarGroupLabel>
      <SidebarMenu>
        {SYSTEM_ITEMS.map((item) => (
          <SidebarMenuItem key={item.page}>
            <SidebarMenuButton asChild isActive={page === item.page} tooltip={item.name}>
              <Link href={item.href} onClick={() => close?.()}>
                <FontAwesomeIcon
                  icon={item.icon}
                  className="hidden size-4 group-data-[collapsible=icon]:block"
                />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
