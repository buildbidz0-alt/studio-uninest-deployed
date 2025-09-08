
'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, FileText, LayoutDashboard, Info, Settings, Heart, Briefcase, Trophy } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest'] },
  { href: '/feed', label: 'Social Feed', icon: Newspaper, roles: ['student', 'vendor', 'guest'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student'] },
  { href: '/notes', label: 'Notes Hub', icon: FileText, roles: ['student', 'vendor', 'guest'] },
  { href: '/workspace', label: 'Workspace', icon: Briefcase, roles: ['student'] },
  { href: '/donate', label: 'Donate', icon: Heart, roles: ['student', 'vendor', 'guest'] },
  { href: '/vendor/dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard, roles: ['vendor'] },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['student', 'vendor'] },
    { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest'] },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const { setOpenMobile } = useSidebar();

  const userRole = user ? role : 'guest';

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  const filteredBottomNavItems = bottomNavItems.filter(item => item.roles.includes(userRole));

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')}
            onClick={handleLinkClick}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

        <div className='flex-grow' />

        {filteredBottomNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                onClick={handleLinkClick}
            >
                <Link href={item.href}>
                <item.icon className="size-4" />
                <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        ))}
    </SidebarMenu>
  );
}
