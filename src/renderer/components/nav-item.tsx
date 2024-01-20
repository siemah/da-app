import { ComponentProps } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/renderer/lib/utils';

type NavItemProps = ComponentProps<'li'> & Pick<NavLinkProps, 'to'>;

export default function NavItem({ className, to, children }: NavItemProps) {
  return (
    <li className={cn('navbar-item', className)}>
      <NavLink
        to={to}
        className="flex flex-row gap-4 items-center text-white text-semibold capitalize rounded-md px-4 py-2 text-sm [&.active]:bg-black [&.active]:bg-opacity-10 hover:bg-black hover:bg-opacity-10"
      >
        {children}
      </NavLink>
    </li>
  );
}
