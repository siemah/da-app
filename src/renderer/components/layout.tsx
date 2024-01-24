import { ComponentProps } from 'react';
import { Helmet } from 'react-helmet';
import { cn } from '../lib/utils';
import Sidebar from './sidebar';

interface LayoutProps extends ComponentProps<'main'> {
  title: string;
}

export default function Layout({ className, title, children }: LayoutProps) {
  return (
    <main
      className={cn(
        `flex flex-row gap-8 bg-gradient-to-b from-[#be7097] to-[#3d4076]`,
        className,
      )}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Sidebar className="min-w-64 min-h-lvh" />
      {children}
    </main>
  );
}
