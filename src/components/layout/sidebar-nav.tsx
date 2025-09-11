
'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, FileText, LayoutDashboard, Info, Settings, Heart, Briefcase, Trophy, UserCog, MessageSquare, Package, Armchair } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/feed', label: 'Social Feed', icon: Newspaper, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/chat', label: 'Messages', icon: MessageSquare, roles: ['student', 'vendor', 'admin'] },
  { href: '/notes', label: 'Notes Hub', icon: FileText, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: Briefcase, roles: ['student', 'guest', 'admin'] },
  { href: '/booking', label: 'Seat Booking', icon: Armchair, roles: ['student', 'guest', 'admin'] },
  { href: '/donate', label: 'Donate', icon: Heart, roles: ['student', 'vendor', 'guest', 'admin'] },
];

const vendorNavItems = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['vendor'] },
  { href: '/vendor/products', label: 'My Products', icon: Package, roles: ['vendor'] },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['student', 'vendor', 'admin'] },
    { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
]

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: User | null): UserRole {
    if (!user) return 'guest';
    // This logic can be expanded based on your app's needs
    return user.user_metadata?.role || 'student';
}

export function SidebarNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  
  const role = getRole(user);

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  const filteredVendorNavItems = vendorNavItems.filter(item => item.roles.includes(role));
  const filteredBottomNavItems = bottomNavItems.filter(item => item.roles.includes(role));

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

        {filteredVendorNavItems.length > 0 && <Separator className='my-2' />}
        
        {filteredVendorNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
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

        {role === 'admin' && (
             <SidebarMenuItem>
                <Separator className='my-2' />
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    onClick={handleLinkClick}
                >
                    <Link href="/admin/dashboard">
                    <UserCog className="size-4" />
                    <span>Admin Panel</span>
                    </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
        )}
        
        <Separator className='my-2' />

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
