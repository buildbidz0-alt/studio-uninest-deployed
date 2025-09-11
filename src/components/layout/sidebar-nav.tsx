

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, Armchair, UserCog, LogOut, Settings, Heart, LayoutGrid, Info } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const navItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/feed', label: 'Feed', icon: Newspaper, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/notes', label: 'Study Hub', icon: BookOpen, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/donate', label: 'Donate', icon: Heart, roles: ['student', 'vendor', 'guest', 'admin'] },
];

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: any): UserRole {
    if (!user) return 'guest';
    return user.user_metadata?.role || 'student';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const role = getRole(user);

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="font-headline"
          >
            <Link href={item.href}>
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

        <div className='flex-grow' />

        {role === 'admin' && (
             <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className="font-headline"
                >
                    <Link href="/admin/dashboard">
                    <UserCog className="size-5" />
                    <span>Admin Panel</span>
                    </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
        )}
        
        {user && (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'} className="font-headline">
                         <Link href="/settings">
                            <Settings className="size-5" />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={signOut} className="font-headline text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400">
                        <LogOut className="size-5" />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </>
        )}
    </SidebarMenu>
  );
}


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = getRole(user);

  const mobileNavItems = [
      { href: '/', label: 'Home', icon: Home },
      { href: '/marketplace', label: 'Market', icon: ShoppingBag },
      { href: '/donate', label: 'Donate', icon: Heart },
      { href: '/workspace', label: 'Workspace', icon: LayoutGrid },
      { href: '/profile', label: 'Profile', icon: 'avatar' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
        <div className="h-full w-full grid grid-cols-5">
            {mobileNavItems.map(item => {
                const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
                return (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors",
                            isActive ? "primary-gradient bg-clip-text text-transparent font-bold" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        {item.icon === 'avatar' ? (
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center",
                                isActive && "primary-gradient p-0.5"
                            )}>
                                <Avatar className="w-full h-full">
                                    {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                                    <AvatarFallback className="text-xs">
                                        {user ? user.email?.[0].toUpperCase() : 'G'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <item.icon className="size-6" />
                        )}
                        <span className="text-xs font-label">{item.label}</span>
                    </Link>
                )
            })}
        </div>
    </nav>
  )
}
