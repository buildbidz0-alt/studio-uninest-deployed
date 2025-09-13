

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, UserCog, LogOut, Settings, Heart, LayoutGrid, Info, MessageSquare, Users, Trophy, Briefcase, User as UserIcon, LifeBuoy } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/social', label: 'Social', icon: Users, roles: ['student', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/notes', label: 'Study Hub', icon: BookOpen, roles: ['student', 'vendor', 'guest', 'admin'] },
];

const secondaryNavItems = [
  { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/support', label: 'Support', icon: LifeBuoy, roles: ['student', 'vendor', 'admin'] },
];

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: any): UserRole {
    if (!user) return 'guest';
    return user.user_metadata?.role || 'student';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut, role } = useAuth();
  const { setOpenMobile } = useSidebar();
  const userRole = role;

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const renderNavItems = (items: typeof mainNavItems) => {
    return items
      .filter(item => item.roles.includes(userRole))
      .map(item => {
        let isActive = pathname.startsWith(item.href) && item.href !== '/';
        if (item.href === '/social') {
            isActive = pathname.startsWith('/social') || pathname.startsWith('/feed') || pathname.startsWith('/chat');
        }
        return (
            <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                className="font-headline"
                onClick={handleLinkClick}
            >
                <Link href={item.href}>
                <item.icon className="size-5" />
                <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        )
      });
  };
  
  return (
    <SidebarMenu>
       <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === '/'}
            className="font-headline"
            onClick={handleLinkClick}
          >
            <Link href={'/'}>
              <Home className="size-5" />
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

      {renderNavItems(mainNavItems.filter(i => i.href !== '/'))}
      

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {renderNavItems(secondaryNavItems)}


        <div className='flex-grow' />

         <SidebarMenuItem>
            <SidebarMenuButton asChild variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 font-bold border-amber-200 dark:border-amber-800 border-2" onClick={handleLinkClick}>
                <Link href="/donate">
                    <Heart className="size-5" />
                    <span>Donate</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>

        {role === 'admin' && (
             <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className="font-headline"
                    onClick={handleLinkClick}
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
                    <SidebarMenuButton asChild isActive={pathname === '/settings'} className="font-headline" onClick={handleLinkClick}>
                         <Link href="/settings">
                            <Settings className="size-5" />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => { handleLinkClick(); signOut(); }} className="font-headline text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400">
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

  const profileLink = user ? `/profile/${user.user_metadata?.handle}` : '/login';

  const defaultNavItems = [
      { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
      { href: '/marketplace', label: 'Market', icon: ShoppingBag, roles: ['student', 'vendor', 'guest', 'admin'] },
      { href: '/social', label: 'Social', icon: Users, roles: ['student', 'guest', 'admin'] },
      { href: '/workspace', label: 'Work', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
      { href: profileLink, label: 'Profile', icon: 'avatar', roles: ['student', 'vendor', 'admin'] },
      { href: '/login', label: 'Login', icon: UserIcon, roles: ['guest'] },
    ];

  const getNavItems = () => {
    let items = defaultNavItems;
    if (pathname.startsWith('/social') || pathname.startsWith('/feed') || pathname.startsWith('/chat')) {
      items = [
        { href: '/feed', label: 'Feed', icon: Newspaper, roles: ['student', 'guest', 'admin'] },
        { href: '/chat', label: 'Messages', icon: MessageSquare, roles: ['student', 'guest', 'admin'] },
        { href: profileLink, label: 'Profile', icon: 'avatar', roles: ['student', 'admin'] },
        { href: '/login', label: 'Login', icon: UserIcon, roles: ['guest'] },
      ];
    }
    if (pathname.startsWith('/workspace')) {
      items = [
        { href: '/workspace/competitions', label: 'Competitions', icon: Trophy, roles: ['student', 'vendor', 'guest', 'admin'] },
        { href: '/workspace/internships', label: 'Internships', icon: Briefcase, roles: ['student', 'vendor', 'guest', 'admin'] },
        { href: profileLink, label: 'Profile', icon: 'avatar', roles: ['student', 'vendor', 'admin'] },
        { href: '/login', label: 'Login', icon: UserIcon, roles: ['guest'] },
      ];
    }
    return items.filter(item => item.roles.includes(role));
  };
  
  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map(item => {
          let isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

          if (item.label === 'Profile') {
            isActive = pathname.startsWith('/profile') || pathname.startsWith('/settings');
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {}}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-1 transition-colors",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.icon === 'avatar' ? (
                <Avatar className="size-6">
                  {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                  <AvatarFallback className="text-xs">
                    {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-4" />}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <item.icon className="size-5" />
              )}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
