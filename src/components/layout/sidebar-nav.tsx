'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, FileText, LayoutDashboard, Info } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Social Feed', icon: Newspaper },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/notes', label: 'Notes Hub', icon: FileText },
  { href: '/vendor/dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard },
  { href: '/about', label: 'About Us', icon: Info },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
          >
            <a href={item.href}>
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
