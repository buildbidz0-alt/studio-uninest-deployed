'use client';

import { usePathname } from 'next/navigation';
import { Newspaper, ShoppingBag, FileText, LayoutDashboard } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const navItems = [
  { href: '/feed', label: 'Social Feed', icon: Newspaper },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/notes', label: 'Notes Hub', icon: FileText },
  { href: '/vendor/dashboard', label: 'Vendor Dashboard', icon: LayoutDashboard },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
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
