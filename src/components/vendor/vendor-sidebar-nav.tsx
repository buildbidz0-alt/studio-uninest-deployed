
'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Settings, Library, Utensils, Bed, Laptop, MessageSquare } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';

const generalNavItems = [
  { href: '/vendor/products', label: 'All Products', icon: Package },
  { href: '/vendor/orders', label: 'All Orders', icon: ShoppingCart },
  { href: '/chat', label: 'Messages', icon: MessageSquare },
];

const categoryDashboards = [
    { id: "library", label: "Library Hub", icon: Library },
    { id: "food mess", label: "Food Mess Hub", icon: Utensils },
    { id: "hostels", label: "Hostel Hub", icon: Bed },
    { id: "cybercafe", label: "Cybercafé Hub", icon: Laptop },
];


export function VendorSidebarNav() {
  const pathname = usePathname();
  const { vendorCategories } = useAuth();
  
  const vendorSpecificDashboards = categoryDashboards.filter(dash => vendorCategories.includes(dash.id));

  return (
    <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/vendor/dashboard'}
          >
            <Link href="/vendor/dashboard">
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {vendorSpecificDashboards.length > 0 && (
            <>
                <SidebarMenuItem>
                    <Separator className="my-2" />
                </SidebarMenuItem>
                <li className="px-4 py-2 text-xs font-semibold text-muted-foreground">Service Hubs</li>
                {vendorSpecificDashboards.map(item => (
                     <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === `/vendor/dashboard/${item.id.replace(' ', '-')}`}
                        >
                            <Link href={`/vendor/dashboard/${item.id.replace(' ', '-')}`}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                    <Separator className="my-2" />
                </SidebarMenuItem>
            </>
        )}

      {generalNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
       <div className='flex-grow' />
       <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/settings')}>
                <Link href="/vendor/settings">
                    <Settings className="size-4" />
                    <span>Settings</span>
                </Link>
            </SidebarMenuButton>
       </SidebarMenuItem>
    </SidebarMenu>
  );
}
