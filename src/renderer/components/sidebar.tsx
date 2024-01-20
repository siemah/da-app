import { ComponentProps } from 'react';
import {
  IoNotificationsOutline,
  IoTimeOutline,
  IoRainyOutline,
  IoNewspaperOutline,
  IoVideocamOutline,
  IoHomeOutline,
  IoDocumentsOutline,
  IoBusinessOutline,
} from 'react-icons/io5';
import { cn } from '@/renderer/lib/utils';
import NavItem from '@/renderer/components/nav-item';

const sidebarMenus = [
  {
    items: [
      {
        icon: IoHomeOutline,
        label: 'Home',
        to: '/',
      },
    ],
  },
  {
    label: 'Works',
    items: [
      {
        icon: IoDocumentsOutline,
        label: 'Notes',
        to: '/notes',
      },
      {
        icon: IoBusinessOutline,
        label: 'Clients',
        to: '/clients',
      },
    ],
  },
  {
    label: 'Entertainment',
    items: [
      {
        icon: IoNewspaperOutline,
        label: 'News',
        to: '/news',
      },
      {
        icon: IoVideocamOutline,
        label: 'Movies/tv shows',
        to: '/movies-tv-shows',
      },
    ],
  },
  {
    label: 'Schedules',
    items: [
      {
        icon: IoTimeOutline,
        label: 'Prayers',
        to: '/prayers',
      },
      {
        icon: IoNotificationsOutline,
        label: 'Rendez-vous',
        to: '/rendez-vous',
      },
      {
        icon: IoRainyOutline,
        label: 'Weather',
        to: '/weather',
      },
    ],
  },
];

export default function Sidebar({ className = '' }: ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        `navbar-container flex flex-col gap-4 pt-8 px-4 bg-white bg-opacity-5 rounded-tr-2xl rounded-br-2xl shadow-xl`,
        className,
      )}
    >
      {sidebarMenus.map((menu) => (
        <div
          className="flex flex-col gap-2"
          key={`sidebar-submenu-container-${menu.label}`}
        >
          {!!menu.label && (
            <h4 className="text-white text-opacity-60 px-4 text-sm capitalize">
              {menu.label}
            </h4>
          )}
          <ul className="navbar-submenu flex flex-col">
            {menu.items.map((item) => (
              <NavItem to={item.to} key={`sidebar-menu-${item.to}`}>
                <item.icon className="h-5 w-5 text-white text-opacity-70" />
                <span className="flex-1">{item.label}</span>
              </NavItem>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
