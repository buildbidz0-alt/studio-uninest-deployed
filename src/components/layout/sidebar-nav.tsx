
'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, FileText, LayoutDashboard, Info, Settings, Heart } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home', icon: Home, admin: false },
  { href: '/feed', label: 'Social Feed', icon: Newspaper, admin: false },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, admin: false },
  { href: '/notes', label: 'Notes Hub', icon: FileText, admin: false },
  { href: '/donate', label: 'Donate', icon: Heart, admin: false },
  { href: '/vendor/dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard, admin: true },
  { href: '/settings', label: 'Settings', icon: Settings, admin: false },
  { href: '/about', label: 'About Us', icon: Info, admin: false },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.admin) return true;
    return user?.email === 'admin@uninest.com';
  });

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
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
